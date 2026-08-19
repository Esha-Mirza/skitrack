import os
import json
from typing import List, Optional, Dict, Any

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

from .models import RunDB, Base, Run


def get_db_path():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    db_dir = os.path.join(project_root, "data")
    os.makedirs(db_dir, exist_ok=True)
    return os.path.join(db_dir, "experiments.db")


def _migrate_schema(engine):
    inspector = inspect(engine)

    if "runs" not in inspector.get_table_names():
        return

    existing_columns = {col["name"] for col in inspector.get_columns("runs")}

    with engine.begin() as conn:
        if "dataset_name" not in existing_columns:
            conn.execute(
                text(
                    "ALTER TABLE runs "
                    "ADD COLUMN dataset_name VARCHAR(100)"
                )
            )

    inspector = inspect(engine)

    dataset_hash_column = next(
        col
        for col in inspector.get_columns("runs")
        if col["name"] == "dataset_hash"
    )

    dataset_shape_column = next(
        col
        for col in inspector.get_columns("runs")
        if col["name"] == "dataset_shape"
    )

    hash_type = str(dataset_hash_column["type"]).upper()

    needs_rebuild = (
        "VARCHAR(64)" not in hash_type
        or not dataset_hash_column["nullable"]
        or not dataset_shape_column["nullable"]
    )

    if not needs_rebuild:
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


class Storage:
    def __init__(self, db_path=None):
        if db_path is None:
            db_path = get_db_path()

        self.db_path = db_path
        self.engine = create_engine(f"sqlite:///{db_path}")

        Base.metadata.create_all(self.engine)
        _migrate_schema(self.engine)

        self.Session = sessionmaker(bind=self.engine)

    def save_run(self, run: Run) -> bool:
        try:
            session = self.Session()

            run_db = RunDB(
                run_id=run.run_id,
                timestamp=run.timestamp,
                model_name=run.model_name,
                params_json=json.dumps(run.params),
                metrics_json=json.dumps(run.metrics),
                dataset_hash=run.dataset_hash,
                dataset_shape=str(run.dataset_shape) if run.dataset_shape is not None else None,
                dataset_name=run.dataset_name,
                training_time=run.training_time,
            )

            session.add(run_db)
            session.commit()
            session.close()
            return True

        except Exception as e:
            print(f"Error saving run: {e}")
            if "session" in locals():
                session.rollback()
                session.close()
            return False

    def get_all_runs(self) -> List[Dict[str, Any]]:
        try:
            session = self.Session()
            runs = session.query(RunDB).order_by(RunDB.timestamp.desc()).all()
            result = [run.to_dict() for run in runs]
            session.close()
            return result

        except Exception as e:
            print(f"Error getting runs: {e}")
            return []

    def get_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        try:
            session = self.Session()
            run = session.query(RunDB).filter(RunDB.run_id == run_id).first()
            session.close()

            if run:
                return run.to_dict()

            return None

        except Exception as e:
            print(f"Error getting run: {e}")
            return None

    def delete_run(self, run_id: str) -> bool:
        try:
            session = self.Session()
            run = session.query(RunDB).filter(RunDB.run_id == run_id).first()

            if run:
                session.delete(run)
                session.commit()
                session.close()
                return True

            session.close()
            return False

        except Exception as e:
            print(f"Error deleting run: {e}")
            if "session" in locals():
                session.rollback()
                session.close()
            return False

    def delete_all_runs(self) -> bool:
        try:
            session = self.Session()
            session.query(RunDB).delete()
            session.commit()
            session.close()
            return True

        except Exception as e:
            print(f"Error deleting all runs: {e}")
            if "session" in locals():
                session.rollback()
                session.close()
            return False

    def get_run_count(self) -> int:
        try:
            session = self.Session()
            count = session.query(RunDB).count()
            session.close()
            return count

        except Exception as e:
            print(f"Error getting run count: {e}")
            return 0