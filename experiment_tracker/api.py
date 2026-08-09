"""
API for serving experiment data to the React dashboard.
"""

from flask import Flask, jsonify
from flask_cors import CORS
from .storage import Storage

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])  
storage = Storage()


@app.route('/api/runs', methods=['GET'])
def get_runs():
    """Get all experiments as JSON."""
    runs = storage.get_all_runs()
    

    for run in runs:
        run['timestamp'] = str(run['timestamp'])
    
    return jsonify({
        'status': 'success',
        'count': len(runs),
        'data': runs
    })


@app.route('/api/runs/<run_id>', methods=['GET'])
def get_run(run_id):
    """Get a specific experiment by ID."""
    run = storage.get_run(run_id)
    
    if run:
        run['timestamp'] = str(run['timestamp'])
        return jsonify({
            'status': 'success',
            'data': run
        })
    else:
        return jsonify({
            'status': 'error',
            'message': f'Run {run_id} not found'
        }), 404


if __name__ == '__main__':
    app.run(debug=True, port=5000)