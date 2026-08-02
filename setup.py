
from setuptools import setup, find_packages

setup(
    name="experiment-tracker",
    version="0.1.0",
    description="Lightweight ML experiment tracking with local storage",
    author="Esha-Mirza",
    packages=find_packages(),
    install_requires=[
        "pandas>=2.0.0",
        "numpy>=1.24.0",
        "scikit-learn>=1.3.0",
        "sqlalchemy>=2.0.0",
        "click>=8.0.0",
        "joblib>=1.3.0",
        "python-dotenv>=1.0.0",
    ],
    python_requires=">=3.9",
)