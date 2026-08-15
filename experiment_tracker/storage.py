import os
import json
import sqlite3
from datetime import datetime
from typing import List, Optional, Dict, Any

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

from .models import RunDB, Base, Run


def get_db_path():

    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    db_dir = os.path.join(project_root, 'data')
    
    os.makedirs(db_dir, exist_ok=True)
    
    return os.path.join(db_dir, 'experiments.db')


def _migrate_schema(engine):
    """
    Base.metadata.create_all() only creates tables that don't exist yet —
    it will NOT add a new column to a 'runs' table that already exists on
    disk from before this column was introduced. Without this, anyone
    with an existing experiments.db would hit a hard SQL error on the
    next save_run() ("table runs has no column named dataset_name").
    This adds any missing columns in place, preserving existing rows.
    """
    inspector = inspect(engine)
    if 'runs' not in inspector.get_table_names():
        return  # fresh DB, create_all() already built the correct schema

    existing_columns = {col['name'] for col in inspector.get_columns('runs')}
    if 'dataset_name' not in existing_columns:
        with engine.connect() as conn:
            conn.execute(text('ALTER TABLE runs ADD COLUMN dataset_name VARCHAR(100)'))
            conn.commit()


class Storage:
    
    def __init__(self, db_path=None):
   
        if db_path is None:
            db_path = get_db_path()
        
        self.db_path = db_path
        self.engine = create_engine(f'sqlite:///{db_path}')
        
        Base.metadata.create_all(self.engine) #Create tables if they don't exist
        _migrate_schema(self.engine) #Add any columns missing from an existing DB
        
        self.Session = sessionmaker(bind=self.engine) #Create session factory
    
    def save_run(self, run: Run) -> bool:

        try:
            session = self.Session()
            
            #Convert dataclass to database model
            run_db = RunDB(
                run_id=run.run_id,
                timestamp=run.timestamp,
                model_name=run.model_name,
                params_json=json.dumps(run.params),
                metrics_json=json.dumps(run.metrics),
                dataset_hash=run.dataset_hash,
                dataset_shape=str(run.dataset_shape),
                dataset_name=run.dataset_name,
                training_time=run.training_time
            )
            
            session.add(run_db)
            session.commit()
            session.close()
            return True
            
        except Exception as e:
            print(f"Error saving run: {e}")
            if 'session' in locals():
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
            if 'session' in locals():
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
            if 'session' in locals():
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