# Configuration

`skitrack` is designed to work with **zero configuration**. The only setting available today is where the local database is stored.

## Environment Variables

| Variable | Required? | Default |
|---|---|---|
| `EXPERIMENT_TRACKER_DATA_DIR` | Optional | OS-appropriate app-data folder (see below) |

## Default Values

If `EXPERIMENT_TRACKER_DATA_DIR` is not set, `skitrack` picks a default based on your OS:

```
Windows   %LOCALAPPDATA%\experiment-tracker
macOS     ~/Library/Application Support/experiment-tracker
Linux     $XDG_DATA_HOME/experiment-tracker
          (falls back to ~/.local/share/experiment-tracker)
```

The SQLite database file itself is always named `experiments.db` inside that directory.

## Required vs. Optional Variables

There are no required environment variables — `skitrack` runs out of the box.

```
EXPERIMENT_TRACKER_DATA_DIR     Optional
```

## API Keys

None. `skitrack` does not integrate with any external API or service, so there are no API keys to configure.

## Database Configuration

There is no separate database server to configure — SQLite is file-based and created automatically. To use a custom location (e.g. to keep separate databases per project, or to store data on a different drive):

```bash
# .env
EXPERIMENT_TRACKER_DATA_DIR=/path/to/your/preferred/folder
```

The package does not automatically load `.env` files. If you use `.env.example` as a template, export/set `EXPERIMENT_TRACKER_DATA_DIR` in your environment before running `tracker`. Never commit a real `.env` file — keep it in `.gitignore`.

## Model Configuration

Not applicable — `skitrack` tracks whatever scikit-learn model your own code trains; it does not configure or select models itself.

## Feature Flags

None currently exist. CLI behavior is controlled via command-line options (e.g. `--verbose`, `--limit`, `--port`, `--no-browser`) rather than environment-based feature flags — see [usage.md](usage.md).

## Development vs. Production Settings

`skitrack` doesn't distinguish between "development" and "production" modes in the traditional sense, since it's a local developer tool. The one relevant distinction:

- `tracker dashboard` always runs Flask with `debug=False` for stability.
- For **dashboard frontend** development (editing the React app under `dashboard/`), use the Vite dev server (`npm run dev` inside `dashboard/`) rather than the built static files, so you get hot-reloading. See [development workflow in CONTRIBUTING.md](../CONTRIBUTING.md).
