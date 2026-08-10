import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

function AccuracyChart({ data }) {
  // Simulate accuracy data (since we don't have actual accuracy yet)
  const chartData = data.map((run, index) => ({
    name: run.run_id.slice(-6),
    accuracy: 85 + Math.random() * 15,
    model: run.model_name
  }));

  return (
    <div className="chart-card">
      <h3>Model Accuracy</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#4a5568" />
          <YAxis domain={[0, 100]} label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', style: { fill: '#4a5568' } }} />
          <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} />
          <Legend />
          <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AccuracyChart;