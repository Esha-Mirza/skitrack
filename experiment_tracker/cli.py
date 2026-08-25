import click
from tabulate import tabulate
from .models import format_metric_value
from .storage import Storage

storage = Storage()


@click.group()
def cli():
    pass

@cli.command(name="list")
@click.option('--limit', default=10, help='Number of experiments to show')
@click.option('--verbose', is_flag=True, help='Show more details')
def list_experiments(limit, verbose):
    runs = storage.get_all_runs()

    if not runs:
        click.echo("No experiments found. Run some models first!")
        return

    runs = runs[:limit]

    click.echo(
        f"\nEXPERIMENTS (showing {len(runs)} of {storage.get_run_count()} total)\n"
    )

    table_data = []

    for i, run in enumerate(runs, 1):
        table_data.append(
            [
                i,
                run['run_id'],
                run['model_name'],
                run.get('dataset_name') or '-',
                f"{run['training_time']:.2f}s",
                run['dataset_shape'][0] if run['dataset_shape'] else '-',
                run['dataset_hash'][:8] if run['dataset_hash'] else '-',
            ]
        )

    headers = [
        "#",
        "Run ID",
        "Model",
        "Dataset",
        "Time",
        "Samples",
        "Hash",
    ]

    click.echo(
        tabulate(
            table_data,
            headers=headers,
            tablefmt="grid",
        )
    )

    if verbose:
        click.echo("\nDETAILED VIEW:\n")

        for run in runs[:3]:
            click.echo(f"\nRun ID: {run['run_id']}")
            click.echo(f"   Model: {run['model_name']}")
            click.echo(f"   Time: {run['timestamp']}")
            click.echo(f"   Duration: {run['training_time']:.2f}s")

            if run.get('dataset_name'):
                click.echo(
                    f"   Dataset: {run['dataset_name']} {run['dataset_shape']}"
                )
            elif run['dataset_shape']:
                click.echo(f"   Dataset: {run['dataset_shape']}")
            else:
                click.echo("   Dataset: not captured")

            click.echo(f"   Hash: {run['dataset_hash'] or 'not captured'}")
            click.echo(
                f"   Hyperparameters: {len(run['params'])} entries"
            )

            params = list(run['params'].items())[:5]

            for key, value in params:
                click.echo(f"      - {key}: {value}")

            if len(run['params']) > 5:
                click.echo(
                    f"      ... and {len(run['params']) - 5} more"
                )
    else:
        click.echo("\nUse --verbose for more details")


@cli.command()
@click.argument('run_id')
def show(run_id):
    run = storage.get_run(run_id)

    if not run:
        click.echo(f"No experiment found with ID: {run_id}")
        return

    click.echo(f"\nEXPERIMENT DETAILS: {run_id}\n")
    click.echo(f"\nRun ID: {run['run_id']}")
    click.echo(f"Model: {run['model_name']}")
    click.echo(f"Timestamp: {run['timestamp']}")
    click.echo(f"Training time: {run['training_time']:.2f}s")
    click.echo(
        f"Dataset shape: {run['dataset_shape'] or 'not captured'}"
    )

    if run.get('dataset_name'):
        click.echo(f"Dataset name: {run['dataset_name']}")

    click.echo(
        f"Dataset hash: {run['dataset_hash'] or 'not captured'}"
    )

    click.echo(
        f"\nHYPERPARAMETERS ({len(run['params'])}):"
    )

    for key, value in run['params'].items():
        click.echo(f"   - {key}: {value}")

    click.echo("\nMETRICS:")

    if run['metrics']:
        for key, value in run['metrics'].items():
            click.echo(f"   - {key}: {format_metric_value(value)}")
    else:
        click.echo("   (No metrics tracked yet)")


@cli.command()
@click.argument('run_id')
def delete(run_id):
    if not click.confirm(
        f"Are you sure you want to delete run {run_id}?"
    ):
        click.echo("Deletion cancelled")
        return

    success = storage.delete_run(run_id)

    if success:
        click.echo(f"Deleted run: {run_id}")
    else:
        click.echo(f"Failed to delete run: {run_id}")


