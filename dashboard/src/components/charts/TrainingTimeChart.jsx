import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import ChartTypeToggle from './ChartTypeToggle';

function TrainingTimeChart({ data }) {
  const [chartType, setChartType] = useState('bar');

  const chartData = data.map(run => ({
    name: run.run_id.slice(-6),
    time: parseFloat(run.training_time.toFixed(3)),
    model: run.model_name
  }));

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#4a5568" />
            <YAxis label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', style: { fill: '#4a5568' } }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} />
            <Legend />
            <Bar dataKey="time" fill="#667eea" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#4a5568" />
            <YAxis label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', style: { fill: '#4a5568' } }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} />
            <Legend />
            <Line type="monotone" dataKey="time" stroke="#667eea" strokeWidth={2} dot={{ fill: '#667eea' }} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#4a5568" />
            <YAxis label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', style: { fill: '#4a5568' } }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} />
            <Legend />
            <Area type="monotone" dataKey="time" fill="#667eea" stroke="#667eea" fillOpacity={0.3} />
          </AreaChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Training Times</h3>
        <ChartTypeToggle chartType={chartType} onChange={setChartType} />
      </div>
      <ResponsiveContainer width="100%" height={280}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

export default TrainingTimeChart;