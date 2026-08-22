import {
  Scale,
  Clock,
  Database,
  Hash,
  Fingerprint,
  Target
} from 'lucide-react';

import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

import ExportButton from './ExportButton';
import ComparisonChart from './charts/ComparisonChart';

import {
  getAccuracyInfo,
  getHyperparameterCount
} from '../utils/metrics';

function RunSummaryCard({ run, accentClass }) {
  const accuracy = getAccuracyInfo(run);

  return (
    <div
      className={`comparison-column ${accentClass}`}
    >
      <div className="comparison-header">
        <div>
          <span className="model-badge">
            {run.model_name}
          </span>
          <h3>{run.run_id}</h3>
        </div>

        <ExportButton
          run={run}
          variant="ghost"
        />
      </div>

      <div className="comparison-stat-pills">
        <div className="stat-pill">
          <Clock size={14} />
          <div>
            <span className="pill-value">
              {run.training_time.toFixed(3)}s
            </span>
            <span className="pill-label">
              Training Time
            </span>
          </div>
        </div>

        <div className="stat-pill">
          <Database size={14} />
          <div>
            <span className="pill-value">
              {run.dataset_shape
                ? run.dataset_shape[0]
                : 'Not captured'}
            </span>
            <span className="pill-label">
              Rows
            </span>
          </div>
        </div>

        <div className="stat-pill">
          <Hash size={14} />
          <div>
            <span className="pill-value">
              {getHyperparameterCount(run)}
            </span>
            <span className="pill-label">
              Hyperparameters
            </span>
          </div>
        </div>

        <div className="stat-pill">
          <Target size={14} />
          <div>
            <span className="pill-value">
              {accuracy.isReal
                ? `${accuracy.value}%`
                : 'Not captured'}
            </span>
            <span className="pill-label">
              Accuracy
            </span>
          </div>
        </div>
      </div>

      <div className="comparison-hash">
        <Fingerprint size={13} />
        <span
          title={
            run.dataset_hash ||
            'Dataset not captured'
          }
        >
          {run.dataset_hash ||
            'Not captured'}
        </span>
      </div>
    </div>
  );
}

