import pytest
from datetime import datetime

from experiment_tracker.storage import Storage
from experiment_tracker.models import Run


@pytest.fixture
def storage(tmp_path):
    db_path = str(tmp_path / "test_experiments.db")
    return Storage(db_path=db_path)


@pytest.fixture
def make_run():
    def _make_run(**overrides):
        defaults = dict(
            run_id="test_run_001",
            timestamp=datetime(2026, 1, 1, 12, 0, 0),
            model_name="RandomForestClassifier",
            params={"n_estimators": 100, "max_depth": 5},
            metrics={"accuracy": 0.95},
            dataset_hash="abc123",
            dataset_shape=(100, 4),
            training_time=0.25,
            dataset_name="iris",
        )
        defaults.update(overrides)
        return Run(**defaults)
    return _make_run