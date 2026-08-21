import pytest
import numpy as np
import pandas as pd

from sklearn.datasets import load_iris, load_wine
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

from experiment_tracker.decorator import get_dataset_hash, infer_dataset_signature, track_run
from experiment_tracker.storage import Storage


@pytest.fixture
def tracked_storage(tmp_path, monkeypatch):
    db_path = str(tmp_path / "decorator_test.db")
    monkeypatch.setattr("experiment_tracker.decorator.Storage", lambda: Storage(db_path=db_path))
    return Storage(db_path=db_path)


def test_simple_return_automatically_captures_full_dataset(tracked_storage):
    @track_run
    def train():
        iris = load_iris()
        X, y = iris.data, iris.target
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        model = RandomForestClassifier(n_estimators=5, random_state=42)
        model.fit(X_train, y_train)
        return model, X_test, y_test

    train()
    run = tracked_storage.get_all_runs()[0]
    assert run["dataset_name"] == "Dataset 1"
    assert run["dataset_shape"] == (150, 4)
    assert len(run["dataset_hash"]) == 64


def test_metrics_are_auto_computed_when_not_provided(tracked_storage):
    @track_run
    def train():
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2, random_state=42)
        model = RandomForestClassifier(n_estimators=10, random_state=42)
        model.fit(X_train, y_train)
        return model, X_test, y_test

    train()
    runs = tracked_storage.get_all_runs()
    assert len(runs) == 1
    assert "accuracy" in runs[0]["metrics"]
    assert 0.0 <= runs[0]["metrics"]["accuracy"] <= 1.0


def test_explicit_metrics_dict_is_respected(tracked_storage):
    @track_run
    def train():
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2)
        model = RandomForestClassifier(n_estimators=5)
        model.fit(X_train, y_train)
        return model, X_test, y_test, {"accuracy": 0.777, "f1": 0.5}

    train()
    metrics = tracked_storage.get_all_runs()[0]["metrics"]
    assert metrics["accuracy"] == 0.777
    assert metrics["f1"] == 0.5


def test_regressor_gets_r2_score_not_accuracy(tracked_storage):
    @track_run
    def train():
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2)
        model = LinearRegression()
        model.fit(X_train, y_train)
        return model, X_test, y_test

    train()
    metrics = tracked_storage.get_all_runs()[0]["metrics"]
    assert "r2_score" in metrics
    assert "accuracy" not in metrics


def test_bare_model_return_does_not_crash(tracked_storage):
    @track_run
    def train():
        iris = load_iris()
        model = RandomForestClassifier(n_estimators=5)
        model.fit(iris.data, iris.target)
        return model

    train()
    run = tracked_storage.get_all_runs()[0]
    assert run["dataset_shape"] is None
    assert run["dataset_hash"] is None
    assert run["dataset_name"] is None
    assert run["metrics"] == {}


def test_run_ids_never_collide_across_rapid_calls(tracked_storage):
    @track_run
    def train():
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2)
        model = DecisionTreeClassifier()
        model.fit(X_train, y_train)
        return model, X_test, y_test

    for _ in range(10):
        train()

    runs = tracked_storage.get_all_runs()
    run_ids = [run["run_id"] for run in runs]
    assert len(run_ids) == 10
    assert len(set(run_ids)) == 10


def test_dataset_name_is_automatically_inferred_and_full_dataset_hash_is_stable(tracked_storage):
    @track_run
    def train_scaled():
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2, random_state=42)
        scaler = StandardScaler()
        X_train_s = scaler.fit_transform(X_train)
        X_test_s = scaler.transform(X_test)
        model = LogisticRegression(max_iter=1000)
        model.fit(X_train_s, y_train)
        return model, X_test_s, y_test, None, None, (iris.data, iris.target)

    @track_run
    def train_unscaled():
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.3, random_state=99)
        model = DecisionTreeClassifier()
        model.fit(X_train, y_train)
        return model, X_test, y_test, None, None, (iris.data, iris.target)

    train_scaled()
    train_unscaled()
    runs = tracked_storage.get_all_runs()
    assert len(runs) == 2
    assert runs[0]["dataset_name"] == "Dataset 1"
    assert runs[1]["dataset_name"] == "Dataset 1"
    assert runs[0]["dataset_hash"] == runs[1]["dataset_hash"]


