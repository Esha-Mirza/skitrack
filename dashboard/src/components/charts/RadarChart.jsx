import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip
} from 'recharts';

function RadarChartComponent({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <h3>Multi-Metric Radar</h3>
        <p className="chart-empty">No data available</p>
      </div>
    );
  }

  // Normalize metrics for radar chart
  const maxTime = Math.max(...data.map(r => r.training_time));
  const maxParams = Math.max(...data.map(r => Object.keys(r.params).length));
  const maxSamples = Math.max(...data.map(r => r.dataset_shape[0]));

  const chartData = data.map((run) => ({
    name: run.run_id.slice(-6),
    'Training Time': maxTime > 0 ? (1 - run.training_time / maxTime) * 100 : 0,
    'Parameters': maxParams > 0 ? (Object.keys(run.params).length / maxParams) * 100 : 0,
    'Samples': maxSamples > 0 ? (run.dataset_shape[0] / maxSamples) * 100 : 0,
    model: run.model_name
  }));

  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

  return (
    <div className="chart-card">
      <h3>Multi-Metric Radar</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={chartData}>
          <PolarGrid strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Radar 
            name="Training Time" 
            dataKey="Training Time" 
            stroke="#667eea" 
            fill="#667eea" 
            fillOpacity={0.3} 
          />
          <Radar 
            name="Parameters" 
            dataKey="Parameters" 
            stroke="#764ba2" 
            fill="#764ba2" 
            fillOpacity={0.3} 
          />
          <Radar 
            name="Samples" 
            dataKey="Samples" 
            stroke="#43e97b" 
            fill="#43e97b" 
            fillOpacity={0.3} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RadarChartComponent;