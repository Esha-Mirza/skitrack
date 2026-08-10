import React, { useState } from 'react';
import { GitCompare } from 'lucide-react';
import ComparisonSelector from './ComparisonSelector';
import ComparisonView from './ComparisonView';
import ComparisonChart from '../charts/ComparisonChart';

function ComparisonPage({ runs }) {
  const [selectedIds, setSelectedIds] = useState([null, null]);

  const handleSelect = (index, runId) => {
    if (!runId) {
      const newSelected = [...selectedIds];
      newSelected[index] = null;
      setSelectedIds(newSelected);
      return;
    }
    const newSelected = [...selectedIds];
    newSelected[index] = parseInt(runId);
    setSelectedIds(newSelected);
  };

  const getRun = (id) => {
    if (!id) return null;
    return runs.find(run => run.id === id) || null;
  };

  const run1 = getRun(selectedIds[0]);
  const run2 = getRun(selectedIds[1]);

  // Get selected runs for comparison chart
  const selectedRuns = [run1, run2].filter(r => r !== null);

  return (
    <div className="comparison-page">
      <div className="comparison-header-section">
        <div className="comparison-title">
          <GitCompare size={28} className="comparison-icon" />
          <div>
            <h1>Run Comparison</h1>
            <p className="comparison-subtitle">Compare two experiments side by side</p>
          </div>
        </div>
      </div>

      <ComparisonSelector 
        runs={runs} 
        selectedRuns={selectedIds}
        onSelect={handleSelect}
      />
      
      {/* Comparison Chart */}
      {selectedRuns.length > 0 && (
        <ComparisonChart data={selectedRuns} />
      )}
      
      <ComparisonView run1={run1} run2={run2} />
    </div>
  );
}

export default ComparisonPage;