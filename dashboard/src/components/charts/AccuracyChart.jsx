import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { getAccuracyInfo } from '../../utils/metrics';

const COLORS = ['#e01e2b', '#ff5b63', '#ff8a8f', '#c81124', '#ffb3b6', '#8f0d18'];

function AccuracyChart({ data }) {

  const chartData = useMemo(() => data.map((run) => {
    const info = getAccuracyInfo(run);
    return {
      name: run.run_id.slice(-6),
      accuracy: info.value,
      isReal: info.isReal,
      model: run.model_name,
    };
  }), [data]);

  const anySimulated = chartData.some(d => !d.isReal);

  return (
    <div className="chart-card">
      <h3>Model Accuracy</h3>
      <p className="chart-subtitle">
        {anySimulated ? 'Real accuracy where captured, simulated otherwise' : 'Accuracy per run (%)'}
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={36} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}
            itemStyle={{ color: 'var(--text-secondary)' }}
            cursor={{ fill: 'var(--accent-light)' }}
            formatter={(value, name, props) => [`${value}%${props.payload.isReal ? '' : ' (simulated)'}`, 'Accuracy']}
          />
          <Bar dataKey="accuracy" name="Accuracy (%)" radius={[6, 6, 0, 0]} maxBarSize={36}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={entry.isReal ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AccuracyChart;
