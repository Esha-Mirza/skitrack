import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import ComparisonPage from './components/ComparisonPage';
import ExportButton from './components/ExportButton';
import './App.css';

function App() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'compare'

  // Colors for charts
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/runs');
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

  // Prepare data for charts
  const chartData = runs.map(run => ({
    name: run.run_id.slice(-6),
    time: parseFloat(run.training_time.toFixed(3)),
    model: run.model_name,
    samples: run.dataset_shape[0]
  }));

  // Count models
  const modelCounts = runs.reduce((acc, run) => {
    acc[run.model_name] = (acc[run.model_name] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(modelCounts).map(([name, value]) => ({
    name,
    value
  }));

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading experiments...</h2>
        <p>Make sure the API is running on port 5000</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <p>Run: <code>python -c "from experiment_tracker.api import app; app.run(debug=True, port=5000)"</code></p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Experiment Tracker Dashboard</h1>
        <p>Total experiments: {runs.length}</p>
      </header>

      {/* Navigation Buttons */}
      <div className="nav-buttons">
        <button 
          className={currentView === 'dashboard' ? 'nav-active' : ''}
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={currentView === 'compare' ? 'nav-active' : ''}
          onClick={() => setCurrentView('compare')}
        >
          Compare Runs
        </button>
      </div>

      {currentView === 'dashboard' ? (
        <>
          {/* Charts Section */}
          <div className="charts-section">
            <h2>Experiment Analytics</h2>
            <div className="charts-grid">
              {/* Bar Chart: Training Times */}
              <div className="chart-card">
                <h3>Training Times</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Time (s)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="time" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart: Model Distribution */}
              {pieData.length > 0 && (
                <div className="chart-card">
                  <h3>Model Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Line Chart: Training Time Trend */}
              <div className="chart-card">
                <h3>Training Time Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Time (s)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="time" stroke="#764ba2" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Dashboard: Table + Details */}
          <div className="dashboard">
            {/* Left: Table */}
            <div className="table-container">
              <h2>Experiments</h2>
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
              <h2>Experiment Details</h2>
              {selectedRun ? (
                <div className="run-detail">
                  <h3>{selectedRun.model_name}</h3>
                  <p><strong>Run ID:</strong> {selectedRun.run_id}</p>
                  <p><strong>Timestamp:</strong> {selectedRun.timestamp}</p>
                  <p><strong>Training Time:</strong> {selectedRun.training_time.toFixed(3)}s</p>
                  <p><strong>Dataset Shape:</strong> {selectedRun.dataset_shape[0]} rows, {selectedRun.dataset_shape[1]} columns</p>
                  <p><strong>Dataset Hash:</strong> {selectedRun.dataset_hash}</p>
                  
                  <h4>Parameters ({Object.keys(selectedRun.params).length})</h4>
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
                  {/* Export Button */}
                  <div className="run-detail-actions">
                    <ExportButton run={selectedRun} />
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <p>Click "View" on an experiment to see details</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <ComparisonPage runs={runs} />
      )}
    </div>
  );
}

export default App;