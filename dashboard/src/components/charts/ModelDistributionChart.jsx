import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

function ModelDistributionChart({ data }) {
  const modelCounts = data.reduce((acc, run) => {
    acc[run.model_name] = (acc[run.model_name] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(modelCounts).map(([name, value]) => ({
    name,
    value
  }));

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>Model Distribution</h3>
        <p className="chart-empty">No data available</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Model Distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ModelDistributionChart;