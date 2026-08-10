import React from 'react';
import { downloadHTMLReport } from './ReportGenerator';

function ExportButton({ run, variant = 'primary' }) {
  const [exporting, setExporting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleExport = () => {
    setExporting(true);
    try {
      const success = downloadHTMLReport(run);
      if (success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export HTML report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button 
      className={`export-btn ${variant}`}
      onClick={handleExport}
      disabled={exporting}
    >
      {exporting ? (
        'Generating...'
      ) : showSuccess ? (
        '✓ Exported!'
      ) : (
        'Export HTML Report'
      )}
    </button>
  );
}

export default ExportButton;