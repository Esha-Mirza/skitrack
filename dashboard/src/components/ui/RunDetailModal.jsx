import { useEffect } from 'react';
import { X, Clock, Database, Hash, Fingerprint, Target } from 'lucide-react';
import ExportButton from '../ExportButton';

function RunDetailModal({ run, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!run) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const metricsEntries = Object.entries(run.metrics || {});

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <span className="model-badge">{run.model_name}</span>
            <h3>{run.run_id}</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="comparison-stat-pills">
            <div className="stat-pill">
              <Clock size={14} />
              <div>
                <span className="pill-value">{run.training_time.toFixed(3)}s</span>
                <span className="pill-label">Time</span>
              </div>
            </div>

            <div className="stat-pill">
              <Database size={14} />
              <div>
                <span className="pill-value">{run.dataset_shape ? run.dataset_shape[0] : 'Not captured'}</span>
                <span className="pill-label">Rows</span>
              </div>
            </div>

            <div className="stat-pill">
              <Hash size={14} />
              <div>
                <span className="pill-value">{Object.keys(run.params).length}</span>
                <span className="pill-label">Params</span>
              </div>
            </div>
          </div>

          <div className="comparison-hash" style={{ marginBottom: 18 }}>
            <Fingerprint size={13} />
            <span title={run.dataset_hash || 'Dataset not captured'}>
              {run.dataset_hash || 'Not captured'}
            </span>
          </div>

          <div className="modal-section-title">
            <Target size={12} style={{ verticalAlign: -1, marginRight: 5 }} />
            Metrics ({metricsEntries.length})
          </div>

          {metricsEntries.length > 0 ? (
            <div className="modal-params-list" style={{ maxHeight: 'none', marginBottom: 20 }}>
              {metricsEntries.map(([key, value]) => (
                <div key={key} className="modal-param-row">
                  <span className="param-key">{key}</span>
                  <span className="param-value">
                    {typeof value === 'number' ? value.toFixed(4) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="chart-subtitle" style={{ marginBottom: 20 }}>
              No metrics captured for this run yet.
            </p>
          )}

          <div className="modal-section-title">Parameters ({Object.keys(run.params).length})</div>

          <div className="modal-params-list">
            {Object.entries(run.params).map(([key, value]) => (
              <div key={key} className="modal-param-row">
                <span className="param-key">{key}</span>
                <span className="param-value" title={String(value)}>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="ghost-btn" onClick={onClose}>Close</button>
          <ExportButton run={run} variant="primary" />
        </div>
      </div>
    </div>
  );
}

export default RunDetailModal;