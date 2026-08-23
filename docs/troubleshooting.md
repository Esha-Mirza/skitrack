# Troubleshooting

## Application fails to start (`tracker` command not found)

**Possible cause**: the package wasn't installed, or it was installed in a different virtual environment than the one you're currently using.

**Solution**:
```bash
pip install -e .
```
Make sure your virtual environment is activated first (`source venv/bin/activate` or `venv\Scripts\activate` on Windows), then confirm with:
```bash
which tracker      # macOS/Linux
where tracker       # Windows
```

## "No experiments found" when you expect runs to exist

**Possible cause**: `EXPERIMENT_TRACKER_DATA_DIR` points to a different location than when the runs were originally logged, or you're running from a different environment/user account.

**Solution**: Check your current data directory setting:
```bash
echo $EXPERIMENT_TRACKER_DATA_DIR   # macOS/Linux
echo %EXPERIMENT_TRACKER_DATA_DIR%  # Windows
```
If unset, `skitrack` uses the OS default — see [configuration.md](configuration.md) for exact paths per OS.

## Dependency errors during installation

**Possible cause**: an outdated pip, or a Python version below 3.9.

**Solution**:
```bash
python --version        # confirm 3.9+
pip install --upgrade pip
pip install -e .
```

## Dashboard won't load / "port already in use"

**Possible cause**: another process is already using port 5000.

**Solution**: run on a different port:
```bash
tracker dashboard --port 5050
```

## Dashboard opens but shows no data

**Possible cause**: the dashboard's Flask API is reading from a different database than the one your training scripts wrote to (usually an `EXPERIMENT_TRACKER_DATA_DIR` mismatch between two terminal sessions or two `.env` files).

**Solution**: Verify both your training script's shell and the shell running `tracker dashboard` have the same `EXPERIMENT_TRACKER_DATA_DIR` value (or both leave it unset, using the same OS default).

## Authentication problems

Not applicable — `skitrack` and its dashboard/API have no authentication layer, since they're designed for local, single-user use only. If you're trying to access the dashboard remotely and hitting connection issues, note that it's intended to run on `127.0.0.1` only; see [SECURITY.md](../SECURITY.md).

## Database connection errors

**Possible cause**: the configured data directory isn't writable, or the SQLite file is locked by another process.

**Solution**:
- Confirm the process running `tracker` has write permissions to the data directory.
- Close any other program that might have the `experiments.db` file open.
- As a last resort, try pointing `EXPERIMENT_TRACKER_DATA_DIR` at a fresh directory to rule out a corrupted database file.

## Model/metrics not being captured

**Possible cause**: your decorated function isn't returning the model (and optionally `X_test`, `y_test`) in the expected order.

**Solution**: Make sure your tracked function returns `model`, or `(model, X_test, y_test)`:
```python
@track_run
def train():
    ...
    return model, X_test, y_test   # metrics computed automatically
```
If only `model` is returned, hyperparameters and dataset info are still captured, but metrics won't be computed.

## Permission errors on Windows/macOS

**Possible cause**: the resolved app-data directory (e.g. `%LOCALAPPDATA%\experiment-tracker`) isn't accessible due to OS permissions.

**Solution**: Set `EXPERIMENT_TRACKER_DATA_DIR` to a folder you know you have write access to (e.g. somewhere in your home directory).

## GPU/CUDA problems

Not applicable — `skitrack` and scikit-learn's default estimators run on CPU. If your own training code uses GPU-accelerated libraries alongside scikit-learn, GPU/CUDA issues are unrelated to `skitrack` itself and should be debugged against that library's own documentation.

## Still stuck?

Open an issue using the [bug report template](../.github/ISSUE_TEMPLATE/bug_report.md), including your OS, Python version, `skitrack` version, and the exact error output.
