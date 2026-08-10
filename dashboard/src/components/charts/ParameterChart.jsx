import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

function ParameterChart({ data }) {
  const chartData = data.map(run => ({
    name: run.run_id.slice(-6),
    params: Object.keys(run.params).length,
    model: run.model_name
  }));

  return (
    <div className="chart-card">
      <h3>Parameter Count per Run</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#4a5568" />
          <YAxis label={{ value: 'Number of Parameters', angle: -90, position: 'insideLeft', style: { fill: '#4a5568' } }} />
          <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} />
          <Legend />
          <Bar dataKey="params" fill="#f6ad55" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ParameterChart;