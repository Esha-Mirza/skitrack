

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
    
    def __repr__(self):
        return (
            f"Run(run_id={self.run_id}, model={self.model_name}, "
            f"metrics={self.metrics})"
        )


from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
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
    
    training_time = Column(Float, nullable=False)
    
    def to_dict(self):
        """Convert database record to dictionary."""
        return {
            'id': self.id,
            'run_id': self.run_id,
            'timestamp': self.timestamp,
            'model_name': self.model_name,
            'params': json.loads(self.params_json),
            'metrics': json.loads(self.metrics_json),
            'dataset_hash': self.dataset_hash,
            'dataset_shape': eval(self.dataset_shape),  
            'training_time': self.training_time
        }
    
    def __repr__(self):
        return f"<RunDB(run_id='{self.run_id}', model='{self.model_name}')>"