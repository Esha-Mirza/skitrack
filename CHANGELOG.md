# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] - 2026-08-22

### Added
- Initial release of `skitrack`.
- `@track_run` decorator for automatic experiment logging (model, hyperparameters, dataset shape/hash, training time, metrics).
- Local SQLite storage with cross-platform app-data directory resolution (Windows, macOS, Linux).
- CLI commands: `list`, `show`, `delete`, `clear`, `stats`, `dashboard`, `export`.
- Flask-based local API (`/api/runs`, `/api/runs/<run_id>`) serving the dashboard.
- React/Vite dashboard for browsing and comparing runs.
- Dataset fingerprinting via content hashing for DataFrames, Series, and NumPy arrays.
- Automatic schema migration for the local SQLite database.

---

_This project is under active development — entries above reflect the current `0.1.0` codebase. Future releases will be documented here as they ship._
