
import pytest
from sklearn.datasets import load_iris, load_wine
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeClassifier

from experiment_tracker.decorator import track_run, infer_dataset_signature
from experiment_tracker.storage import Storage


@pytest.fixture
def tracked_storage(tmp_path, monkeypatch):
    db_path = str(tmp_path / "decorator_test.db")
    monkeypatch.setattr("experiment_tracker.decorator.Storage", lambda: Storage(db_path=db_path))
    return Storage(db_path=db_path)


def test_metrics_are_auto_computed_when_not_provided(tracked_storage):
    @track_run
    def train():
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(
            iris.data, iris.target, test_size=0.2, random_state=42
        )
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
    assert run["dataset_shape"] == (0, 0)
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
    run_ids = [r["run_id"] for r in runs]
    assert len(run_ids) == 10
    assert len(set(run_ids)) == 10 


def test_dataset_auto_detected_despite_scaling_differences(tracked_storage):
    @track_run
    def train_scaled():
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2, random_state=42)
        scaler = StandardScaler()
        X_train_s = scaler.fit_transform(X_train)
        X_test_s = scaler.transform(X_test)
        model = LogisticRegression(max_iter=1000)
        model.fit(X_train_s, y_train)
        return model, X_test_s, y_test

    @track_run
    def train_unscaled():
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.3, random_state=99)
        model = DecisionTreeClassifier()
        model.fit(X_train, y_train)
        return model, X_test, y_test

    train_scaled()
    train_unscaled()

    runs = tracked_storage.get_all_runs()
    assert len(runs) == 2
    assert runs[0]["dataset_name"] == "iris"
    assert runs[1]["dataset_name"] == "iris"
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

    names = {r["dataset_name"] for r in tracked_storage.get_all_runs()}
    assert names == {"iris", "wine"}

def test_explicit_dataset_name_overrides_auto_detection(tracked_storage):
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
    import numpy as np
    X = np.random.rand(50, 7)
    y = np.random.rand(50) * 100  
    hash1, name1 = infer_dataset_signature(X, y)
    hash2, name2 = infer_dataset_signature(X, y)
    assert name1 is None
    assert hash1 == hash2 