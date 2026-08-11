
from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="experiment-tracker",
    version="0.1.0",
    author="Esha-Mirza",
    author_email="esha.mirza016@gmail.com",
    description="Lightweight ML experiment tracking with local storage and React dashboard",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/Esha-Mirza/Local-First-Experiment-Tracker-for-Scikit-Learn",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    install_requires=[
        "pandas>=2.0.0",
        "numpy>=1.24.0",
        "scikit-learn>=1.3.0",
        "sqlalchemy>=2.0.0",
        "click>=8.0.0",
        "joblib>=1.3.0",
        "python-dotenv>=1.0.0",
        "tabulate>=0.9.0",
        "flask>=2.0.0",
        "flask-cors>=4.0.0",
    ],
    python_requires=">=3.9",
    entry_points={
        "console_scripts": [
            "tracker=experiment_tracker.cli:cli",
        ],
    },
)