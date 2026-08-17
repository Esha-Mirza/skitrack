import { Download, CheckCircle2, Loader2 } from 'lucide-react';
import { downloadHTMLReport } from './ReportGenerator';
import { useDarkMode } from '../hooks/useDarkMode';
import React from 'react';

function ExportButton({ run, variant = 'primary' }) {
  const { isDark } = useDarkMode();
  const [exporting, setExporting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleExport = () => {
    setExporting(true);
    try {
      const success = downloadHTMLReport(run, isDark);
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
        <>
          <Loader2 size={14} className="spin-icon" />
          Generating...
        </>
      ) : showSuccess ? (
        <>
          <CheckCircle2 size={14} />
          Exported!
        </>
      ) : (
        <>
          <Download size={14} />
          Export HTML Report
        </>
      )}
    </button>
  );
}

export default ExportButton;
