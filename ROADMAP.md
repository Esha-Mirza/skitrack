# Roadmap

This roadmap communicates the general direction of the project. It is not a fixed timeline or a guarantee of specific features.

## Completed

- Core `@track_run` decorator for scikit-learn models
- Local SQLite storage with cross-platform data directory resolution
- CLI: `list`, `show`, `delete`, `clear`, `stats`, `dashboard`, `export`
- Local Flask API + React dashboard for browsing runs
- Dataset fingerprinting (hash + shape capture)
- Automatic schema migration for existing local databases

## In Progress

- Expanding test coverage across storage and CLI commands
- Improving dashboard UX for comparing multiple runs side by side

## Planned

- Support for additional ML frameworks beyond scikit-learn (e.g. XGBoost, LightGBM)
- Ability to tag/annotate runs with notes
- Basic run comparison/diff view in the dashboard
- Optional CSV/JSON import for external experiment data

If you'd like to propose or contribute to something on this list, see [CONTRIBUTING.md](CONTRIBUTING.md).
