import time
import hashlib
import json
from datetime import datetime
from functools import wraps
from typing import Any, Callable, Dict, Optional

from .models import Run           #For now using simple storage
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
    

    if hasattr(X, 'values'):  #pandas DataFrame
        data_str = str(X.values.tolist())
    else:  #numpy array
        data_str = str(X.tolist())
    
    if y is not None:
        if hasattr(y, 'values'):
            data_str += str(y.values.tolist())
        else:
            data_str += str(y.tolist())
    
    #Create hash
    return hashlib.md5(data_str.encode()).hexdigest()[:10]


def compute_default_metrics(model: Any, X_test, y_test) -> Dict[str, float]:
    """
    Best-effort metric computation when the tracked function doesn't supply
    an explicit metrics dict. Uses the model's own .score() so it works for
    any scikit-learn estimator, and labels the result sensibly based on
    whether the model is a classifier or regressor.
    """
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
        

        #Extract model from result return (model, X_test, y_test, [metrics]) or similar
        if isinstance(result, tuple) and len(result) >= 1:
            model = result[0]
        else:
            model = result
        
        #Extract model information
        model_name = get_model_name(model)
        params = get_model_params(model)
        
        #Extract dataset if available
        X_test = result[1] if isinstance(result, tuple) and len(result) >= 2 else None
        y_test = result[2] if isinstance(result, tuple) and len(result) >= 3 else None

        #Extract explicit metrics if the function returned a 4th item, e.g.
        #   return model, X_test, y_test, {"accuracy": 0.94, "f1": 0.91}
        #Otherwise fall back to auto-computing a metric via model.score().
        explicit_metrics = None
        if isinstance(result, tuple) and len(result) >= 4 and isinstance(result[3], dict):
            explicit_metrics = result[3]

        if explicit_metrics is not None:
            metrics = explicit_metrics
        else:
            metrics = compute_default_metrics(model, X_test, y_test)
        
        #Compute dataset hash
        if X_test is not None:
            dataset_hash = get_dataset_hash(X_test, y_test)
        else:
            dataset_hash = "unknown"
        
        #Create run object
        run = Run(
            run_id=datetime.now().strftime("%Y%m%d_%H%M%S"),
            timestamp=datetime.now(),
            model_name=model_name,
            params=params,
            metrics=metrics,
            dataset_hash=dataset_hash,
            dataset_shape=X_test.shape if X_test is not None else (0, 0),
            training_time=training_time
        )
        

    
        print("\n---Experiment tracked!---\n")
        print(f"Run ID: {run.run_id}")
        print(f"Model: {run.model_name}")
        print(f"Training time: {run.training_time:.2f}s")
        print(f"Dataset shape: {run.dataset_shape}")
        print(f"Dataset hash: {run.dataset_hash}")
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
    """
    Delete all tracked experiments from the database.

    Returns:
        True if the experiments were cleared successfully, False otherwise.
    """
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