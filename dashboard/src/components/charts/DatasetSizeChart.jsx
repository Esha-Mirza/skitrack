import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
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
        <h3>Dataset Size</h3>
        <p className="chart-empty">No data available</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Dataset Size</h3>
      <p className="chart-subtitle">Sample count used per run</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={40} />
          <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }} itemStyle={{ color: 'var(--text-secondary)' }} cursor={{ fill: 'var(--accent-light)' }} />
          <Bar dataKey="samples" name="Samples" fill="#a3121f" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DatasetSizeChart;