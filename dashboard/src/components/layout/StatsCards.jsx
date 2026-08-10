import React from 'react';
import { 
  Layers, 
  Cpu, 
  Clock, 
  Hash, 
  TrendingUp, 
  Calendar,
  Award
} from 'lucide-react';

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

  const bestAccuracy = runs.length ? '96.7%' : 'N/A'; // Simulated

  const cards = [
    { 
      label: 'Total Runs', 
      value: totalRuns, 
      icon: Layers,
      color: '#667eea',
    },
    { 
      label: 'Models Used', 
      value: uniqueModels.length, 
      icon: Cpu,
      color: '#764ba2',
    },
    { 
      label: 'Avg Training Time', 
      value: `${avgTime.toFixed(3)}s`, 
      icon: Clock,
      color: '#48bb78',
    },
    { 
      label: 'Total Parameters', 
      value: totalParams, 
      icon: Hash,
      color: '#f6ad55',
    },
    { 
      label: 'Runs Today', 
      value: runsToday, 
      icon: Calendar,
      color: '#fc8181',
    },
    { 
      label: 'Best Accuracy', 
      value: bestAccuracy, 
      icon: Award,
      color: '#4fd1c5',
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
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;