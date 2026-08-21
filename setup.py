from setuptools import find_packages, setup

setup(
    name="experiment-tracker",
    version="0.1.0",
    description="Lightweight ML experiment tracking with local storage",
    author="Esha-Mirza",
    packages=find_packages(exclude=["experiment_tracker.static", "experiment_tracker.static.*"]),
    include_package_data=False,
    package_data={
        "experiment_tracker": [
            "static/*",
            "static/**/*",
        ],
    },
    install_requires=[
        "pandas>=2.0.0",
        "numpy>=1.24.0",
        "scikit-learn>=1.3.0",
        "sqlalchemy>=2.0.0",
        "click>=8.0.0",
        "joblib>=1.3.0",
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