@cli.command()
@click.confirmation_option(
    prompt="Delete ALL experiments? This cannot be undone!"
)
def clear():
    count = storage.get_run_count()

    if count == 0:
        click.echo("No experiments to delete")
        return

    success = storage.delete_all_runs()

    if success:
        click.echo(f"Deleted all {count} experiments")
    else:
        click.echo("Failed to delete experiments")


@cli.command()
def stats():
    runs = storage.get_all_runs()
    count = len(runs)

    if count == 0:
        click.echo("No experiments to analyze")
        return

    models = {}
    times = []

    for run in runs:
        model = run['model_name']
        models[model] = models.get(model, 0) + 1
        times.append(run['training_time'])

    click.echo("\nEXPERIMENT STATISTICS\n")
    click.echo(f"\nTotal experiments: {count}")
    click.echo(f"Total models used: {len(models)}")

    click.echo("\nTraining times:")
    click.echo(
        f"   - Average: {sum(times) / len(times):.2f}s"
    )
    click.echo(f"   - Fastest: {min(times):.2f}s")
    click.echo(f"   - Slowest: {max(times):.2f}s")

    click.echo("\nModels used:")

    for model, model_count in sorted(
        models.items(),
        key=lambda x: x[1],
        reverse=True,
    ):
        click.echo(
            f"   - {model}: {model_count} times"
        )

    by_dataset = {}

    for run in runs:
        dataset_hash = run.get('dataset_hash')

        if not dataset_hash:
            continue

        by_dataset.setdefault(dataset_hash, []).append(run)

    if by_dataset:
        click.echo(
            f"\nDatasets tracked ({len(by_dataset)}):"
        )

        for dataset_hash, dataset_runs in sorted(
            by_dataset.items(),
            key=lambda x: len(x[1]),
            reverse=True,
        ):
            dataset_models = sorted(
                set(r['model_name'] for r in dataset_runs)
            )

            names = sorted(
                {
                    r['dataset_name']
                    for r in dataset_runs
                    if r.get('dataset_name')
                }
            )

            label = (
                ", ".join(names)
                if names
                else dataset_hash[:12]
            )

            click.echo(
                f"   - {label}: {len(dataset_runs)} run(s), "
                f"hash: {dataset_hash}, "
                f"models: {', '.join(dataset_models)}"
            )


@cli.command()
@click.option(
    '--port',
    default=5000,
    help='Port to run the dashboard on',
)
@click.option(
    '--no-browser',
    is_flag=True,
    help="Don't automatically open a browser tab",
)
def dashboard(port, no_browser):
    import threading
    import webbrowser
    from .api import app

    url = f'http://127.0.0.1:{port}'

    click.echo(f"\nStarting dashboard at {url}")
    click.echo("Press CTRL+C to stop\n")

    if not no_browser:
        threading.Timer(
            1.5,
            lambda: webbrowser.open(url),
        ).start()

    app.run(
        port=port,
        debug=False,
    )


@cli.command()
@click.option(
    '--output',
    default='experiments.csv',
    help='Output file name',
)
def export(output):
    import csv

    runs = storage.get_all_runs()

    if not runs:
        click.echo("No experiments to export")
        return

    fieldnames = [
        'id',
        'run_id',
        'timestamp',
        'model_name',
        'training_time',
        'dataset_name',
        'dataset_shape',
        'dataset_hash',
        'params',
        'metrics',
    ]

    with open(
        output,
        'w',
        newline='',
        encoding='utf-8',
    ) as csvfile:
        writer = csv.DictWriter(
            csvfile,
            fieldnames=fieldnames,
        )

        writer.writeheader()

        for run in runs:
            row = {
                field: run.get(field)
                for field in fieldnames
            }

            row['params'] = str(row['params'])
            row['metrics'] = str(row['metrics'])
            row['timestamp'] = str(row['timestamp'])

            writer.writerow(row)

    click.echo(
        f"Exported {len(runs)} experiments to {output}"
    )