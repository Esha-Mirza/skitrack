
import pytest
from experiment_tracker import api as api_module

@pytest.fixture
def client(tmp_path, monkeypatch):
    db_path = str(tmp_path / "api_test.db")
    from experiment_tracker.storage import Storage
    monkeypatch.setattr(api_module, "storage", Storage(db_path=db_path))
    api_module.app.config["TESTING"] = True
    return api_module.app.test_client()


def test_get_runs_empty(client):
    response = client.get("/api/runs")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["count"] == 0
    assert data["data"] == []


def test_get_runs_returns_tracked_data(client, tmp_path):
    from experiment_tracker.models import Run
    from datetime import datetime

    run = Run(
        run_id="api_test_run", timestamp=datetime.now(), model_name="TestModel",
        params={"a": 1}, metrics={"accuracy": 0.9}, dataset_hash="hash1",
        dataset_shape=(50, 4), training_time=0.1, dataset_name="iris",
    )
    api_module.storage.save_run(run)

    response = client.get("/api/runs")
    data = response.get_json()
    assert data["count"] == 1
    assert data["data"][0]["run_id"] == "api_test_run"
    assert data["data"][0]["dataset_name"] == "iris"


def test_timestamp_is_iso_format_with_t_separator(client):
    from experiment_tracker.models import Run
    from datetime import datetime

    run = Run(
        run_id="ts_test", timestamp=datetime(2026, 1, 1, 12, 30, 45, 123000),
        model_name="M", params={}, metrics={}, dataset_hash="h",
        dataset_shape=(1, 1), training_time=0.1,
    )
    api_module.storage.save_run(run)

    response = client.get("/api/runs")
    ts = response.get_json()["data"][0]["timestamp"]
    assert "T" in ts  
    assert " " not in ts


def test_get_single_run_not_found(client):
    response = client.get("/api/runs/does_not_exist")
    assert response.status_code == 404
    assert response.get_json()["status"] == "error"


def test_get_single_run_found(client):
    from experiment_tracker.models import Run
    from datetime import datetime

    run = Run(
        run_id="findme", timestamp=datetime.now(), model_name="M",
        params={}, metrics={}, dataset_hash="h", dataset_shape=(1, 1),
        training_time=0.1,
    )
    api_module.storage.save_run(run)

    response = client.get("/api/runs/findme")
    assert response.status_code == 200
    assert response.get_json()["data"]["run_id"] == "findme"


def test_root_serves_dashboard_html(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"<div id=\"root\">" in response.data


def test_unknown_path_falls_back_to_index(client):
    response = client.get("/some/made/up/path")
    assert response.status_code == 200
    assert b"<div id=\"root\">" in response.data

def test_dashboard_uses_package_static_directory():
    import os
    assert os.path.basename(api_module.STATIC_DIR) == "dist" or os.path.basename(api_module.STATIC_DIR) == "static"
    if os.path.basename(api_module.STATIC_DIR) == "static":
        assert os.path.isfile(os.path.join(api_module.STATIC_DIR, "index.html"))
