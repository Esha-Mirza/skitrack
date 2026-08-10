import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

function DatasetSizeChart({ data }) {
  const chartData = data.map(run => ({
    name: run.run_id.slice(-6),
    samples: run.dataset_shape[0],
    features: run.dataset_shape[1],
    model: run.model_name
  }));

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>Dataset Size Comparison</h3>
        <p className="chart-empty">No data available</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Dataset Size Comparison</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#4a5568" />
          <YAxis label={{ value: 'Number of Samples', angle: -90, position: 'insideLeft', style: { fill: '#4a5568' } }} />
          <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} />
          <Legend />
          <Bar dataKey="samples" fill="#4fd1c5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DatasetSizeChart;