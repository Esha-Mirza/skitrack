import React, { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ZAxis
} from 'recharts';
import { getAccuracyInfo } from '../../utils/metrics';

function ScatterChartComponent({ data }) {
  const chartData = useMemo(() => data.map(run => {
    const info = getAccuracyInfo(run);
    return {
      time: parseFloat(run.training_time.toFixed(3)),
      accuracy: info.value,
      isReal: info.isReal,
      model: run.model_name,
      params: Object.keys(run.params).length,
      name: run.run_id.slice(-6)
    };
  }), [data]);

  const anySimulated = chartData.some(d => !d.isReal);

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>Time vs Accuracy</h3>
        <p className="chart-empty">No data available</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Time vs Accuracy</h3>
      <p className="chart-subtitle">
        {anySimulated ? 'Training time vs. accuracy (real where captured, simulated otherwise)' : 'Training time against accuracy'}
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            type="number"
            dataKey="time"
            name="Training Time"
            unit="s"
            stroke="var(--text-muted)"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="number"
            dataKey="accuracy"
            name="Accuracy"
            unit="%"
            domain={[0, 100]}
            stroke="var(--text-muted)"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <ZAxis type="number" dataKey="params" range={[50, 200]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}
            itemStyle={{ color: 'var(--text-secondary)' }}
            formatter={(value, name, props) =>
              name === 'Accuracy' ? [`${value}%${props.payload.isReal ? '' : ' (simulated)'}`, name] : [value, name]
            }
          />
          <Scatter
            name="Experiments"
            data={chartData}
            fill="var(--accent)"
            fillOpacity={0.75}
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScatterChartComponent;