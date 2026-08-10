import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { findDataConsistencyIssues } from '../utils/metrics';

function DataConsistencyPanel({ runs }) {
  const issues = findDataConsistencyIssues(runs);

  if (issues.length === 0) {
    return (
      <div className="consistency-panel consistency-ok">
        <ShieldCheck size={20} />
        <div>
          <strong>Dataset consistency looks good</strong>
          <span>Every model family was trained against a single dataset hash — results are directly comparable.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="consistency-panel consistency-warn">
      <div className="consistency-panel-header">
        <AlertTriangle size={18} />
        <strong>Dataset consistency check</strong>
      </div>
      <p className="consistency-panel-desc">
        These model families were trained against more than one dataset hash — comparing their runs directly may be misleading.
      </p>
      <div className="consistency-list">
        {issues.map(({ model, hashCount }) => (
          <div key={model} className="consistency-row">
            <span className="model-badge">{model}</span>
            <span>{hashCount} distinct dataset versions</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DataConsistencyPanel;