function ComparisonView({ run1, run2 }) {
  const radarData = useMemo(() => {
    if (!run1 || !run2) return [];

    const minTime = Math.min(run1.training_time, run2.training_time) || 1;
    const hasDatasetSizes = Boolean(run1.dataset_shape && run2.dataset_shape);
    const maxSamples = hasDatasetSizes
      ? Math.max(run1.dataset_shape[0], run2.dataset_shape[0]) || 1
      : 1;
    const maxParams = Math.max(
      Object.keys(run1.params || {}).length,
      Object.keys(run2.params || {}).length
    ) || 1;

    const speedScore = run =>
      parseFloat((100 * minTime / run.training_time).toFixed(1));
    const samplesScore = run =>
      parseFloat((100 * run.dataset_shape[0] / maxSamples).toFixed(1));
    const paramsScore = run =>
      parseFloat((100 * Object.keys(run.params || {}).length / maxParams).toFixed(1));

    const rows = [
      { metric: 'Speed', run1: speedScore(run1), run2: speedScore(run2) },
      ...(hasDatasetSizes
        ? [{ metric: 'Data Size', run1: samplesScore(run1), run2: samplesScore(run2) }]
        : []),
      { metric: 'Params', run1: paramsScore(run1), run2: paramsScore(run2) },
    ];

    const acc1 = getAccuracyInfo(run1);
    const acc2 = getAccuracyInfo(run2);
    if (acc1.isReal && acc2.isReal) {
      rows.splice(1, 0, {
        metric: 'Accuracy',
        run1: acc1.value,
        run2: acc2.value,
      });
    }

    return rows;
  }, [run1, run2]);
  if (!run1 || !run2) {
    return (
      <div className="comparison-empty">
        <Scale size={32} />
        <p>
          Select two experiments above to compare
          their runs side by side
        </p>
      </div>
    );
  }

  const allParams = Array.from(
    new Set([
      ...Object.keys(run1.params || {}),
      ...Object.keys(run2.params || {})
    ])
  );

  const differentCount =
    allParams.filter(
      key =>
        run1.params[key] !==
        run2.params[key]
    ).length;

  const accuracy1 =
    getAccuracyInfo(run1);

  const accuracy2 =
    getAccuracyInfo(run2);

  const sameDataset =
    Boolean(
      run1.dataset_hash &&
      run2.dataset_hash &&
      run1.dataset_hash ===
        run2.dataset_hash
    );

  return (
    <div className="comparison-view">
      <div className="comparison-grid">
        <RunSummaryCard
          run={run1}
          accentClass="column-a"
        />

        <div className="comparison-vs">
          <span>VS</span>
        </div>

        <RunSummaryCard
          run={run2}
          accentClass="column-b"
        />
      </div>

      <div className="comparison-radar-card">
        <div className="chart-header-text">
          <h3>Multi-Metric Overview</h3>
          <p className="chart-subtitle">
            Speed, data size, and parameter count — normalized to 0–100
            {getAccuracyInfo(run1).isReal && getAccuracyInfo(run2).isReal
              ? ', with captured accuracy'
              : ''}
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData} outerRadius="72%">
            <PolarGrid stroke="var(--border-color)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              axisLine={false}
            />
            <Radar
              name={run1.run_id}
              dataKey="run1"
              stroke="var(--accent)"
              fill="var(--accent)"
              fillOpacity={0.35}
            />
            <Radar
              name={run2.run_id}
              dataKey="run2"
              stroke="var(--comparison-secondary)"
              fill="var(--comparison-secondary)"
              fillOpacity={0.25}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                fontSize: 12,
                color: 'var(--text-primary)'
              }}
              labelStyle={{
                color: 'var(--text-primary)',
                fontWeight: 600,
                marginBottom: 4
              }}
              itemStyle={{ color: 'var(--text-secondary)' }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: 12,
                color: 'var(--text-secondary)'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="comparison-radar-card">
        <div className="chart-header-text">
          <h3>Factual Run Comparison</h3>
          <p className="chart-subtitle">
            Captured values only. No composite score
            or normalized ranking is applied.
          </p>
        </div>

        <div className="comparison-differences">
          <div className="differences-table">
            <div className="differences-row differences-row-head">
              <span>Metric</span>
              <span>{run1.run_id}</span>
              <span>{run2.run_id}</span>
              <span>Status</span>
            </div>

            <div className="differences-row">
              <span className="diff-key">
                Training Time
              </span>
              <span className="diff-val">
                {run1.training_time.toFixed(3)}s
              </span>
              <span className="diff-val">
                {run2.training_time.toFixed(3)}s
              </span>
              <span className="diff-status-chip chip-same">
                Captured
              </span>
            </div>

            <div className="differences-row">
              <span className="diff-key">
                Rows
              </span>
              <span className="diff-val">
                {run1.dataset_shape?.[0] ??
                  'Not captured'}
              </span>
              <span className="diff-val">
                {run2.dataset_shape?.[0] ??
                  'Not captured'}
              </span>
              <span className="diff-status-chip chip-same">
                Captured
              </span>
            </div>

            <div className="differences-row">
              <span className="diff-key">
                Hyperparameters
              </span>
              <span className="diff-val">
                {getHyperparameterCount(run1)}
              </span>
              <span className="diff-val">
                {getHyperparameterCount(run2)}
              </span>
              <span className="diff-status-chip chip-same">
                Captured
              </span>
            </div>

            <div className="differences-row">
              <span className="diff-key">
                Accuracy
              </span>
              <span className="diff-val">
                {accuracy1.isReal
                  ? `${accuracy1.value}%`
                  : 'Not captured'}
              </span>
              <span className="diff-val">
                {accuracy2.isReal
                  ? `${accuracy2.value}%`
                  : 'Not captured'}
              </span>
              <span className="diff-status-chip chip-same">
                Captured when available
              </span>
            </div>

            <div className="differences-row">
              <span className="diff-key">
                Dataset Hash
              </span>
              <span className="diff-val">
                {run1.dataset_hash ||
                  'Not captured'}
              </span>
              <span className="diff-val">
                {run2.dataset_hash ||
                  'Not captured'}
              </span>
              <span
                className={`diff-status-chip ${
                  sameDataset
                    ? 'chip-same'
                    : 'chip-different'
                }`}
              >
                {sameDataset
                  ? 'Same dataset'
                  : 'Different or unavailable'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ComparisonChart
        run1={run1}
        run2={run2}
      />

      <div className="comparison-differences">
        <div className="differences-heading">
          <h4>
            Hyperparameter Differences
          </h4>
          <span className="differences-count">
            {differentCount} of {allParams.length}{' '}
            differ
          </span>
        </div>

        <div className="differences-table">
          <div className="differences-row differences-row-head">
            <span>Hyperparameter</span>
            <span>{run1.run_id}</span>
            <span>{run2.run_id}</span>
            <span>Status</span>
          </div>

          {allParams.map(key => {
            const val1 = run1.params[key];
            const val2 = run2.params[key];

            const isDifferent =
              val1 !== val2;

            return (
              <div
                key={key}
                className={`differences-row ${
                  isDifferent
                    ? 'is-different'
                    : 'is-same'
                }`}
              >
                <span className="diff-key">
                  {key}
                </span>

                <span className="diff-val">
                  {String(val1 ?? '—')}
                </span>

                <span className="diff-val">
                  {String(val2 ?? '—')}
                </span>

                <span
                  className={`diff-status-chip ${
                    isDifferent
                      ? 'chip-different'
                      : 'chip-same'
                  }`}
                >
                  {isDifferent
                    ? 'Different'
                    : 'Same'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ComparisonView;