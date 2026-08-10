import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

function ComparisonChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <h3>Model Comparison</h3>
        <p className="chart-empty">Select experiments to compare</p>
      </div>
    );
  }

  const chartData = data.map((run, index) => ({
    name: run.run_id.slice(-6),
    'Training Time (s)': run.training_time,
    'Parameters': Object.keys(run.params).length,
    'Samples': run.dataset_shape[0],
    model: run.model_name
  }));

  return (
    <div className="chart-card">
      <h3>Model Comparison</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Training Time (s)" fill="#667eea" />
          <Bar dataKey="Parameters" fill="#764ba2" />
          <Bar dataKey="Samples" fill="#43e97b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ComparisonChart;