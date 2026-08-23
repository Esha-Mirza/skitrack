import { useState } from 'react';
import { Trophy, Medal, Award, Database, Eye, ListChecks, Target } from 'lucide-react';
import { buildDatasetLeaderboard } from '../../utils/metrics';

const RANK_ICONS = [Trophy, Medal, Award];
const RANK_COLORS = ['#b12020', '#c4c2c2', '#cd7f32'];

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

  if (!groups.length) {
    return (
      <div className="dataset-leaderboard-empty">
        <ListChecks size={28} />
        <p>No experiments with comparable accuracy metrics are available yet.</p>
      </div>
    );
  }

  const activeIndex = Math.min(
    selectedIndex,
    groups.length - 1
  );

  const group = groups[activeIndex];

  return (
    <div className="dataset-leaderboard">
      {groups.length > 1 && (
        <div className="dataset-tabs">
          {groups.map((g, i) => (
            <button
              key={g.datasetHash}
              className={
                'dataset-tab' +
                (i === activeIndex ? ' active' : '')
              }
              onClick={() => setSelectedIndex(i)}
              title={g.datasetHash}
            >
              {(g.datasetName || `Dataset ${i + 1}`) +
                ' - ' +
                (g.samples ?? 'Unknown') +
                ' rows'}
            </button>
          ))}
        </div>
      )}

      <div className="dataset-leaderboard-heading">
        <div className="chart-header-text">
          <h2>
            <Database
              size={18}
              style={{
                verticalAlign: -3,
                marginRight: 8,
              }}
            />
            Model Leaderboard by Dataset
          </h2>
          <p className="chart-subtitle">
            Ranked within each dataset using 80% predictive accuracy and 20% training efficiency.
          </p>
        </div>
      </div>

      <div className="dataset-group-card">
        <div className="dataset-group-header">
          <div className="dataset-group-details">
            <span className="dataset-group-name">
              {group.datasetName || `Dataset ${activeIndex + 1}`}
            </span>
            <span className="dataset-group-meta">
              {group.samples ?? 'Unknown'} samples -{' '}
              {group.features ?? 'Unknown'} features -{' '}
              {group.ranked.length} model
              {group.ranked.length !== 1 ? 's' : ''}{' '}
              compared
            </span>
            <div className="dataset-hash-line">
              <span>Dataset Hash:</span>
              <span
                className="dataset-group-hash"
                title={group.datasetHash}
              >
                {group.datasetHash}
              </span>
            </div>
          </div>

          {group.ranked.length > 0 && (
            <div className="dataset-group-recommend">
              <span className="recommend-label">
                Best Overall
              </span>
              <span className="recommend-model">
                {group.ranked[0].modelName}
              </span>
            </div>
          )}
        </div>

        {group.ranked.length > 0 ? (
          <div className="dataset-rank-list">
            <div className="dataset-rank-row dataset-rank-header">
              <span></span>
              <span>Model</span>
              <span>
                <Target
                  size={11}
                  style={{
                    verticalAlign: -1,
                  }}
                />{' '}
                Accuracy
              </span>
              <span>Training Time</span>
              <span>Score</span>
              <span>Rank</span>
              <span></span>
            </div>

            {group.ranked.map((entry) => {
              const RankIcon =
                RANK_ICONS[entry.rank - 1];

              return (
                <div
                  key={entry.modelName}
                  className="dataset-rank-row"
                >
                  <div className="dataset-rank-position">
                    {RankIcon ? (
                      <RankIcon
                        size={18}
                        style={{
                          color:
                            RANK_COLORS[
                              entry.rank - 1
                            ],
                        }}
                      />
                    ) : (
                      <span className="rank-number">
                        {`#${entry.rank}`}
                      </span>
                    )}
                  </div>

                  <div className="dataset-rank-info">
                    <span className="dataset-rank-model">
                      {entry.modelName}
                    </span>
                    <span className="dataset-rank-run">
                      {entry.run.run_id}
                    </span>
                  </div>

                  <span className="dataset-rank-stat">
                    {entry.accuracyValue}%
                  </span>

                  <span className="dataset-rank-stat">
                    {Number.isFinite(entry.trainingTime) ? `${entry.trainingTime.toFixed(3)}s` : 'Unavailable'}
                  </span>

                  <span className="dataset-rank-stat dataset-score">
                    {entry.overallScore.toFixed(1)}
                  </span>

                  <span className="dataset-rank-stat">
                    #{entry.rank}
                  </span>

                  <button
                    className="leaderboard-view-btn"
                    onClick={() =>
                      onViewRun(entry.run)
                    }
                    title="View run"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dataset-leaderboard-empty">
            <p>
              No captured accuracy metrics are
              available for this dataset.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DatasetLeaderboard;