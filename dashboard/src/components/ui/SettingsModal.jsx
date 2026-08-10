import React from 'react';
import { X, Palette } from 'lucide-react';

const chartOptions = [
  { id: 'training', label: 'Training Time Chart' },
  { id: 'accuracy', label: 'Accuracy Chart' },
  { id: 'parameters', label: 'Parameter Chart' },
  { id: 'distribution', label: 'Model Distribution' },
  { id: 'scatter', label: 'Scatter Plot' },
];

function SettingsModal({ isOpen, onClose, colors, onColorChange }) {
  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-title">
            <Palette size={20} />
            <h2>Chart Colors</h2>
          </div>
          <button className="settings-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="settings-body">
          <p className="settings-description">
            Customize the colors for each chart
          </p>
          <div className="settings-options">
            {chartOptions.map(option => (
              <div key={option.id} className="color-option">
                <label>{option.label}</label>
                <input
                  type="color"
                  value={colors[option.id] || '#667eea'}
                  onChange={(e) => onColorChange(option.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="settings-footer">
          <button className="settings-apply" onClick={onClose}>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;