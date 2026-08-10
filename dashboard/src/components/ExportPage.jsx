import React from 'react';
import { FileDown, Sparkles } from 'lucide-react';
import ExportButton from './ExportButton';
import { downloadSummaryReport } from './ReportGenerator';
import { useDarkMode } from '../hooks/useDarkMode';

function ExportPage({ runs, onExported }) {
  const { isDark } = useDarkMode();

  const handleSummaryExport = () => {
    const success = downloadSummaryReport(runs, isDark);
    if (success && onExported) onExported();
  };

  return (
    <div className="export-page">
      <div className="page-heading">
        <h2>Export Reports</h2>
        <p className="description">Download standalone HTML reports you can share or archive</p>
      </div>

      <div className="export-summary-card">
        <div>
          <h3><Sparkles size={16} style={{ verticalAlign: -2, marginRight: 6 }} />Full Summary Report</h3>
          <p>All {runs.length} experiments in one HTML file, ready to open or share</p>
        </div>
        <button className="export-btn primary" onClick={handleSummaryExport} disabled={runs.length === 0}>
          <FileDown size={16} />
          Export Summary
        </button>
      </div>

      <div className="export-list">
        <div className="export-list-header">Export an individual run</div>
        {runs.length === 0 && (
          <div className="table-empty">No experiments to export yet</div>
        )}
        {runs.map(run => (
          <div key={run.id} className="export-row">
            <div className="export-row-info">
              <span className="run-name">{run.run_id}</span>
              <span className="run-meta">{run.model_name} · {run.training_time.toFixed(3)}s · {Object.keys(run.params).length} params</span>
            </div>
            <ExportButton run={run} variant="ghost" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExportPage;