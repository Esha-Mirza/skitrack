
import sqlite3
from experiment_tracker.storage import Storage


def test_save_and_retrieve_run(storage, make_run):
    run = make_run(run_id="run_a")
    assert storage.save_run(run) is True

    all_runs = storage.get_all_runs()
    assert len(all_runs) == 1
    assert all_runs[0]["run_id"] == "run_a"
    assert all_runs[0]["model_name"] == "RandomForestClassifier"


def test_get_specific_run(storage, make_run):
    storage.save_run(make_run(run_id="run_a"))
    storage.save_run(make_run(run_id="run_b"))

    found = storage.get_run("run_b")
    assert found is not None
    assert found["run_id"] == "run_b"

    missing = storage.get_run("does_not_exist")
    assert missing is None


def test_run_count(storage, make_run):
    assert storage.get_run_count() == 0
    storage.save_run(make_run(run_id="run_a"))
    storage.save_run(make_run(run_id="run_b"))
    assert storage.get_run_count() == 2


def test_delete_run(storage, make_run):
    storage.save_run(make_run(run_id="run_a"))
    assert storage.get_run_count() == 1

    assert storage.delete_run("run_a") is True
    assert storage.get_run_count() == 0


def test_delete_all_runs(storage, make_run):
    storage.save_run(make_run(run_id="run_a"))
    storage.save_run(make_run(run_id="run_b"))
    storage.save_run(make_run(run_id="run_c"))
    assert storage.get_run_count() == 3

    assert storage.delete_all_runs() is True
    assert storage.get_run_count() == 0


def test_duplicate_run_id_fails_gracefully(storage, make_run):
    storage.save_run(make_run(run_id="duplicate"))
    result = storage.save_run(make_run(run_id="duplicate"))
    assert result is False


def test_dataset_name_field_round_trips(storage, make_run):
    storage.save_run(make_run(run_id="run_a", dataset_name="wine"))
    run = storage.get_run("run_a")
    assert run["dataset_name"] == "wine"


def test_dataset_name_defaults_to_none(storage, make_run):
    storage.save_run(make_run(run_id="run_a", dataset_name=None))
    run = storage.get_run("run_a")
    assert run["dataset_name"] is None


def test_migration_adds_dataset_name_to_legacy_db(tmp_path):

    db_path = str(tmp_path / "legacy.db")

    conn = sqlite3.connect(db_path)
    conn.execute("""
        CREATE TABLE runs (
            id INTEGER PRIMARY KEY,
            run_id VARCHAR(50) UNIQUE NOT NULL,
            timestamp DATETIME NOT NULL,
            model_name VARCHAR(100) NOT NULL,
            params_json TEXT NOT NULL,
            metrics_json TEXT NOT NULL,
            dataset_hash VARCHAR(20) NOT NULL,
            dataset_shape VARCHAR(50) NOT NULL,
            training_time FLOAT NOT NULL
        )
    """)
    conn.execute("""
        INSERT INTO runs (run_id, timestamp, model_name, params_json, metrics_json,
                           dataset_hash, dataset_shape, training_time)
        VALUES ('legacy_run', '2026-01-01T00:00:00', 'OldModel', '{}', '{}',
                'oldhash', '(100, 4)', 0.5)
    """)
    conn.commit()
    conn.close()

    storage = Storage(db_path=db_path)
    runs = storage.get_all_runs()

    assert len(runs) == 1
    assert runs[0]["run_id"] == "legacy_run"
    assert runs[0]["dataset_name"] is None  

    from experiment_tracker.models import Run
    from datetime import datetime
    new_run = Run(
        run_id="new_run", timestamp=datetime.now(), model_name="NewModel",
        params={}, metrics={}, dataset_hash="newhash", dataset_shape=(50, 3),
        training_time=0.1, dataset_name="iris",
    )
    assert storage.save_run(new_run) is True
    assert storage.get_run_count() == 2