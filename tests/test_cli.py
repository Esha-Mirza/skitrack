
import pytest
from click.testing import CliRunner
from datetime import datetime

import sys
import experiment_tracker.cli  
cli_module = sys.modules["experiment_tracker.cli"]
from experiment_tracker.storage import Storage
from experiment_tracker.models import Run


@pytest.fixture
def runner(tmp_path, monkeypatch):
    db_path = str(tmp_path / "cli_test.db")
    test_storage = Storage(db_path=db_path)
    monkeypatch.setattr(cli_module, "storage", test_storage)
    return CliRunner(), test_storage


def _seed_run(storage, **overrides):
    defaults = dict(
        run_id="cli_run_1", timestamp=datetime(2026, 1, 1, 10, 0, 0),
        model_name="RandomForestClassifier", params={"n_estimators": 100},
        metrics={"accuracy": 0.9}, dataset_hash="hash1", dataset_shape=(100, 4),
        training_time=0.2, dataset_name="iris",
    )
    defaults.update(overrides)
    storage.save_run(Run(**defaults))

def test_list_with_no_experiments(runner):
    cli_runner, storage = runner
    result = cli_runner.invoke(cli_module.cli, ["list"])
    assert result.exit_code == 0
    assert "No experiments found" in result.output

def test_list_shows_tracked_runs(runner):
    cli_runner, storage = runner
    _seed_run(storage)
    result = cli_runner.invoke(cli_module.cli, ["list"])
    assert result.exit_code == 0
    assert "cli_run_1" in result.output
    assert "iris" in result.output  

def test_show_existing_run(runner):
    cli_runner, storage = runner
    _seed_run(storage)
    result = cli_runner.invoke(cli_module.cli, ["show", "cli_run_1"])
    assert result.exit_code == 0
    assert "RandomForestClassifier" in result.output
    assert "iris" in result.output
    assert "accuracy" in result.output


def test_show_missing_run(runner):
    cli_runner, storage = runner
    result = cli_runner.invoke(cli_module.cli, ["show", "does_not_exist"])
    assert result.exit_code == 0
    assert "No experiment found" in result.output


def test_stats_with_multiple_datasets(runner):
    cli_runner, storage = runner
    _seed_run(storage, run_id="r1", dataset_name="iris")
    _seed_run(storage, run_id="r2", dataset_name="iris")
    _seed_run(storage, run_id="r3", dataset_name="wine")

    result = cli_runner.invoke(cli_module.cli, ["stats"])
    assert result.exit_code == 0
    assert "Total experiments: 3" in result.output
    assert "iris" in result.output
    assert "wine" in result.output

def test_export_does_not_crash_and_includes_dataset_name(runner, tmp_path):
    cli_runner, storage = runner
    _seed_run(storage)

    output_path = str(tmp_path / "out.csv")
    result = cli_runner.invoke(cli_module.cli, ["export", "--output", output_path])
    assert result.exit_code == 0
    assert "Exported 1 experiments" in result.output

    with open(output_path) as f:
        content = f.read()
    assert "dataset_name" in content
    assert "iris" in content

def test_clear_deletes_everything(runner):
    cli_runner, storage = runner
    _seed_run(storage, run_id="r1")
    _seed_run(storage, run_id="r2")
    assert storage.get_run_count() == 2

    result = cli_runner.invoke(cli_module.cli, ["clear"], input="y\n")
    assert result.exit_code == 0
    assert storage.get_run_count() == 0

def test_delete_specific_run(runner):
    cli_runner, storage = runner
    _seed_run(storage, run_id="to_delete")
    result = cli_runner.invoke(cli_module.cli, ["delete", "to_delete"], input="y\n")
    assert result.exit_code == 0
    assert storage.get_run_count() == 0


def test_show_renders_non_numeric_metric(runner):
    cli_runner, storage = runner
    _seed_run(storage, metrics={"accuracy": 0.9, "note": "baseline"})
    result = cli_runner.invoke(cli_module.cli, ["show", "cli_run_1"])
    assert result.exit_code == 0
    assert result.exception is None
    assert "baseline" in result.output
    assert "0.9000" in result.output
