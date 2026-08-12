import React from 'react';
import { 
  Layers, 
  Cpu, 
  Clock, 
  Hash, 
  Calendar,
  Award
} from 'lucide-react';
import { getAccuracyInfo } from '../../utils/metrics';

function StatsCards({ runs }) {
  const totalRuns = runs.length;
  const uniqueModels = [...new Set(runs.map(r => r.model_name))];
  const avgTime = runs.length ? 
    runs.reduce((sum, r) => sum + r.training_time, 0) / runs.length : 0;
  const totalParams = runs.length ? 
    runs.reduce((sum, r) => sum + Object.keys(r.params).length, 0) : 0;
  
  const today = new Date().toDateString();
  const runsToday = runs.filter(r => 
    new Date(r.timestamp).toDateString() === today
  ).length;

  let bestAccuracyLabel = 'N/A';
  let bestAccuracyTitle = undefined;
  if (runs.length) {
    const best = runs.reduce((b, r) =>
      getAccuracyInfo(r).value > getAccuracyInfo(b).value ? r : b, runs[0]);
    const info = getAccuracyInfo(best);
    bestAccuracyLabel = `${info.value}%${info.isReal ? '' : '*'}`;
    bestAccuracyTitle = info.isReal
      ? undefined
      : '* Simulated — this run has no real metrics captured yet';
  }

  const cards = [
    { 
      label: 'Total Runs', 
      value: totalRuns, 
      icon: Layers,
      color: '#e01e2b',
    },
    { 
      label: 'Models Used', 
      value: uniqueModels.length, 
      icon: Cpu,
      color: '#ff5b63',
    },
    { 
      label: 'Avg Training Time', 
      value: `${avgTime.toFixed(3)}s`, 
      icon: Clock,
      color: '#a3121f',
    },
    { 
      label: 'Total Parameters', 
      value: totalParams, 
      icon: Hash,
      color: '#ff8a8f',
    },
    { 
      label: 'Runs Today', 
      value: runsToday, 
      icon: Calendar,
      color: '#c81124',
    },
    { 
      label: 'Best Accuracy', 
      value: bestAccuracyLabel, 
      icon: Award,
      color: '#ff3b47',
      title: bestAccuracyTitle,
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon" style={{ background: `${card.color}20`, color: card.color }}>
                <Icon size={20} />
              </div>
            </div>
            <div className="stat-value" title={card.title}>{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;