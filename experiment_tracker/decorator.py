import time
import hashlib
import json
import uuid
from datetime import datetime
from functools import wraps
from typing import Any, Callable, Dict, Optional

from .models import Run          
from .storage import Storage

def get_model_name(model: Any) -> str:
 
    return model.__class__.__name__


def get_model_params(model: Any) -> Dict[str, Any]:

    if hasattr(model, 'get_params'):
        return model.get_params()
    return {}


def get_dataset_hash(X, y=None) -> str:

    import numpy as np
    import pandas as pd
    

    if hasattr(X, 'values'): 
        data_str = str(X.values.tolist())
    else:  
        data_str = str(X.tolist())
    
    if y is not None:
        if hasattr(y, 'values'):
            data_str += str(y.values.tolist())
        else:
            data_str += str(y.tolist())
    
    #Create hash
    return hashlib.md5(data_str.encode()).hexdigest()[:10]


# Known (n_features, n_classes) signatures for scikit-learn's built-in toy
# datasets, used to auto-recognize a friendly dataset name with zero effort
# from the user. n_classes is None for regression targets.
_KNOWN_DATASET_SIGNATURES = {
    (4, 3): 'iris',
    (13, 3): 'wine',
    (30, 2): 'breast_cancer',
    (64, 10): 'digits',
    (10, None): 'diabetes',
    (8, None): 'california_housing',
}


def infer_dataset_signature(X, y=None):
    """
    Builds a dataset identity from *schema* (feature count + class labels)
    rather than exact values. This is the key fix for a common failure
    mode: the same source dataset produces wildly different content
    whenever it's scaled, resampled, or split with a different
    random_state — but its feature count and class labels stay the same
    regardless. Returns (signature_hash, friendly_name_or_None).
    """
    try:
        n_features = X.shape[1] if hasattr(X, 'shape') and len(X.shape) > 1 else 1
    except Exception:
        n_features = 0

    class_labels = None
    n_classes = None
    if y is not None:
        try:
            y_values = list(y.values) if hasattr(y, 'values') else list(y)
            unique_vals = sorted(set(y_values), key=str)
        except Exception:
            y_values = []
            unique_vals = []

        # Treat as classification if there are few distinct values relative
        # to the sample count — otherwise it's a continuous regression target
        # and class labels aren't a meaningful identity signal.
        if 0 < len(unique_vals) <= max(20, int(0.1 * len(y_values))):
            n_classes = len(unique_vals)
            class_labels = tuple(str(v) for v in unique_vals)

    signature_payload = json.dumps(
        {'n_features': n_features, 'n_classes': n_classes, 'labels': class_labels},
        sort_keys=True, default=str
    )
    signature_hash = hashlib.md5(signature_payload.encode()).hexdigest()[:10]

    friendly_name = _KNOWN_DATASET_SIGNATURES.get((n_features, n_classes))

    return signature_hash, friendly_name


def compute_default_metrics(model: Any, X_test, y_test) -> Dict[str, float]:

    if X_test is None or y_test is None or not hasattr(model, 'score'):
        return {}

    try:
        from sklearn.base import is_classifier, is_regressor
        score = float(model.score(X_test, y_test))

        if is_classifier(model):
            return {'accuracy': score}
        if is_regressor(model):
            return {'r2_score': score}
        return {'score': score}
    except Exception as e:
        print(f"Warning: Could not auto-compute metrics: {e}")
        return {}


def track_run(func: Callable) -> Callable:

    @wraps(func)
    def wrapper(*args, **kwargs):
        print("=" * 60)
        print("Starting experiment tracking...\n")
  
        
        start_time = time.time()
        
        print("Running your training code...\n")
        result = func(*args, **kwargs)
        
        end_time = time.time()
        training_time = end_time - start_time
        
        if isinstance(result, tuple) and len(result) >= 1:
            model = result[0]
        else:
            model = result

        model_name = get_model_name(model)
        params = get_model_params(model)

        X_test = result[1] if isinstance(result, tuple) and len(result) >= 2 else None
        y_test = result[2] if isinstance(result, tuple) and len(result) >= 3 else None

        explicit_metrics = None
        if isinstance(result, tuple) and len(result) >= 4 and isinstance(result[3], dict):
            explicit_metrics = result[3]

        if explicit_metrics is not None:
            metrics = explicit_metrics
        else:
            metrics = compute_default_metrics(model, X_test, y_test)

        # Optional explicit dataset identity, e.g.:
        #   return model, X_test, y_test, metrics, "iris"
        # If not provided, we auto-detect it below — most users training a
        # model the normal way shouldn't have to name their dataset by hand.
        explicit_dataset_name = None
        if isinstance(result, tuple) and len(result) >= 5 and isinstance(result[4], str):
            explicit_dataset_name = result[4]

        if X_test is not None:
            # Schema-based signature (feature count + class labels) instead
            # of a raw content hash — this stays IDENTICAL for the same
            # source dataset regardless of feature scaling, resampling, or
            # which random_state train_test_split() used, which a raw
            # content hash cannot guarantee.
            dataset_hash, detected_name = infer_dataset_signature(X_test, y_test)
        else:
            dataset_hash = "unknown"
            detected_name = None

        dataset_name = explicit_dataset_name or detected_name
        
        run = Run(
            run_id=f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}",
            timestamp=datetime.now(),
            model_name=model_name,
            params=params,
            metrics=metrics,
            dataset_hash=dataset_hash,
            dataset_shape=X_test.shape if X_test is not None else (0, 0),
            dataset_name=dataset_name,
            training_time=training_time
        )
        

    
        print("\n---Experiment tracked!---\n")
        print(f"Run ID: {run.run_id}")
        print(f"Model: {run.model_name}")
        print(f"Training time: {run.training_time:.2f}s")
        print(f"Dataset shape: {run.dataset_shape}")
        print(f"Dataset hash: {run.dataset_hash}")
        if run.dataset_name:
            source = 'explicit' if explicit_dataset_name else 'auto-detected'
            print(f"Dataset name: {run.dataset_name} ({source})")
        print(f"Parameters: {len(run.params)} parameters")
        if run.metrics:
            print(f"Metrics: " + ", ".join(f"{k}={v:.4f}" for k, v in run.metrics.items()))
        else:
            print("Metrics: (none captured)")
        print()
        
        
        try:
            storage = Storage()
            if storage.save_run(run):
                print(f"Saved to database: {storage.db_path}")
                print(f"Total runs in database: {storage.get_run_count()}")
            else:
                print("Warning: Could not save to database")
        except Exception as e:
            print(f"Warning: Database error: {e}")
        
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