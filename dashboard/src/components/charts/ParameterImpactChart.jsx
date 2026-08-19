import { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { findSharedNumericParam, getAccuracyInfo } from '../../utils/metrics';

function ParameterImpactChart({ data }) {
  const paramKey = useMemo(() => findSharedNumericParam(data), [data]);

  const chartData = useMemo(() => {
    if (!paramKey) return [];

    return data
      .filter(run => run.params && run.params[paramKey] !== undefined)
      .map(run => {
        const info = getAccuracyInfo(run);

        return {
          value: parseFloat(run.params[paramKey]),
          accuracy: info.value,
          name: run.run_id.slice(-6),
          model: run.model_name,
        };
      })
      .filter(run => run.accuracy !== null);
  }, [data, paramKey]);

  if (!paramKey || chartData.length === 0) {
    return (
      <div className="chart-card">
        <h3>Parameter Sensitivity</h3>
        <p className="chart-empty">
          {!paramKey
            ? 'Not enough runs share a common numeric parameter yet'
            : 'No captured accuracy metrics are available for this parameter'}
        </p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Parameter Sensitivity</h3>
      <p className="chart-subtitle">
        <code className="inline-code">{paramKey}</code> vs captured accuracy
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            type="number"
            dataKey="value"
            name={paramKey}
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
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}
            itemStyle={{ color: 'var(--text-secondary)' }}
            formatter={(value, name) =>
              name === 'Accuracy' ? [`${value}%`, name] : [value, name]
            }
          />
          <Scatter name="Runs" data={chartData} fill="#ff5b63" fillOpacity={0.8} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ParameterImpactChart;