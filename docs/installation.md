# Installation

## System Requirements

- Python **3.9 or newer**
- pip
- ~10 MB disk space for dependencies, plus space for your local experiment database (grows with usage)
- (Optional, only for dashboard frontend development) Node.js 18+ and npm

## Supported Platforms

`skitrack` is cross-platform and has been designed to work on:

- Windows
- macOS
- Linux

## Installation

### From PyPI

Once the package is published, the standard installation is:

```bash
python -m pip install skitrack
```

This installs the `skitrack` package and registers the `tracker` CLI command. The published package includes the compiled dashboard assets, so Node.js and npm are **not required** for normal use.

### From Source

```bash
git clone https://github.com/Esha-Mirza/skitrack.git
cd skitrack

python -m venv venv
```

Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

Then install the package:

```bash
python -m pip install --upgrade pip
python -m pip install -e .
```

This installs the `experiment_tracker` Python package and registers the `tracker` CLI command.

## Dependencies

The runtime dependencies are installed automatically by the package:

```text
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
sqlalchemy>=2.0.0
click>=8.0.0
joblib>=1.3.0
tabulate>=0.9.0
flask>=2.0.0
flask-cors>=4.0.0
```

For development and testing, install:

```bash
python -m pip install -r requirements-dev.txt
```

## Virtual Environment (recommended)

A virtual environment is recommended for source/development installations:

```bash
python -m venv venv

# Activate it:
venv\Scripts\activate       # Windows
source venv/bin/activate     # macOS / Linux
```

Then:

```bash
python -m pip install --upgrade pip
python -m pip install -e .
```

## Database Setup

No manual database setup is required. `skitrack` automatically creates a local SQLite database (`experiments.db`) the first time it runs, in the OS-appropriate app-data folder (see [configuration.md](configuration.md) for exact paths, or to override the location).

## API Key Setup

None required. `skitrack` does not call any external API or service — everything runs locally.

## Environment Variables

No environment variables are required.

To customize the local database location, set `EXPERIMENT_TRACKER_DATA_DIR` before running `tracker`:

```bash
# macOS / Linux
export EXPERIMENT_TRACKER_DATA_DIR=/path/to/your/data

# Windows PowerShell
$env:EXPERIMENT_TRACKER_DATA_DIR="C:\path\to\your\data"
```

See [configuration.md](configuration.md) for details.

> Note: `.env.example` is provided as a template, but the package does not automatically load `.env` files. If you use the template, export/set `EXPERIMENT_TRACKER_DATA_DIR` in your environment before running `tracker`.

## OS-Specific Notes

- **Windows**: the default data directory is `%LOCALAPPDATA%\experiment-tracker`.
- **macOS**: the default data directory is `~/Library/Application Support/experiment-tracker`.
- **Linux**: the default data directory is `$XDG_DATA_HOME/experiment-tracker`, falling back to `~/.local/share/experiment-tracker`.

## Verifying Installation

Run:

```bash
tracker stats
```

If installed correctly, you should see either experiment statistics (if you have prior runs) or:

```text
No experiments to analyze
```

You can also start the dashboard to confirm the full stack works:

```bash
tracker dashboard
```

![tracker dashboard starting](assets/DASHBOARD_cmd.png)

This should open `http://127.0.0.1:5000` in your browser automatically.

## Dashboard Frontend Development

This section applies only if you are modifying the React dashboard source under `dashboard/`.

```bash
cd dashboard
npm install
npm run dev
```

For a production/package build:

```bash
cd dashboard
npm run build
```

The resulting compiled assets are consumed by the Python package build; end users installing the published package do not need to run the frontend build themselves.
