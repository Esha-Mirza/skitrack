
import click
import json
from datetime import datetime
from tabulate import tabulate

from .storage import Storage

storage = Storage()


@click.group()
def cli():
    """
    Commands:
        list    Show all experiments
        show    Show details of a specific experiment
        delete  Delete an experiment
        clear   Delete ALL experiments
        stats   Show statistics
        export  Export experiments to CSV
    """
    pass


@cli.command()
@click.option('--limit', default=10, help='Number of experiments to show')
@click.option('--verbose', is_flag=True, help='Show more details')
def list(limit, verbose):
    runs = storage.get_all_runs()
    
    if not runs:
        click.echo("No experiments found. Run some models first!")
        return
    

    runs = runs[:limit]
  
    click.echo(f"\nEXPERIMENTS (showing {len(runs)} of {storage.get_run_count()} total)\n")
  
    table_data = []
    for i, run in enumerate(runs, 1):
        table_data.append([
            i,
            run['run_id'],
            run['model_name'],
            f"{run['training_time']:.2f}s",
            run['dataset_shape'][0],
            run['dataset_hash'][:8]
        ])
    
    headers = ["#", "Run ID", "Model", "Time", "Samples", "Hash"]
    click.echo(tabulate(table_data, headers=headers, tablefmt="grid"))
    
    if verbose:
        click.echo("📋 \nDETAILED VIEW:\n")
        for run in runs[:3]:  
            click.echo(f"\nRun ID: {run['run_id']}")
            click.echo(f"   Model: {run['model_name']}")
            click.echo(f"   Time: {run['timestamp']}")
            click.echo(f"   Duration: {run['training_time']:.2f}s")
            click.echo(f"   Dataset: {run['dataset_shape']}")
            click.echo(f"   Hash: {run['dataset_hash']}")
            click.echo(f"   Parameters: {len(run['params'])} params")

            params = list(run['params'].items())[:5]
            for key, value in params:
                click.echo(f"      - {key}: {value}")
            if len(run['params']) > 5:
                click.echo(f"      ... and {len(run['params']) - 5} more")
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
    click.echo(f"Dataset shape: {run['dataset_shape']}")
    click.echo(f"Dataset hash: {run['dataset_hash']}")
    
    click.echo("\nPARAMETERS:")
    for key, value in run['params'].items():
        click.echo(f"   - {key}: {value}")
    
    if run['metrics']:
        click.echo("\nMETRICS:")
        for key, value in run['metrics'].items():
            click.echo(f"   - {key}: {value:.4f}")
    else:
        click.echo("\nMETRICS:")
        click.echo("   (No metrics tracked yet)")


@cli.command()
@click.argument('run_id')
def delete(run_id):
    if not click.confirm(f"Are you sure you want to delete run {run_id}?"):
        click.echo("Deletion cancelled")
        return
    
    success = storage.delete_run(run_id)
    
    if success:
        click.echo(f"Deleted run: {run_id}")
    else:
        click.echo(f"Failed to delete run: {run_id}")


@cli.command()
@click.confirmation_option(prompt="Delete ALL experiments? This cannot be undone!")
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
    
    avg_time = sum(times) / len(times)
    min_time = min(times)
    max_time = max(times)
    
    click.echo("\nEXPERIMENT STATISTICS\n")
    
    click.echo(f"\nTotal experiments: {count}")
    click.echo(f"Total models used: {len(models)}")
    click.echo(f"\nTraining times:")
    click.echo(f"   - Average: {avg_time:.2f}s")
    click.echo(f"   - Fastest: {min_time:.2f}s")
    click.echo(f"   - Slowest: {max_time:.2f}s")
    
    click.echo(f"\nModels used:")
    for model, count in sorted(models.items(), key=lambda x: x[1], reverse=True):
        click.echo(f"   - {model}: {count} times")


@cli.command()
@click.option('--output', default='experiments.csv', help='Output file name')
def export(output):
    import csv
    
    runs = storage.get_all_runs()
    
    if not runs:
        click.echo("No experiments to export")
        return
    
    fieldnames = ['id','run_id', 'timestamp', 'model_name', 'training_time', 
                  'dataset_shape', 'dataset_hash', 'params', 'metrics']
    
    with open(output, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for run in runs:
            row = run.copy()
            row['params'] = str(row['params'])
            row['metrics'] = str(row['metrics'])
            row['timestamp'] = str(row['timestamp'])
            writer.writerow(row)
    
    click.echo(f"Exported {len(runs)} experiments to {output}")