import sys
import pandas as pd
import numpy as np
import sklearn
import sqlalchemy
import click
import joblib

print("---Environment Test---\n\n")

print(f"Python version: {sys.version}")
print(f"Pandas version: {pd.__version__}")
print(f"NumPy version: {np.__version__}")
print(f"Scikit-learn version: {sklearn.__version__}")
print(f"SQLAlchemy version: {sqlalchemy.__version__}")
print(f"Click version: {click.__version__}")
print(f"Joblib version: {joblib.__version__}")
print("\n\nAll packages imported successfully!")