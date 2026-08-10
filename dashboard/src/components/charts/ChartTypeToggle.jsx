import React from 'react';
import { BarChart3, LineChart, AreaChart } from 'lucide-react';

const chartTypes = [
  { id: 'bar', icon: BarChart3, label: 'Bar' },
  { id: 'line', icon: LineChart, label: 'Line' },
  { id: 'area', icon: AreaChart, label: 'Area' },
];

function ChartTypeToggle({ chartType, onChange }) {
  return (
    <div className="chart-type-toggle">
      {chartTypes.map((type) => {
        const Icon = type.icon;
        return (
          <button
            key={type.id}
            className={`chart-type-btn ${chartType === type.id ? 'active' : ''}`}
            onClick={() => onChange(type.id)}
            title={type.label}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}

export default ChartTypeToggle;