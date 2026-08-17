import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatShortDate } from '../../utils/metrics';

function TrainingTrendChart({ data }) {
  const chartData = useMemo(() => {
    return [...data]
      .filter(run => run.timestamp)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(run => ({
        date: formatShortDate(run.timestamp),
        time: parseFloat(run.training_time.toFixed(3)),
        name: run.run_id.slice(-6),
      }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>Training Time Trend</h3>
        <p className="chart-empty">No timestamped runs available</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Training Time Trend (Over Time)</h3>
      <p className="chart-subtitle">Sorted chronologically · shows if training is getting faster or slower</p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}
            itemStyle={{ color: 'var(--text-secondary)' }}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.name ? `${label} · ${payload[0].payload.name}` : label}
          />
          <Line type="monotone" dataKey="time" name="Time (s)" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrainingTrendChart;
