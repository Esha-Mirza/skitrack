import { useState } from 'react';
import { Trophy, Medal, Award, Database, Eye, ListChecks, Zap, Target } from 'lucide-react';
import { buildDatasetLeaderboard } from '../../utils/metrics';

const RANK_ICONS = [Trophy, Medal, Award];
const RANK_COLORS = ['#ffc107', '#c0c0c0', '#cd7f32'];

function DatasetLeaderboard({ runs, onViewRun }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!runs.length) {
    return (
      <div className="dataset-leaderboard-empty">
        <ListChecks size={28} />
        <p>No experiments tracked yet. Once you run some training, the best model for each dataset will show up here.</p>
      </div>
    );
  }

  const groups = buildDatasetLeaderboard(runs);
  const activeIndex = Math.min(selectedIndex, groups.length - 1);
  const group = groups[activeIndex];
  const anySimulated = group.ranked.some(function (m) { return !m.isReal; });

  return (
    <div className="dataset-leaderboard">
      <div className="chart-header" style={{ marginBottom: 16 }}>
        <div className="chart-header-text">
          <h2 style={{ fontSize: 18 }}>
            <Database size={18} style={{ verticalAlign: -3, marginRight: 8 }} />
            Model Leaderboard by Dataset
          </h2>
          <p className="chart-subtitle">Ranked by speed and accuracy, per dataset - not lumped together across everything</p>
        </div>
        {groups.length > 1 && (
          <div className="metric-toggle">
            {groups.map(function (g, i) {
              return (
                <button
                  key={g.datasetHash}
                  className={'metric-toggle-btn' + (i === activeIndex ? ' active' : '')}
                  onClick={function () { setSelectedIndex(i); }}
                  title={g.datasetHash}
                >
                  {(g.datasetName || ('Dataset ' + (i + 1))) + ' - ' + g.samples + ' rows'}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="dataset-group-card">
        <div className="dataset-group-header">
          <div>
            <span className="dataset-group-hash" title={group.datasetHash}>
              {group.datasetName || group.datasetHash}
            </span>
            <span className="dataset-group-meta">
              {group.samples} samples - {group.features} features - {group.ranked.length} model{group.ranked.length !== 1 ? 's' : ''} compared
            </span>
          </div>
          {group.ranked.length > 0 && (
            <div className="dataset-group-recommend">
              <span className="recommend-label">Recommended</span>
              <span className="recommend-model">{group.ranked[0].modelName}</span>
            </div>
          )}
        </div>

        <div className="dataset-rank-list">
          <div className="dataset-rank-row dataset-rank-header">
            <span></span>
            <span>Model</span>
            <span><Target size={11} style={{ verticalAlign: -1 }} /> Accuracy</span>
            <span><Zap size={11} style={{ verticalAlign: -1 }} /> Speed</span>
            <span>Score</span>
            <span></span>
          </div>
          {group.ranked.map(function (entry) {
            const RankIcon = RANK_ICONS[entry.rank - 1];
            return (
              <div key={entry.modelName} className="dataset-rank-row">
                <div className="dataset-rank-position">
                  {RankIcon
                    ? <RankIcon size={18} style={{ color: RANK_COLORS[entry.rank - 1] }} />
                    : <span className="rank-number">{'#' + entry.rank}</span>}
                </div>
                <div className="dataset-rank-info">
                  <span className="dataset-rank-model">{entry.modelName}</span>
                  <span className="dataset-rank-run">{entry.run.run_id}</span>
                </div>
                <span className="dataset-rank-stat">
                  {entry.accuracyValue}{'%'}{!entry.isReal ? '*' : ''}
                </span>
                <span className="dataset-rank-stat">
                  {entry.run.training_time.toFixed(3)}{'s'}
                </span>
                <div className="dataset-rank-score">
                  <div className="dataset-rank-bar-wrap">
                    <div
                      className="dataset-rank-bar"
                      style={{ width: Math.max(entry.composite, 2) + '%' }}
                    />
                  </div>
                  <span className="dataset-rank-value">{entry.composite}</span>
                </div>
                <button className="leaderboard-view-btn" onClick={function () { onViewRun(entry.run); }} title="View run">
                  <Eye size={14} />
                </button>
              </div>
            );
          })}
        </div>
        {anySimulated && (
          <p className="dataset-group-footnote">* Simulated - this run has no real metrics captured yet</p>
        )}
      </div>
    </div>
  );
}

export default DatasetLeaderboard;