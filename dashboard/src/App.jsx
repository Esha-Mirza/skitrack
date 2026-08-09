import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/runs');
        setRuns(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Make sure the API is running.');
        setLoading(false);
        console.error('Error:', err);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <h2>📊 Loading experiments...</h2>
        <p>Make sure the API is running on port 5000</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <p>Run: <code>python -c "from experiment_tracker.api import app; app.run(debug=True, port=5000)"</code></p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 Experiment Tracker Dashboard</h1>
        <p>Total experiments: {runs.length}</p>
      </header>

      <div className="dashboard">
        {/* Left: Table */}
        <div className="table-container">
          <h2>📋 Experiments</h2>
          <table className="runs-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Run ID</th>
                <th>Model</th>
                <th>Time (s)</th>
                <th>Samples</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run, index) => (
                <tr key={run.id}>
                  <td>{index + 1}</td>
                  <td className="run-id">{run.run_id}</td>
                  <td>{run.model_name}</td>
                  <td>{run.training_time.toFixed(3)}</td>
                  <td>{run.dataset_shape[0]}</td>
                  <td>
                    <button 
                      className="view-btn"
                      onClick={() => setSelectedRun(run)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Details */}
        <div className="detail-container">
          <h2>🔍 Experiment Details</h2>
          {selectedRun ? (
            <div className="run-detail">
              <h3>{selectedRun.model_name}</h3>
              <p><strong>Run ID:</strong> {selectedRun.run_id}</p>
              <p><strong>Timestamp:</strong> {selectedRun.timestamp}</p>
              <p><strong>Training Time:</strong> {selectedRun.training_time.toFixed(3)}s</p>
              <p><strong>Dataset Shape:</strong> {selectedRun.dataset_shape[0]} rows, {selectedRun.dataset_shape[1]} columns</p>
              <p><strong>Dataset Hash:</strong> {selectedRun.dataset_hash}</p>
              
              <h4>📊 Parameters ({Object.keys(selectedRun.params).length})</h4>
              <div className="params-grid">
                {Object.entries(selectedRun.params).slice(0, 10).map(([key, value]) => (
                  <div key={key} className="param-item">
                    <span className="param-key">{key}:</span>
                    <span className="param-value">{String(value)}</span>
                  </div>
                ))}
                {Object.keys(selectedRun.params).length > 10 && (
                  <div className="param-more">... and {Object.keys(selectedRun.params).length - 10} more</div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>👈 Click "View" on an experiment to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;