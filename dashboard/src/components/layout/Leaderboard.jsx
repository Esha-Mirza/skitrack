import { Zap, Trophy, Layers3, Eye, Sparkles } from 'lucide-react';
import {
  getFastestRun,
  getBestAccuracyRun,
  getMostParamsRun,
  getAccuracyInfo
} from '../../utils/metrics';

function Leaderboard({ runs, onViewRun }) {
  if (!runs.length) {
    return (
      <div className="leaderboard-empty">
        <Sparkles size={20} />
        <p>Quick highlights will show up here once you&apos;ve tracked a few experiments</p>
      </div>
    );
  }

  const fastest = getFastestRun(runs);
  const bestAccuracy = getBestAccuracyRun(runs);
  const mostParams = getMostParamsRun(runs);
  const accuracyInfo = getAccuracyInfo(bestAccuracy);

  const cards = [
    {
      id: 'fastest',
      icon: Zap,
      label: 'Fastest Run',
      run: fastest,
      metric: fastest ? `${fastest.training_time.toFixed(3)}s` : 'N/A',
      color: '#e01e2b',
    },
    {
      id: 'accuracy',
      icon: Trophy,
      label: 'Best Accuracy',
      run: bestAccuracy,
      metric: accuracyInfo.isReal ? `${accuracyInfo.value}%` : 'N/A',
      color: '#ff5b63',
    },
    {
      id: 'params',
      icon: Layers3,
      label: 'Most Parameters',
      run: mostParams,
      metric: mostParams
        ? `${Object.keys(mostParams.params || {}).length} params`
        : 'N/A',
      color: '#a3121f',
    },
  ];

  return (
    <div className="leaderboard-grid">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="leaderboard-card"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div
              className="leaderboard-card-icon"
              style={{
                background: `${card.color}20`,
                color: card.color
              }}
            >
              <Icon size={18} />
            </div>
            <div className="leaderboard-card-body">
              <span className="leaderboard-label">{card.label}</span>
              <span className="leaderboard-metric">{card.metric}</span>
              {card.run && (
                <span className="leaderboard-run-id">
                  {card.run.run_id} · {card.run.model_name}
                </span>
              )}
            </div>
            {card.run && (
              <button
                className="leaderboard-view-btn"
                onClick={() => onViewRun(card.run)}
                title="View run"
              >
                <Eye size={15} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Leaderboard;