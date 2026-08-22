import json
import os
import sys
from typing import List, Optional, Dict, Any

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

from .models import RunDB, Base, Run


def get_db_path():
    configured_dir = os.environ.get("EXPERIMENT_TRACKER_DATA_DIR")
    if configured_dir:
        db_dir = os.path.abspath(os.path.expanduser(configured_dir))
    elif os.name == "nt":
        db_dir = os.path.join(
            os.environ.get("LOCALAPPDATA") or os.path.expanduser("~"),
            "experiment-tracker",
        )
    elif sys.platform == "darwin":
        db_dir = os.path.join(
            os.path.expanduser("~"),
            "Library",
            "Application Support",
            "experiment-tracker",
        )
    else:
        db_dir = os.path.join(
            os.environ.get("XDG_DATA_HOME")
            or os.path.join(os.path.expanduser("~"), ".local", "share"),
            "experiment-tracker",
        )

    os.makedirs(db_dir, exist_ok=True)
    return os.path.join(db_dir, "experiments.db")


def _migrate_schema(engine):
    inspector = inspect(engine)

    if "runs" not in inspector.get_table_names():
        return

    existing_columns = {col["name"] for col in inspector.get_columns("runs")}

    with engine.begin() as conn:
        if "dataset_hash" not in existing_columns:
            conn.execute(text("ALTER TABLE runs ADD COLUMN dataset_hash VARCHAR(64)"))
        if "dataset_shape" not in existing_columns:
            conn.execute(text("ALTER TABLE runs ADD COLUMN dataset_shape VARCHAR(50)"))
        if "dataset_name" not in existing_columns:
            conn.execute(text("ALTER TABLE runs ADD COLUMN dataset_name VARCHAR(100)"))

    inspector = inspect(engine)
    columns = {col["name"]: col for col in inspector.get_columns("runs")}

    dataset_hash_column = columns["dataset_hash"]
    dataset_shape_column = columns["dataset_shape"]
    hash_type = str(dataset_hash_column["type"]).upper()

    needs_rebuild = (
        "VARCHAR(64)" not in hash_type
        or not dataset_hash_column["nullable"]
        or not dataset_shape_column["nullable"]
    )

    if not needs_rebuild:
        return

    required_columns = [
        "id",
        "run_id",
        "timestamp",
        "model_name",
        "params_json",
        "metrics_json",
        "dataset_hash",
        "dataset_shape",
        "dataset_name",
        "training_time",
    ]

    current_names = {col["name"] for col in inspector.get_columns("runs")}

    if not all(name in current_names for name in required_columns):
        return

    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE runs RENAME TO runs_legacy"))

        conn.execute(
            text(
                """
                CREATE TABLE runs (
                    id INTEGER PRIMARY KEY,
                    run_id VARCHAR(50) UNIQUE NOT NULL,
                    timestamp DATETIME NOT NULL,
                    model_name VARCHAR(100) NOT NULL,
                    params_json TEXT NOT NULL,
                    metrics_json TEXT NOT NULL,
                    dataset_hash VARCHAR(64),
                    dataset_shape VARCHAR(50),
                    dataset_name VARCHAR(100),
                    training_time FLOAT NOT NULL
                )
                """
            )
        )

        conn.execute(
            text(
                """
                INSERT INTO runs (
                    id,
                    run_id,
                    timestamp,
                    model_name,
                    params_json,
                    metrics_json,
                    dataset_hash,
                    dataset_shape,
                    dataset_name,
                    training_time
                )
                SELECT
                    id,
                    run_id,
                    timestamp,
                    model_name,
                    params_json,
                    metrics_json,
                    dataset_hash,
                    dataset_shape,
                    dataset_name,
                    training_time
                FROM runs_legacy
                """
            )
        )

        conn.execute(text("DROP TABLE runs_legacy"))


def _json_safe(value: Any) -> Any:
    import numpy as np

    if isinstance(value, np.generic):
        return _json_safe(value.item())

    if isinstance(value, dict):
        return {str(key): _json_safe(item) for key, item in value.items()}

    if isinstance(value, (list, tuple)):
        return [_json_safe(item) for item in value]

    if isinstance(value, (str, int, float, bool)) or value is None:
        return value

    raise TypeError(
        f"Unsupported value for JSON storage: {type(value).__name__}"
    )


