import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import { getAccuracyInfo } from '../../utils/metrics';

const METRICS = {
  time: {
    label: 'Training Time',
    unit: 's',
    chartType: 'bar',
    getValue: (run) => parseFloat(run.training_time.toFixed(3)),
  },
  params: {
    label: 'Parameters',
    unit: '',
    chartType: 'bar',
    getValue: (run) => Object.keys(run.params).length,
  },
  samples: {
    label: 'Samples',
    unit: '',
    chartType: 'bar',
    getValue: (run) => run.dataset_shape[0],
  },
  accuracy: {
    label: 'Accuracy',
    unit: '%',
    // Accuracy is a bounded 0-100% value, not an open-ended count like the
    // others — two close percentages (or one near 0 for a run with no real
    // metrics yet) don't read as a meaningful comparison on a linear bar.
    // A radial gauge shows "how full" each run is, which is the actually
    // meaningful comparison for a percentage metric.
    chartType: 'radial',
    getValue: (run) => getAccuracyInfo(run).value,
    isRealValue: (run) => getAccuracyInfo(run).isReal,
  },
};

function BarComparison({ chartData, metric }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
        <YAxis
          stroke="var(--text-muted)"
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }}
          labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}
          itemStyle={{ color: 'var(--text-secondary)' }}
          cursor={{ fill: 'var(--accent-light)' }}
          formatter={(value) => [`${value}${metric.unit}`, metric.label]}
        />
        <Bar dataKey="value" name={metric.label} radius={[6, 6, 0, 0]} maxBarSize={60}>
          <Cell fill="var(--accent)" />
          <Cell fill="#6e5a5c" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function RadialComparison({ chartData }) {
  // Two concentric rings, each filled to its run's accuracy percentage —
  // outer ring is run1, inner ring is run2.
  const radialData = [
    { name: chartData[0].name, value: chartData[0].value, fill: 'var(--accent)' },
    { name: chartData[1].name, value: chartData[1].value, fill: '#6e5a5c' },
  ];

  return (
    <div className="radial-comparison">
      <ResponsiveContainer width="100%" height={260}>
        <RadialBarChart
          innerRadius="35%"
          outerRadius="90%"
          data={radialData}
          startAngle={90}
          endAngle={-270}
          barGap={4}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" background={{ fill: 'var(--bg-hover)' }} cornerRadius={8}>
            {radialData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </RadialBar>
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}
            itemStyle={{ color: 'var(--text-secondary)' }}
            formatter={(value) => [`${value}%`, 'Accuracy']}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="radial-legend">
        {radialData.map((entry, i) => (
          <div key={i} className="radial-legend-item">
            <span className="radial-legend-dot" style={{ background: entry.fill }} />
            <span className="radial-legend-name">{entry.name}</span>
            <span className="radial-legend-value">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonChart({ run1, run2 }) {
  const [metricKey, setMetricKey] = useState('time');

  const chartData = useMemo(() => {
    if (!run1 || !run2) return [];
    const metric = METRICS[metricKey];
    return [
      { name: run1.run_id.slice(-6), model: run1.model_name, value: metric.getValue(run1) },
      { name: run2.run_id.slice(-6), model: run2.model_name, value: metric.getValue(run2) },
    ];
  }, [run1, run2, metricKey]);

  if (!run1 || !run2) {
    return (
      <div className="chart-card">
        <h3>Metric Comparison</h3>
        <p className="chart-empty">Select two experiments above to compare</p>
      </div>
    );
  }

  const metric = METRICS[metricKey];
  const anySimulated = metric.isRealValue && (!metric.isRealValue(run1) || !metric.isRealValue(run2));

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-header-text">
          <h3>Metric Comparison</h3>
          <p className="chart-subtitle">
            {anySimulated ? 'Accuracy simulated where not yet captured' : 'Pick a metric to compare the two selected runs'}
          </p>
        </div>
        <div className="metric-toggle">
          {Object.entries(METRICS).map(([key, m]) => (
            <button
              key={key}
              className={`metric-toggle-btn ${metricKey === key ? 'active' : ''}`}
              onClick={() => setMetricKey(key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {metric.chartType === 'radial'
        ? <RadialComparison chartData={chartData} />
        : <BarComparison chartData={chartData} metric={metric} />}
    </div>
  );
}

export default ComparisonChart;