import React from 'react';
import { ArrowLeftRight, X, FlaskConical } from 'lucide-react';

function ComparisonSelector({ runs, selectedRuns, onSelect, onSwap, onClear }) {
  const hasSelection = selectedRuns[0] || selectedRuns[1];

  return (
    <div className="comparison-selector">
      <div className="comparison-selector-top">
        <h3>
          <FlaskConical size={16} />
          Select two experiments
        </h3>
        {hasSelection && (
          <button className="ghost-btn" onClick={onClear}>
            <X size={14} />
            Clear
          </button>
        )}
      </div>
      <div className="selector-grid">
        <div className="selector-field">
          <label>Run A</label>
          <select
            value={selectedRuns[0] || ''}
            onChange={(e) => onSelect(0, e.target.value)}
          >
            <option value="">Select an experiment</option>
            {runs.map(run => (
              <option key={run.id} value={run.id}>
                {run.run_id} · {run.model_name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="swap-btn"
          onClick={onSwap}
          disabled={!selectedRuns[0] && !selectedRuns[1]}
          title="Swap runs"
          aria-label="Swap runs"
        >
          <ArrowLeftRight size={16} />
        </button>

        <div className="selector-field">
          <label>Run B</label>
          <select
            value={selectedRuns[1] || ''}
            onChange={(e) => onSelect(1, e.target.value)}
          >
            <option value="">Select an experiment</option>
            {runs.map(run => (
              <option key={run.id} value={run.id}>
                {run.run_id} · {run.model_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default ComparisonSelector;