class Storage:
    def __init__(self, db_path=None):
        if db_path is None:
            db_path = get_db_path()

        self.db_path = os.path.abspath(os.path.expanduser(db_path))
        db_dir = os.path.dirname(self.db_path)

        if db_dir:
            os.makedirs(db_dir, exist_ok=True)

        self.engine = create_engine(f"sqlite:///{self.db_path}")
        Base.metadata.create_all(self.engine)
        _migrate_schema(self.engine)
        self.Session = sessionmaker(bind=self.engine)

    def get_or_create_dataset_name(self, dataset_hash: str) -> str:
        """Return a stable human-readable label for a dataset hash."""
        session = self.Session()
        try:
            existing = (
                session.query(RunDB)
                .filter(RunDB.dataset_hash == dataset_hash)
                .order_by(RunDB.id.asc())
                .first()
            )

            if existing and existing.dataset_name:
                return existing.dataset_name

            named = (
                session.query(RunDB.dataset_name)
                .filter(RunDB.dataset_name.isnot(None))
                .all()
            )
            used = set()
            for (name,) in named:
                if isinstance(name, str) and name.startswith("Dataset "):
                    try:
                        used.add(int(name.split(" ", 1)[1]))
                    except (ValueError, IndexError):
                        pass

            next_number = 1
            while next_number in used:
                next_number += 1

            label = f"Dataset {next_number}"

            if existing:
                session.query(RunDB).filter(
                    RunDB.dataset_hash == dataset_hash,
                    RunDB.dataset_name.is_(None),
                ).update({"dataset_name": label}, synchronize_session=False)
                session.commit()

            return label
        except Exception as exc:
            session.rollback()
            print(f"Warning: Could not assign dataset name: {exc}")
            return "Dataset 1"
        finally:
            session.close()

    def save_run(self, run: Run) -> bool:
        session = self.Session()

        try:
            params_json = json.dumps(
                _json_safe(run.params),
                sort_keys=True,
                separators=(",", ":"),
            )

            metrics_json = json.dumps(
                _json_safe(run.metrics),
                sort_keys=True,
                separators=(",", ":"),
            )

            run_db = RunDB(
                run_id=run.run_id,
                timestamp=run.timestamp,
                model_name=run.model_name,
                params_json=params_json,
                metrics_json=metrics_json,
                dataset_hash=run.dataset_hash,
                dataset_shape=(
                    str(run.dataset_shape)
                    if run.dataset_shape is not None
                    else None
                ),
                dataset_name=run.dataset_name,
                training_time=run.training_time,
            )

            session.add(run_db)
            session.commit()
            return True

        except Exception as e:
            session.rollback()
            print(f"Error saving run: {e}")
            return False

        finally:
            session.close()

    def get_all_runs(self) -> List[Dict[str, Any]]:
        session = self.Session()

        try:
            runs = (
                session.query(RunDB)
                .order_by(RunDB.timestamp.desc())
                .all()
            )
            return [run.to_dict() for run in runs]

        except Exception as e:
            print(f"Error getting runs: {e}")
            return []

        finally:
            session.close()

    def get_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        session = self.Session()

        try:
            run = (
                session.query(RunDB)
                .filter(RunDB.run_id == run_id)
                .first()
            )

            return run.to_dict() if run else None

        except Exception as e:
            print(f"Error getting run: {e}")
            return None

        finally:
            session.close()

    def delete_run(self, run_id: str) -> bool:
        session = self.Session()

        try:
            run = (
                session.query(RunDB)
                .filter(RunDB.run_id == run_id)
                .first()
            )

            if not run:
                return False

            session.delete(run)
            session.commit()
            return True

        except Exception as e:
            session.rollback()
            print(f"Error deleting run: {e}")
            return False

        finally:
            session.close()

    def delete_all_runs(self) -> bool:
        session = self.Session()

        try:
            session.query(RunDB).delete()
            session.commit()
            return True

        except Exception as e:
            session.rollback()
            print(f"Error deleting all runs: {e}")
            return False

        finally:
            session.close()

    def get_run_count(self) -> int:
        session = self.Session()

        try:
            return session.query(RunDB).count()

        except Exception as e:
            print(f"Error getting run count: {e}")
            return 0

        finally:
            session.close()