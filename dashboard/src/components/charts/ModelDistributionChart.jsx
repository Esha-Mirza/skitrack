import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const COLORS = ['#e01e2b', '#ff5b63', '#ffb3b6', '#8f0d18', '#ff8a8f', '#c81124'];

function ModelDistributionChart({ data }) {
  const modelCounts = data.reduce((acc, run) => {
    acc[run.model_name] = (acc[run.model_name] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(modelCounts).map(([name, value]) => ({
    name,
    value
  }));

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>Model Distribution</h3>
        <p className="chart-empty">No data available</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Model Distribution</h3>
      <p className="chart-subtitle">Share of runs by model type</p>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie
            data={chartData}
            cx="38%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={48}
            paddingAngle={2}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--bg-card)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }} itemStyle={{ color: 'var(--text-secondary)' }} />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ModelDistributionChart;
