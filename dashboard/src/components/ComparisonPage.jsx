import React, { useState } from 'react';
import ComparisonSelector from './ComparisonSelector';
import ComparisonView from './ComparisonView';

function ComparisonPage({ runs }) {
  const [selectedIds, setSelectedIds] = useState([null, null]);

  const handleSelect = (index, runId) => {
    const newSelected = [...selectedIds];
    newSelected[index] = runId;
    setSelectedIds(newSelected);
  };

  const handleSwap = () => {
    setSelectedIds([selectedIds[1], selectedIds[0]]);
  };

  const handleClear = () => {
    setSelectedIds([null, null]);
  };

  const getRun = (id) => {
    if (!id) return null;
    return runs.find(run => run.id === parseInt(id)) || null;
  };

  const run1 = getRun(selectedIds[0]);
  const run2 = getRun(selectedIds[1]);

  return (
    <div className="comparison-page">
      <div className="page-heading">
        <h2>Run Comparison</h2>
        <p className="description">Compare two experiments side by side to spot what changed</p>
      </div>

      <ComparisonSelector
        runs={runs}
        selectedRuns={selectedIds}
        onSelect={handleSelect}
        onSwap={handleSwap}
        onClear={handleClear}
      />

      <ComparisonView run1={run1} run2={run2} />
    </div>
  );
}

export default ComparisonPage;
