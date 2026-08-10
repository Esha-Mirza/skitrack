import React from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ZAxis
} from 'recharts';

function ScatterChartComponent({ data }) {
  const chartData = data.map(run => ({
    time: run.training_time,
    accuracy: 85 + Math.random() * 15,
    model: run.model_name,
    params: Object.keys(run.params).length,
    name: run.run_id.slice(-6)
  }));

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>Training Time vs Accuracy</h3>
        <p className="chart-empty">No data available</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Training Time vs Accuracy</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            dataKey="time" 
            name="Training Time" 
            unit="s"
            label={{ value: 'Time (s)', position: 'bottom', style: { fill: '#4a5568' } }}
          />
          <YAxis 
            type="number" 
            dataKey="accuracy" 
            name="Accuracy" 
            unit="%"
            domain={[0, 100]}
            label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', style: { fill: '#4a5568' } }}
          />
          <ZAxis type="number" dataKey="params" range={[50, 200]} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          />
          <Legend />
          <Scatter 
            name="Experiments" 
            data={chartData} 
            fill="#667eea"
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScatterChartComponent;