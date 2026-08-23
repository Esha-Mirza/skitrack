# Usage

## Starting the Application

Once installed (see [installation.md](installation.md)), you interact with `skitrack` in two ways:

1. **The `@track_run` decorator** — used in your own Python training scripts to automatically log runs.
2. **The `tracker` CLI** — used from the terminal to inspect, manage, and visualize logged runs.

To launch the dashboard:

```bash
tracker dashboard
```

![tracker dashboard launching](docs/assets/DASHBOARD_cmd.png)

## Basic Workflow

For an ML project using `skitrack`, the typical workflow looks like:

```
1. Wrap your training function with @track_run
2. Run your training script as usual
3. skitrack automatically captures the model, hyperparameters,
   dataset shape/hash, training time, and any metrics you return
4. Use the CLI or dashboard to browse and compare runs
```

### Example

```python
from experiment_tracker import track_run
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

@track_run
def train_iris_model():
    iris = load_iris()
    X, y = iris.data, iris.target

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=5,
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print(f"Test Accuracy: {accuracy_score(y_test, y_pred):.4f}")

    return model, X_test, y_test


train_iris_model()
```

Return your fitted `model` (optionally followed by `X_test`, `y_test`) from the decorated function — `skitrack` uses these to compute and store metrics automatically.

Then browse the result:

```bash
tracker show <run_id>
```

![Run detail view](docs/assets/SHOW_ID.png)

## Commands

| Command | Purpose |
|---|---|
| `tracker list` | List recent experiments in a table |
| `tracker show <run_id>` | Show full details for one run |
| `tracker delete <run_id>` | Delete a single run (with confirmation) |
| `tracker clear` | Delete **all** runs (with confirmation) |
| `tracker stats` | Show summary statistics across all runs |
| `tracker dashboard` | Launch the local web dashboard |
| `tracker export` | Export all runs to a CSV file |

### `tracker list`

```bash
tracker list --limit 20 --verbose
```

- `--limit`: number of experiments to show (default: 10)
- `--verbose`: show detailed info (hyperparameters, dataset info) for the top 3 results

![tracker list --verbose output](docs/assets/LIST_1.png)

### `tracker show`

```bash
tracker show <run_id>
```

Prints the model name, timestamp, training time, dataset shape/hash, hyperparameters, and metrics for a single run.

### `tracker delete` / `tracker clear`

```bash
tracker delete <run_id>
tracker clear
```

Both prompt for confirmation before deleting anything.

### `tracker stats`

```bash
tracker stats
```
![tracker stats output](docs/assets/STATS.png)

Prints aggregate statistics: total experiments, models used, average/fastest/slowest training time, and a breakdown by dataset (via dataset hash).

### `tracker dashboard`

```bash
tracker dashboard --port 5050 --no-browser
```

- `--port`: port to run on (default: 5000)
- `--no-browser`: don't automatically open a browser tab

### `tracker export`

```bash
tracker export --output my_experiments.csv
```

- `--output`: output CSV filename (default: `experiments.csv`)

## Input/Output Examples

**Input** (your training function, decorated with `@track_run`):
```python
@track_run
def train():
    model = RandomForestClassifier().fit(X_train, y_train)
    return model, X_test, y_test
```

**Output** (what gets stored per run):
- `run_id`, `timestamp`
- `model_name`, hyperparameters (`params`)
- `dataset_shape`, `dataset_hash`, `dataset_name` (if available)
- `training_time`
- `metrics` (e.g. accuracy, if computable from `X_test`/`y_test`)

## Common Use Cases

- Comparing hyperparameter choices across multiple runs of the same model
- Checking which dataset version/shape a given run used (via the dataset hash)
- Quickly exporting all experiment history to CSV for external analysis or reporting

## Advanced Usage

### Clearing programmatically

Instead of the CLI, you can clear all experiments from within Python:

```python
from experiment_tracker import clear_experiments

clear_experiments()
```

### Custom data directory

Set `EXPERIMENT_TRACKER_DATA_DIR` (see [configuration.md](configuration.md)) if you want to keep separate databases for separate projects.
