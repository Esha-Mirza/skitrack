import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import ChartTypeToggle from './ChartTypeToggle';

function TrainingTimeChart({ data }) {
  const [chartType, setChartType] = useState('area');

  const chartData = data.map(run => ({
    name: run.run_id.slice(-6),
    time: parseFloat(run.training_time.toFixed(3)),
    model: run.model_name
  }));

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 8, right: 12, left: 4, bottom: 0 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={40} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }} itemStyle={{ color: 'var(--text-secondary)' }} cursor={{ fill: 'var(--accent-light)' }} />
            <Bar dataKey="time" name="Time (s)" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={40} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }} itemStyle={{ color: 'var(--text-secondary)' }} />
            <Line type="monotone" dataKey="time" name="Time (s)" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        );
      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="trainingTimeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={40} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }} itemStyle={{ color: 'var(--text-secondary)' }} />
            <Area type="monotone" dataKey="time" name="Time (s)" stroke="var(--accent)" strokeWidth={2.5} fill="url(#trainingTimeGradient)" />
          </AreaChart>
        );
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-header-text">
          <h3>Training Time by Run</h3>
          <p className="chart-subtitle">Seconds per run · lower is faster</p>
        </div>
        <ChartTypeToggle chartType={chartType} onChange={setChartType} />
      </div>
      <ResponsiveContainer width="100%" height={260}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

export default TrainingTimeChart;