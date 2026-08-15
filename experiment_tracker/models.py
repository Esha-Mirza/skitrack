from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any, Optional


@dataclass
class Metric:

    name: str
    value: float
    
    def __repr__(self):
        return f"{self.name}: {self.value:.4f}"


@dataclass
class Run:

    run_id: str
    timestamp: datetime
    model_name: str
    params: Dict[str, Any]
    metrics: Dict[str, float]
    dataset_hash: str
    dataset_shape: tuple
    training_time: float
    dataset_name: Optional[str] = None
    
    def __repr__(self):
        return (
            f"Run(run_id={self.run_id}, model={self.model_name}, "
            f"metrics={self.metrics})"
        )


from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
import ast
import json
import os

Base = declarative_base()


class RunDB(Base):
    __tablename__ = 'runs'
    
  
    id = Column(Integer, primary_key=True)
    
    run_id = Column(String(50), unique=True, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    model_name = Column(String(100), nullable=False)
    
    params_json = Column(Text, nullable=False)
    metrics_json = Column(Text, nullable=False)
    
    dataset_hash = Column(String(20), nullable=False)
    dataset_shape = Column(String(50), nullable=False)
    # Explicit, user-supplied dataset identity (e.g. "iris", "wine").
    # Nullable for backward compatibility with rows written before this
    # column existed, and because dataset_hash alone is unreliable for
    # grouping: it's computed from the test split's actual content, so two
    # runs on the SAME source dataset get DIFFERENT hashes whenever
    # train_test_split() isn't called with an identical random_state.
    dataset_name = Column(String(100), nullable=True)
    
    training_time = Column(Float, nullable=False)
    
    def to_dict(self):
        """Convert database record to dictionary."""
        try:
            shape = tuple(ast.literal_eval(self.dataset_shape))
        except (ValueError, SyntaxError):
            shape = (0, 0)

        return {
            'id': self.id,
            'run_id': self.run_id,
            'timestamp': self.timestamp,
            'model_name': self.model_name,
            'params': json.loads(self.params_json),
            'metrics': json.loads(self.metrics_json),
            'dataset_hash': self.dataset_hash,
            'dataset_shape': shape,
            'dataset_name': self.dataset_name,
            'training_time': self.training_time
        }
    
    def __repr__(self):
        return f"<RunDB(run_id='{self.run_id}', model='{self.model_name}')>"