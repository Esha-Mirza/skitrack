import React from 'react';

function ComparisonSelector({ runs, selectedRuns, onSelect }) {
  return (
    <div className="comparison-selector">
      <h3>Select Two Experiments to Compare</h3>
      <div className="selector-grid">
        <select 
          value={selectedRuns[0] || ''}
          onChange={(e) => onSelect(0, e.target.value)}
        >
          <option value="">Select Run 1</option>
          {runs.map(run => (
            <option key={run.id} value={run.id}>
              {run.run_id} - {run.model_name}
            </option>
          ))}
        </select>

        <select 
          value={selectedRuns[1] || ''}
          onChange={(e) => onSelect(1, e.target.value)}
        >
          <option value="">Select Run 2</option>
          {runs.map(run => (
            <option key={run.id} value={run.id}>
              {run.run_id} - {run.model_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ComparisonSelector;