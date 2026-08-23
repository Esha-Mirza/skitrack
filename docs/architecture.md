# Architecture

## Overall Architecture

`skitrack` is a local-first Python package with three layers: a tracking core, a CLI, and an optional local web dashboard. There is no server deployment, no external database, and no network dependency — everything runs on the user's own machine.

```
              ┌─────────────────────┐
              │   Your training      │
              │   script (Python)    │
              │   using @track_run    │
              └──────────┬────────────┘
                         ↓
              ┌─────────────────────┐
              │  experiment_tracker    │
              │  decorator.py          │
              │  (captures model,      │
              │  params, dataset,      │
              │  timing, metrics)       │
              └──────────┬────────────┘
                         ↓
              ┌─────────────────────┐
              │      storage.py        │
              │  (SQLAlchemy ORM +     │
              │   SQLite database)      │
              └──────────┬────────────┘
                         ↓
          ┌──────────────┴───────────────┐
          ↓                               ↓
┌─────────────────────┐        ┌─────────────────────┐
│      cli.py            │        │      api.py            │
│  (Click commands:      │        │  (Flask app, serves     │
│  list/show/delete/      │        │  /api/runs + the         │
│  clear/stats/export)    │        │  built React dashboard)  │
└─────────────────────┘        └──────────┬────────────┘
                                            ↓
                                  ┌─────────────────────┐
                                  │  dashboard/ (React/     │
                                  │  Vite frontend, built    │
                                  │  into experiment_tracker/│
                                  │  static/)                │
                                  └─────────────────────┘
```

## Major Components

### Backend (`experiment_tracker/`)

- **`decorator.py`** — the `@track_run` decorator. Wraps a training function, times execution, extracts the model name and hyperparameters (via `get_params()`), computes a dataset fingerprint, and (if `X_test`/`y_test` are returned) computes metrics.
- **`models.py`** — defines the `Run` and `Metric` data models, plus the SQLAlchemy ORM model (`RunDB`) used for persistence.
- **`storage.py`** — resolves the OS-appropriate local data directory, manages the SQLite database connection, handles schema creation/migration, and provides CRUD operations for runs.
- **`cli.py`** — the `tracker` command-line entrypoint (built with Click), exposing `list`, `show`, `delete`, `clear`, `stats`, `dashboard`, and `export`.
- **`api.py`** — a small Flask app exposing a read-only JSON API over stored runs, and serving the built dashboard's static files.

### Frontend (`dashboard/`)

A React application (built with Vite) that consumes the Flask API to render the visual dashboard — the runs table, leaderboard, and run-detail views. In production, the dashboard is built into static assets and served directly by `api.py` from `experiment_tracker/static/`.

## Data Flow

1. A user decorates a training function with `@track_run`.
2. When the function runs, `decorator.py` captures the model, hyperparameters, dataset fingerprint, training time, and computed metrics into a `Run` object.
3. `storage.py` persists the `Run` to the local SQLite database.
4. The user inspects results either via the **CLI** (`tracker list`, `tracker show`, etc., which read directly from `storage.py`) or via the **dashboard** (`tracker dashboard`, which starts the Flask app in `api.py`, which itself reads from `storage.py` and serves data to the React frontend over `/api/runs`).

## Database

- **Engine**: SQLite (single file, `experiments.db`)
- **ORM**: SQLAlchemy
- **Location**: OS-appropriate local app-data directory (or a custom path via `EXPERIMENT_TRACKER_DATA_DIR`) — see [configuration.md](configuration.md)
- **Migrations**: handled automatically in-process at startup (`_migrate_schema` in `storage.py`) — new columns are added to the existing `runs` table if missing, so upgrading `skitrack` doesn't require a manual migration step.

## APIs

The Flask API (`api.py`) exposes a minimal, read-only JSON API purely to power the local dashboard. See [api.md](api.md) for the full endpoint reference. It is **not** designed for external/public consumption — there is no authentication layer, and CORS is restricted to the local Vite dev server origins.

## AI/ML Pipeline

`skitrack` doesn't run its own ML pipeline — it observes and records the user's own scikit-learn training code via the decorator pattern. It performs:

- Model name/hyperparameter extraction (via scikit-learn's `get_params()`)
- Dataset fingerprinting (content hashing of DataFrames, Series, or NumPy arrays)
- Metric computation, when a test set is returned from the tracked function

## External Services

None. `skitrack` makes no network calls and has no external service dependencies at runtime.

## Authentication

None. The dashboard and API are intended for local, single-user use on `127.0.0.1` only.

## Storage

All data — experiment metadata, hyperparameters, metrics, and dataset fingerprints — is stored locally in a single SQLite file. Nothing leaves the user's machine.
