import hashlib
import json
import sys
import time
import uuid
from datetime import datetime
from functools import wraps
from typing import Any, Callable, Dict

from .models import Run
from .storage import Storage


def get_model_name(model: Any) -> str:
    return model.__class__.__name__


def get_model_params(model: Any) -> Dict[str, Any]:
    if hasattr(model, "get_params"):
        return model.get_params()
    return {}


def _json_bytes(value: Any) -> bytes:
    return json.dumps(
        value,
        sort_keys=True,
        default=str,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")


def _canonical_bytes(value: Any) -> bytes:
    import numpy as np
    import pandas as pd

    if isinstance(value, pd.DataFrame):
        payload = {
            "type": "dataframe",
            "shape": list(value.shape),
            "columns": [_canonical_value(column) for column in value.columns.tolist()],
            "index": [_canonical_value(item) for item in value.index.tolist()],
            "dtypes": [str(dtype) for dtype in value.dtypes],
            "data": [
                [_canonical_value(item) for item in row]
                for row in value.to_numpy(dtype=object).tolist()
            ],
        }

        return _json_bytes(payload)

    if isinstance(value, pd.Series):
        payload = {
            "type": "series",
            "shape": list(value.shape),
            "name": _canonical_value(value.name),
            "index": [_canonical_value(item) for item in value.index.tolist()],
            "dtype": str(value.dtype),
            "data": [_canonical_value(item) for item in value.tolist()],
        }

        return _json_bytes(payload)

    array = np.asarray(value)

    if array.dtype.hasobject:
        payload = {
            "type": "ndarray",
            "shape": list(array.shape),
            "dtype": str(array.dtype),
            "data": _canonical_value(array.tolist()),
        }

        return _json_bytes(payload)

    header = _json_bytes(
        {
            "type": "ndarray",
            "shape": list(array.shape),
            "dtype": array.dtype.str,
        }
    )

    return header + b"\0DATA\0" + np.ascontiguousarray(array).tobytes(order="C")


def _canonical_value(value: Any) -> Any:
    import numpy as np

    if isinstance(value, np.ndarray):
        return {
            "type": "ndarray",
            "shape": list(value.shape),
            "dtype": value.dtype.str,
            "data": _canonical_value(value.tolist()),
        }

    if isinstance(value, np.generic):
        return value.item()

    if isinstance(value, dict):
        return {
            str(key): _canonical_value(item)
            for key, item in sorted(value.items(), key=lambda item: str(item[0]))
        }

    if isinstance(value, (list, tuple)):
        return [_canonical_value(item) for item in value]

    if isinstance(value, float):
        if np.isnan(value):
            return {"type": "float", "value": "nan"}

        if np.isposinf(value):
            return {"type": "float", "value": "inf"}

        if np.isneginf(value):
            return {"type": "float", "value": "-inf"}

    return value


def get_dataset_hash(X, y=None) -> str:
    digest = hashlib.sha256()
    digest.update(_canonical_bytes(X))
    digest.update(b"\0TARGET\0")

    if y is not None:
        digest.update(_canonical_bytes(y))

    return digest.hexdigest()


def infer_dataset_signature(X, y=None):
    return get_dataset_hash(X, y), None


def compute_default_metrics(model: Any, X_test, y_test) -> Dict[str, float]:
    if X_test is None or y_test is None or not hasattr(model, "score"):
        return {}

    try:
        from sklearn.base import is_classifier, is_regressor

        score = float(model.score(X_test, y_test))

        if is_classifier(model):
            return {"accuracy": score}

        if is_regressor(model):
            return {"r2_score": score}

        return {"score": score}

    except Exception as exc:
        print(f"Warning: Could not auto-compute metrics: {exc}")
        return {}


def _extract_dataset(result, X_test, y_test):
    """
    Preserve backwards compatibility with the optional explicit dataset
    payload, but the normal user API does not require it.
    """
    if isinstance(result, tuple) and len(result) >= 6:
        dataset_payload = result[5]

        if isinstance(dataset_payload, tuple) and len(dataset_payload) == 2:
            return dataset_payload[0], dataset_payload[1]

    return None, None


def _looks_like_dataset(value: Any) -> bool:
    """
    Determine whether a value is a plausible feature matrix/vector.
    This deliberately avoids depending on scikit-learn so datasets from
    pandas, NumPy, or other libraries can be tracked.
    """
    if value is None:
        return False

    if hasattr(value, "shape") and hasattr(value, "dtype"):
        return True

    if hasattr(value, "shape") and hasattr(value, "columns"):
        return True

    return False


def _looks_like_target(value: Any) -> bool:
    if value is None:
        return False

    if hasattr(value, "shape") and hasattr(value, "dtype"):
        return True

    if isinstance(value, (list, tuple)):
        return True

    return False


def _capture_function_locals(func: Callable, call):
    """
    Execute the decorated function while observing its return event.

    This allows the tracker to inspect the function's local variables
    without requiring the user to explicitly return the full dataset.

    Typical user code:

        X, y = dataset
        X_train, X_test, y_train, y_test = train_test_split(...)
        ...
        return model, X_test, y_test

    At the function's return event, X and y still contain the original
    full dataset, while X_test and y_test contain only the evaluation split.
    """
    captured = {}

    target_code = func.__code__
    previous_trace = sys.gettrace()

    def global_trace(frame, event, arg):
        if event == "call" and frame.f_code is target_code:
            return local_trace

        return None

    def local_trace(frame, event, arg):
        if event == "return":
            captured["locals"] = dict(frame.f_locals)

        return local_trace

    sys.settrace(global_trace)

    try:
        result = call()
    finally:
        sys.settrace(previous_trace)

    return result, captured.get("locals", {})


def _extract_dataset_from_locals(local_vars, X_test, y_test):
    """
    Automatically locate the full dataset from the experiment's local
    variables.

    Priority:
      1. X / y — the conventional and recommended pattern.
      2. Common full-dataset variable names.
      3. A dataset-like object exposing data/target.
    """

    # ---------------------------------------------------------
    # 1. Conventional X / y variables
    # ---------------------------------------------------------
    X = local_vars.get("X")
    y = local_vars.get("y")

    if _looks_like_dataset(X) and _looks_like_target(y):
        return X, y

    # ---------------------------------------------------------
    # 2. Common feature/target naming conventions
    # ---------------------------------------------------------
    feature_names = (
        "features",
        "data",
        "x",
        "inputs",
        "observations",
    )

    target_names = (
        "target",
        "targets",
        "labels",
        "label",
        "Y",
        "y",
    )

    for feature_name in feature_names:
        feature_value = local_vars.get(feature_name)

        if not _looks_like_dataset(feature_value):
            continue

        for target_name in target_names:
            target_value = local_vars.get(target_name)

            if _looks_like_target(target_value):
                return feature_value, target_value

    # ---------------------------------------------------------
    # 3. Dataset objects such as sklearn-style objects
    # ---------------------------------------------------------
    for value in local_vars.values():
        if value is None:
            continue

        data = getattr(value, "data", None)
        target = getattr(value, "target", None)

        if _looks_like_dataset(data) and _looks_like_target(target):
            return data, target

    return None, None


def _infer_dataset_name(dataset_hash: str, storage: Storage) -> str:
    """
    Assign a stable human-readable Dataset N label based on the dataset
    hash.

    The hash remains the true dataset identity. Dataset N is only the
    user-facing label.
    """
    if not dataset_hash:
        return None

    runs = storage.get_all_runs()

    existing_names = {}

    for run in runs:
        run_hash = run.get("dataset_hash")
        run_name = run.get("dataset_name")

        if run_hash and run_name:
            existing_names[run_hash] = run_name

    if dataset_hash in existing_names:
        return existing_names[dataset_hash]

    dataset_numbers = []

    for name in existing_names.values():
        if isinstance(name, str) and name.startswith("Dataset "):
            try:
                dataset_numbers.append(int(name.split(" ")[1]))
            except (ValueError, IndexError):
                pass

    next_number = max(dataset_numbers, default=0) + 1

    return f"Dataset {next_number}"


def track_run(func: Callable) -> Callable:
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("_" * 60)
        print("\nStarting experiment tracking...\n")

        start_time = time.perf_counter()

        print("Running your training code...\n")
        print("_" * 60)

        result, local_vars = _capture_function_locals(
            func,
            lambda: func(*args, **kwargs),
        )

        training_time = time.perf_counter() - start_time

        model = (
            result[0]
            if isinstance(result, tuple) and len(result) >= 1
            else result
        )

        model_name = get_model_name(model)
        params = get_model_params(model)

        X_test = (
            result[1]
            if isinstance(result, tuple) and len(result) >= 2
            else None
        )

        y_test = (
            result[2]
            if isinstance(result, tuple) and len(result) >= 3
            else None
        )

        explicit_metrics = (
            result[3]
            if isinstance(result, tuple)
            and len(result) >= 4
            and isinstance(result[3], dict)
            else None
        )

        metrics = (
            explicit_metrics
            if explicit_metrics is not None
            else compute_default_metrics(model, X_test, y_test)
        )

        explicit_dataset_name = (
            result[4]
            if isinstance(result, tuple)
            and len(result) >= 5
            and isinstance(result[4], str)
            else None
        )

        # -----------------------------------------------------
        # Dataset detection
        # -----------------------------------------------------

        # Preserve support for an explicitly supplied dataset payload.
        dataset_X, dataset_y = _extract_dataset(
            result,
            X_test,
            y_test,
        )

        # Automatically inspect function locals only when the
        # experiment returns evaluation data.
        #
        # A bare:
        #
        #     return model
        #
        # intentionally remains dataset-untracked for backwards
        # compatibility.
        has_evaluation_data = (
            isinstance(result, tuple)
            and len(result) >= 3
            and result[1] is not None
            and result[2] is not None
        )

        if dataset_X is None and has_evaluation_data:
            dataset_X, dataset_y = _extract_dataset_from_locals(
                local_vars,
                X_test,
                y_test,
            )

        if dataset_X is not None:
            dataset_hash, _ = infer_dataset_signature(
                dataset_X,
                dataset_y,
            )

            dataset_shape = getattr(dataset_X, "shape", None)
        else:
            dataset_hash = None
            dataset_shape = None

        # -----------------------------------------------------
        # Save run
        # -----------------------------------------------------

        storage = Storage()

        if explicit_dataset_name:
            dataset_name = explicit_dataset_name
            dataset_name_source = "explicit"
        elif dataset_hash:
            dataset_name = _infer_dataset_name(
                dataset_hash,
                storage,
            )
            dataset_name_source = "automatic"
        else:
            dataset_name = None
            dataset_name_source = None

        run = Run(
            run_id=f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}",
            timestamp=datetime.now(),
            model_name=model_name,
            params=params,
            metrics=metrics,
            dataset_hash=dataset_hash,
            dataset_shape=dataset_shape,
            dataset_name=dataset_name,
            training_time=training_time,
        )

        print("_" * 60)
        print("\n---Experiment tracked!---\n")
        print(f"Run ID: {run.run_id}")
        print(f"Model: {run.model_name}")
        print(f"Training time: {run.training_time:.2f}s")
        print(f"Dataset shape: {run.dataset_shape}")
        print(f"Dataset hash: {run.dataset_hash}")

        if run.dataset_name:
            print(
                f"Dataset name: {run.dataset_name}"
                + (
                    f" ({dataset_name_source})"
                    if dataset_name_source
                    else ""
                )
            )

        print(f"Hyperparameters: {len(run.params)} entries")

        if run.metrics:
            print(
                "Metrics: "
                + ", ".join(
                    f"{key}={value:.4f}"
                    for key, value in run.metrics.items()
                )
            )
        else:
            print("Metrics: (none captured)")

        print("_" * 60)

        try:
            if storage.save_run(run):
                print(f"Saved to database: {storage.db_path}")
                print(
                    f"Total runs in database: "
                    f"{storage.get_run_count()}"
                )
            else:
                print("Warning: Could not save to database")

        except Exception as exc:
            print(f"Warning: Database error: {exc}")

        print("_" * 60)

        return result

    return wrapper


def clear_experiments() -> bool:
    storage = Storage()
    count = storage.get_run_count()

    if count == 0:
        print("No experiments to clear.")
        return True

    success = storage.delete_all_runs()

    if success:
        print(f"Cleared {count} experiment(s) from the database.")
    else:
        print("Warning: Could not clear experiments.")

    return success