import {
  Layers,
  Cpu,
  Clock,
  Hash,
  Calendar,
  Award
} from 'lucide-react';
import {
  getAccuracyInfo,
  getBestAccuracyRun,
  getHyperparameterCount
} from '../../utils/metrics';

function StatsCards({ runs }) {
  const totalRuns = runs.length;
  const uniqueModels = [
    ...new Set(runs.map(r => r.model_name))
  ];

  const totalHyperparameters = runs.reduce(
    (sum, run) =>
      sum + getHyperparameterCount(run),
    0
  );

  const avgTime = runs.length
    ? runs.reduce(
        (sum, r) => sum + r.training_time,
        0
      ) / runs.length
    : 0;

  const today = new Date().toDateString();

  const runsToday = runs.filter(
    r =>
      new Date(r.timestamp).toDateString() ===
      today
  ).length;

  const bestAccuracyRun =
    getBestAccuracyRun(runs);

  const bestAccuracyInfo =
    getAccuracyInfo(bestAccuracyRun);

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
      label: 'Hyperparameter Entries',
      value: totalHyperparameters,
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
      value: bestAccuracyInfo.isReal
        ? `${bestAccuracyInfo.value}%`
        : 'N/A',
      icon: Award,
      color: '#f77780',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="stat-card"
          >
            <div className="stat-card-header">
              <div
                className="stat-icon"
                style={{
                  background: `${card.color}20`,
                  color: card.color
                }}
              >
                <Icon size={20} />
              </div>
            </div>

            <div className="stat-value">
              {card.value}
            </div>

            <div className="stat-label">
              {card.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;