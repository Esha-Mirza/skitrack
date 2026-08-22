import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { formatShortDate } from '../../utils/metrics';

const COLORS = ['#e01e2b', '#ff5b63', '#ffb3b6', '#8f0d18', '#ff8a8f', '#c81124'];

function ModelBreakdownChart({ data }) {
  const { chartData, models } = useMemo(() => {
    const modelSet = new Set(data.map(r => r.model_name));
    const models = Array.from(modelSet);

    const byDate = {};
    data.forEach(run => {
      const dateKey = run.timestamp ? formatShortDate(run.timestamp) : 'Unknown';
      if (!byDate[dateKey]) {
        byDate[dateKey] = { date: dateKey, sortKey: run.timestamp ? new Date(run.timestamp).getTime() : 0 };
        models.forEach(m => { byDate[dateKey][m] = 0; });
      }
      byDate[dateKey][run.model_name] = (byDate[dateKey][run.model_name] || 0) + 1;
    });

    const chartData = Object.values(byDate).sort((a, b) => a.sortKey - b.sortKey);
    return { chartData, models };
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>Model Usage Over Time</h3>
        <p className="chart-empty">No data available</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Model Usage Over Time</h3>
      <p className="chart-subtitle">Which model types you&apos;ve been running, by date</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
          <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }} itemStyle={{ color: 'var(--text-secondary)' }} cursor={{ fill: 'var(--accent-light)' }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
          {models.map((model, index) => (
            <Bar
              key={model}
              dataKey={model}
              name={model}
              stackId="models"
              fill={COLORS[index % COLORS.length]}
              radius={index === models.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
              maxBarSize={36}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ModelBreakdownChart;