def test_two_different_known_datasets_are_distinguished(tracked_storage):
    @track_run
    def train_iris():
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2)
        model = RandomForestClassifier(n_estimators=5)
        model.fit(X_train, y_train)
        return model, X_test, y_test

    @track_run
    def train_wine():
        wine = load_wine()
        X_train, X_test, y_train, y_test = train_test_split(wine.data, wine.target, test_size=0.2)
        model = RandomForestClassifier(n_estimators=5)
        model.fit(X_train, y_train)
        return model, X_test, y_test

    train_iris()
    train_wine()
    runs = tracked_storage.get_all_runs()
    assert runs[0]["dataset_hash"] != runs[1]["dataset_hash"]
    assert {run["dataset_name"] for run in runs} == {"Dataset 1", "Dataset 2"}


def test_explicit_dataset_name_is_respected(tracked_storage):
    @track_run
    def train():
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2)
        model = RandomForestClassifier(n_estimators=5)
        model.fit(X_train, y_train)
        return model, X_test, y_test, {}, "my_custom_iris_variant"

    train()
    assert tracked_storage.get_all_runs()[0]["dataset_name"] == "my_custom_iris_variant"


def test_unknown_custom_dataset_gets_no_friendly_name_but_still_groups():
    X = np.random.rand(50, 7)
    y = np.random.rand(50) * 100
    hash1, name1 = infer_dataset_signature(X, y)
    hash2, name2 = infer_dataset_signature(X, y)
    assert name1 is None
    assert name2 is None
    assert hash1 == hash2


def test_dataset_hash_is_full_sha256_and_changes_when_data_changes():
    X = np.array([[1, 2], [3, 4]], dtype=np.int64)
    y = np.array([0, 1], dtype=np.int64)
    first = get_dataset_hash(X, y)
    second = get_dataset_hash(X.copy(), y.copy())
    changed = get_dataset_hash(X, np.array([1, 0], dtype=np.int64))
    assert len(first) == 64
    assert first == second
    assert first != changed


def test_dataset_hash_changes_when_shape_changes():
    first = get_dataset_hash(np.array([[1, 2], [3, 4]], dtype=np.int64))
    changed = get_dataset_hash(np.array([[1, 2, 3, 4]], dtype=np.int64))
    assert first != changed


def test_dataset_hash_changes_when_dtype_changes():
    first = get_dataset_hash(np.array([1, 2, 3], dtype=np.int32))
    changed = get_dataset_hash(np.array([1, 2, 3], dtype=np.int64))
    assert first != changed


def test_dataset_hash_distinguishes_object_array_values():
    first = get_dataset_hash(np.array(["alpha", "beta"], dtype=object))
    changed = get_dataset_hash(np.array(["alpha", "gamma"], dtype=object))
    assert first != changed


def test_dataset_hash_is_stable_for_object_arrays():
    first = get_dataset_hash(np.array(["alpha", "beta"], dtype=object))
    second = get_dataset_hash(np.array(["alpha", "beta"], dtype=object))
    assert first == second


def test_dataframe_hash_changes_when_values_change():
    first = get_dataset_hash(pd.DataFrame({"a": [1, 2], "b": [3, 4]}))
    changed = get_dataset_hash(pd.DataFrame({"a": [1, 2], "b": [3, 5]}))
    assert first != changed


def test_dataframe_hash_changes_when_columns_change():
    first = get_dataset_hash(pd.DataFrame({"a": [1, 2], "b": [3, 4]}))
    changed = get_dataset_hash(pd.DataFrame({"x": [1, 2], "b": [3, 4]}))
    assert first != changed


def test_dataframe_hash_is_stable_for_equivalent_dataframes():
    first = get_dataset_hash(pd.DataFrame({"a": [1, 2], "b": [3, 4]}))
    second = get_dataset_hash(pd.DataFrame({"a": [1, 2], "b": [3, 4]}))
    assert first == second


def test_dataset_hash_changes_when_target_changes():
    X = np.array([[1, 2], [3, 4]], dtype=np.int64)
    first = get_dataset_hash(X, np.array([0, 1], dtype=np.int64))
    changed = get_dataset_hash(X, np.array([1, 1], dtype=np.int64))
    assert first != changed


def test_dataset_hash_changes_when_target_shape_changes():
    X = np.array([[1, 2], [3, 4]], dtype=np.int64)
    first = get_dataset_hash(X, np.array([0, 1], dtype=np.int64))
    changed = get_dataset_hash(X, np.array([[0], [1]], dtype=np.int64))
    assert first != changed


def test_full_dataset_payload_controls_dataset_hash_and_shape(tracked_storage):
    @track_run
    def train():
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2, random_state=42)
        model = RandomForestClassifier(n_estimators=5, random_state=42)
        model.fit(X_train, y_train)
        return model, X_test, y_test, None, None, (iris.data, iris.target)

    train()
    run = tracked_storage.get_all_runs()[0]
    assert run["dataset_shape"] == (150, 4)
    assert len(run["dataset_hash"]) == 64