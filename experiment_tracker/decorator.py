import hashlib
import json
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
            "data": [[_canonical_value(item) for item in row] for row in value.to_numpy(dtype=object).tolist()],
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
    if isinstance(result, tuple) and len(result) >= 6:
        dataset_payload = result[5]

        if isinstance(dataset_payload, tuple) and len(dataset_payload) == 2:
            return dataset_payload[0], dataset_payload[1]

    return X_test, y_test


def track_run(func: Callable) -> Callable:
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("_" * 60)
        print("\nStarting experiment tracking...\n")

        start_time = time.time()

        print("Running your training code...\n")
        print("_" * 60)

        result = func(*args, **kwargs)
        training_time = time.time() - start_time

        model = result[0] if isinstance(result, tuple) and len(result) >= 1 else result
        model_name = get_model_name(model)
        params = get_model_params(model)

        X_test = result[1] if isinstance(result, tuple) and len(result) >= 2 else None
        y_test = result[2] if isinstance(result, tuple) and len(result) >= 3 else None

        explicit_metrics = (
            result[3]
            if isinstance(result, tuple) and len(result) >= 4 and isinstance(result[3], dict)
            else None
        )

        metrics = (
            explicit_metrics
            if explicit_metrics is not None
            else compute_default_metrics(model, X_test, y_test)
        )

        explicit_dataset_name = (
            result[4]
            if isinstance(result, tuple) and len(result) >= 5 and isinstance(result[4], str)
            else None
        )

        dataset_X, dataset_y = _extract_dataset(result, X_test, y_test)

        if dataset_X is not None:
            dataset_hash, _ = infer_dataset_signature(dataset_X, dataset_y)
            dataset_shape = getattr(dataset_X, "shape", None)
        else:
            dataset_hash = None
            dataset_shape = None

        dataset_name = explicit_dataset_name

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
            print(f"Dataset name: {run.dataset_name} (explicit)")

        print(f"Parameters: {len(run.params)} parameters")

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
            storage = Storage()

            if storage.save_run(run):
                print(f"Saved to database: {storage.db_path}")
                print(f"Total runs in database: {storage.get_run_count()}")
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