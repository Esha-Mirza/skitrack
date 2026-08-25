# API Documentation

`skitrack` includes a small local Flask API that powers the dashboard. It is intended for **local use only** — it has no authentication and is not designed to be exposed publicly (see [SECURITY.md](../SECURITY.md)).

**Base URL**: `http://127.0.0.1:5000` (or whatever `--port` you passed to `tracker dashboard`)

## Authentication

None. All endpoints are open to any client that can reach the local port.

---

### `GET /api/runs`

**Purpose**: List all tracked experiment runs.

**Parameters**: none

**Headers**: none required

**Response** — `200 OK`:
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "run_id": "a1b2c3d4",
      "model_name": "RandomForestClassifier",
      "timestamp": "2026-08-20T14:32:11.123",
      "training_time": 0.42,
      "dataset_shape": [120, 4],
      "dataset_hash": "9f8e7d6c...",
      "dataset_name": "Dataset 1",
      "params": { "n_estimators": 100, "max_depth": 5 },
      "metrics": { "accuracy": 0.9667 }
    }
  ]
}
```

**Status codes**:
- `200 OK` — always returned for this endpoint (an empty list if no runs exist)

---

### `GET /api/runs/<run_id>`

**Purpose**: Get details for a single run.

**Parameters**:
| Name | In | Type | Description |
|---|---|---|---|
| `run_id` | path | string | The ID of the run to retrieve |

**Request body**: none

**Response** — `200 OK`:
```json
{
  "status": "success",
  "data": {
    "run_id": "a1b2c3d4",
    "model_name": "RandomForestClassifier",
    "timestamp": "2026-08-20T14:32:11.123",
    "training_time": 0.42,
    "dataset_shape": [120, 4],
    "dataset_hash": "9f8e7d6c...",
    "dataset_name": "Dataset 1",
    "params": { "n_estimators": 100, "max_depth": 5 },
    "metrics": { "accuracy": 0.9667 }
  }
}
```

**Response** — `404 Not Found`:
```json
{
  "status": "error",
  "message": "Run <run_id> not found"
}
```

**Status codes**:
- `200 OK` — run found
- `404 Not Found` — no run exists with that ID

---

### `GET|POST|PUT|PATCH|DELETE /api/<path>` (unmatched paths)

**Purpose**: Catch-all for any unrecognized `/api/*` route.

**Response** — `404 Not Found`:
```json
{
  "status": "error",
  "message": "API endpoint /api/<path> not found"
}
```

---

### `GET /assets/<path>`

**Purpose**: Serves static dashboard assets (JS/CSS bundles) used by the React frontend. Not intended for direct use.

---

### `GET /` and `GET /<path>`

**Purpose**: Serves the built React dashboard (`index.html` and its client-side routes). Not a data endpoint — this is what renders the dashboard UI in your browser.

A path that looks like a file (anything with an extension, such as `/favicon.ico`) and is not present in the static directory returns `404 Not Found` with the standard error body, rather than falling back to `index.html`. Paths without an extension fall back to `index.html` so the dashboard can handle them.

---

## Errors

All error responses follow the same shape:
```json
{
  "status": "error",
  "message": "<description of what went wrong>"
}
```

## Notes

- `dataset_name` is `null` for runs where no dataset could be captured, for example when the decorated function returns only the model.
- There is currently no pagination on `GET /api/runs` — all runs are returned in a single response.
- There is no write API (creating/updating runs happens only through the `@track_run` decorator, not via HTTP).
- For larger or public-facing APIs, OpenAPI/Swagger documentation would be preferable — for this project's current scope (a handful of local, read-only endpoints), manual documentation is sufficient.
