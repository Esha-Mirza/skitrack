import React from 'react';

function ComparisonView({ run1, run2 }) {
  if (!run1 || !run2) {
    return (
      <div className="comparison-empty">
        <p>Select two experiments to compare</p>
      </div>
    );
  }

  // Get all parameter keys from both runs
  const allParams = new Set([
    ...Object.keys(run1.params),
    ...Object.keys(run2.params)
  ]);

  return (
    <div className="comparison-view">
      <div className="comparison-grid">
        {/* Run 1 */}
        <div className="comparison-column">
          <div className="comparison-header">
            <h3>{run1.model_name}</h3>
            <p className="run-id">{run1.run_id}</p>
          </div>
          <div className="comparison-details">
            <div className="detail-row">
              <span className="detail-label">Training Time</span>
              <span className="detail-value">{run1.training_time.toFixed(3)}s</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Dataset Shape</span>
              <span className="detail-value">{run1.dataset_shape[0]} rows</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Dataset Hash</span>
              <span className="detail-value">{run1.dataset_hash}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Parameters</span>
              <span className="detail-value">{Object.keys(run1.params).length}</span>
            </div>
          </div>
          <div className="comparison-params">
            <h4>Parameters</h4>
            {Object.entries(run1.params).slice(0, 10).map(([key, value]) => (
              <div key={key} className="param-row">
                <span className="param-key">{key}:</span>
                <span className="param-value">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* VS Divider */}
        <div className="comparison-vs">
          <span>VS</span>
        </div>

        {/* Run 2 */}
        <div className="comparison-column">
          <div className="comparison-header">
            <h3>{run2.model_name}</h3>
            <p className="run-id">{run2.run_id}</p>
          </div>
          <div className="comparison-details">
            <div className="detail-row">
              <span className="detail-label">Training Time</span>
              <span className="detail-value">{run2.training_time.toFixed(3)}s</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Dataset Shape</span>
              <span className="detail-value">{run2.dataset_shape[0]} rows</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Dataset Hash</span>
              <span className="detail-value">{run2.dataset_hash}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Parameters</span>
              <span className="detail-value">{Object.keys(run2.params).length}</span>
            </div>
          </div>
          <div className="comparison-params">
            <h4>Parameters</h4>
            {Object.entries(run2.params).slice(0, 10).map(([key, value]) => (
              <div key={key} className="param-row">
                <span className="param-key">{key}:</span>
                <span className="param-value">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parameter Difference Highlight */}
      <div className="comparison-differences">
        <h4>Parameter Differences</h4>
        <div className="differences-grid">
          {Array.from(allParams).map(key => {
            const val1 = run1.params[key];
            const val2 = run2.params[key];
            const isDifferent = val1 !== val2;
            return (
              <div key={key} className={`difference-row ${isDifferent ? 'different' : 'same'}`}>
                <span className="diff-key">{key}</span>
                <span className="diff-val1">{String(val1)}</span>
                <span className="diff-arrow">→</span>
                <span className="diff-val2">{String(val2)}</span>
                <span className="diff-status">
                  {isDifferent ? '⚠️ Different' : '✅ Same'}
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