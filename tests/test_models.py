from datetime import datetime

from sqlalchemy import create_engine, inspect

from experiment_tracker.models import Base, RunDB


def _build_rundb(dataset_shape_str, dataset_name=None, dataset_hash="hash"):
    return RunDB(
        run_id="test",
        timestamp=datetime.now(),
        model_name="TestModel",
        params_json="{}",
        metrics_json="{}",
        dataset_hash=dataset_hash,
        dataset_shape=dataset_shape_str,
        dataset_name=dataset_name,
        training_time=0.1,
    )


def test_parses_current_list_format():
    run = _build_rundb("[150, 4]")
    assert run.to_dict()["dataset_shape"] == (150, 4)


def test_parses_legacy_tuple_string_format():
    run = _build_rundb("(150, 4)")
    assert run.to_dict()["dataset_shape"] == (150, 4)


def test_corrupted_shape_falls_back_safely():
    run = _build_rundb("not valid python at all !!")
    assert run.to_dict()["dataset_shape"] is None


def test_dataset_name_included_in_dict():
    run = _build_rundb("[100, 4]", dataset_name="iris")
    assert run.to_dict()["dataset_name"] == "iris"


def test_dataset_name_none_when_not_set():
    run = _build_rundb("[100, 4]", dataset_name=None)
    assert run.to_dict()["dataset_name"] is None


def test_dataset_hash_column_is_64_characters():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    column = next(column for column in inspect(engine).get_columns("runs") if column["name"] == "dataset_hash")
    assert "VARCHAR(64)" in str(column["type"]).upper()