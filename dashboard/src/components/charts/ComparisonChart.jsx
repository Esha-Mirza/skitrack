import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import {
  getAccuracyInfo,
  getHyperparameterCount
} from '../../utils/metrics';

function ComparisonChart({ run1, run2 }) {
  const accuracy1 =
    getAccuracyInfo(run1);

  const accuracy2 =
    getAccuracyInfo(run2);

  const data = [
    {
      metric: 'Training Time (s)',
      run1: run1.training_time,
      run2: run2.training_time,
    },
    {
      metric: 'Hyperparameters',
      run1: getHyperparameterCount(run1),
      run2: getHyperparameterCount(run2),
    },
    ...(run1.dataset_shape?.[0] != null &&
    run2.dataset_shape?.[0] != null
      ? [
          {
            metric: 'Rows',
            run1: run1.dataset_shape[0],
            run2: run2.dataset_shape[0],
          },
        ]
      : []),
    ...(accuracy1.isReal &&
    accuracy2.isReal
      ? [
          {
            metric: 'Accuracy (%)',
            run1: accuracy1.value,
            run2: accuracy2.value,
          },
        ]
      : []),
  ];

  return (
    <div className="chart-card">
      <h3>Captured Values</h3>

      <p className="chart-subtitle">
        Actual recorded values; metrics with
        different units are shown as separate
        categories, each scaled to its own range
        so no single metric visually overwhelms
        the others.
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 8,
          fontSize: 12,
          color: 'var(--text-secondary)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: 'var(--accent)',
              display: 'inline-block',
            }}
          />
          {run1.run_id}
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: 'var(--comparison-secondary)',
              display: 'inline-block',
            }}
          />
          {run2.run_id}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 16,
        }}
      >
        {data.map((entry) => (
          <div key={entry.metric}>
            <ResponsiveContainer
              width="100%"
              height={180}
            >
              <BarChart
                data={[entry]}
                margin={{
                  top: 8,
                  right: 8,
                  left: 4,
                  bottom: 8,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-color)"
                  vertical={false}
                />

                <XAxis
                  dataKey="metric"
                  stroke="var(--text-muted)"
                  tick={{
                    fontSize: 11,
                    fill: 'var(--text-muted)'
                  }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="var(--text-muted)"
                  tick={{
                    fontSize: 11,
                    fill: 'var(--text-muted)'
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />

                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    fontSize: 12,
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-hover)'
                  }}
                  labelStyle={{
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    marginBottom: 4
                  }}
                  itemStyle={{
                    color: 'var(--text-secondary)'
                  }}
                  cursor={{
                    fill: 'var(--accent-light)',
                    fillOpacity: 0.12
                  }}
                />

                <Bar
                  dataKey="run1"
                  name={run1.run_id}
                  fill="var(--accent)"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="run2"
                  name={run2.run_id}
                  fill="var(--comparison-secondary)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComparisonChart;