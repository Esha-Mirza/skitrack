

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