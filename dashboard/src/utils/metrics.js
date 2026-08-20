// Metric keys the tracker can record, in the order we prefer them when a run
// carries more than one. Classifiers are stored under "accuracy" and
// regressors under "r2_score", so anything that ranks on "accuracy" alone
// silently drops every regression run.
const SCORE_METRICS = [
  { key: "accuracy", label: "Accuracy", shortLabel: "Accuracy" },
  { key: "balanced_accuracy", label: "Balanced accuracy", shortLabel: "Bal. acc" },
  { key: "f1_score", label: "F1 score", shortLabel: "F1" },
  { key: "roc_auc", label: "ROC AUC", shortLabel: "ROC AUC" },
  { key: "r2_score", label: "R² score", shortLabel: "R²" },
  { key: "score", label: "Score", shortLabel: "Score" },
];

// Speed is a ratio, so its spread across runs is far wider than the spread of
// scores. Weighting it evenly lets a model that trains a few milliseconds
// faster outrank a clearly better one, so it is capped at a 5 point swing:
// enough to break a tie, never enough to beat a real quality gap.
const SCORE_WEIGHT = 0.95;
const SPEED_WEIGHT = 0.05;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getAccuracyInfo(run) {
  const metrics = run?.metrics || {};
  const accuracy = metrics.accuracy;

  if (typeof accuracy === "number" && Number.isFinite(accuracy)) {
    return {
      value: Number((accuracy * 100).toFixed(1)),
      isReal: true,
      label: "accuracy",
    };
  }

  return {
    value: null,
    isReal: false,
    label: "accuracy unavailable",
  };
}

export function getScoreInfo(run) {
  const metrics = run?.metrics || {};

  for (const metric of SCORE_METRICS) {
    const value = metrics[metric.key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return {
        key: metric.key,
        label: metric.label,
        shortLabel: metric.shortLabel,
        raw: value,
        value: Number((value * 100).toFixed(1)),
        isReal: true,
      };
    }
  }

  return {
    key: null,
    label: "no score captured",
    shortLabel: "Score",
    raw: null,
    value: null,
    isReal: false,
  };
}

export function getMetricInfo(run, metricName) {
  const metrics = run?.metrics || {};
  const value = metrics[metricName];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return {
    value,
    label: metricName,
  };
}

export function getTrainingTime(run) {
  const time = run?.training_time;

  return typeof time === "number" && Number.isFinite(time) && time >= 0
    ? time
    : null;
}

export function formatTrainingTime(run) {
  const time = getTrainingTime(run);

  return time === null ? "N/A" : `${time.toFixed(3)}s`;
}

export function getFastestRun(runs) {
  const timedRuns = (runs || []).filter((run) => getTrainingTime(run) !== null);

  if (!timedRuns.length) return null;

  return timedRuns.reduce(
    (fastest, run) =>
      getTrainingTime(run) < getTrainingTime(fastest) ? run : fastest,
    timedRuns[0]
  );
}

export function getMostParamsRun(runs) {
  if (!runs?.length) return null;

  return runs.reduce(
    (most, run) =>
      Object.keys(run.params || {}).length > Object.keys(most.params || {}).length
        ? run
        : most,
    runs[0]
  );
}

export function getBestAccuracyRun(runs) {
  const scoredRuns = (runs || []).filter((run) => getAccuracyInfo(run).isReal);

  if (!scoredRuns.length) return null;

  return scoredRuns.reduce(
    (best, run) =>
      getAccuracyInfo(run).value > getAccuracyInfo(best).value ? run : best,
    scoredRuns[0]
  );
}

export function getBestScoreRun(runs) {
  const scoredRuns = (runs || []).filter((run) => getScoreInfo(run).isReal);

  if (!scoredRuns.length) return null;

  return scoredRuns.reduce(
    (best, run) => (getScoreInfo(run).raw > getScoreInfo(best).raw ? run : best),
    scoredRuns[0]
  );
}

export function findSharedNumericParam(runs) {
  const counts = {};

  runs.forEach((run) => {
    Object.entries(run.params || {}).forEach(([key, value]) => {
      const num = typeof value === "number" ? value : parseFloat(value);

      if (!Number.isNaN(num) && Number.isFinite(num)) {
        counts[key] = (counts[key] || 0) + 1;
      }
    });
  });

  let bestKey = null;
  let bestCount = 0;

  Object.entries(counts).forEach(([key, count]) => {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  });

  const threshold = Math.max(2, Math.ceil(runs.length * 0.4));

  return bestCount >= threshold ? bestKey : null;
}

export function findDataConsistencyIssues(runs) {
  const map = {};

  runs.forEach((run) => {
    if (!run.dataset_hash) return;

    if (!map[run.model_name]) {
      map[run.model_name] = new Set();
    }

    map[run.model_name].add(run.dataset_hash);
  });

  return Object.entries(map)
    .filter(([, hashes]) => hashes.size > 1)
    .map(([model, hashes]) => ({
      model,
      hashCount: hashes.size,
    }));
}

// A run only ranks against runs measured the same way, so each dataset group
// is ranked on the metric most of its runs share.
function pickGroupMetric(runs) {
  const counts = {};

  runs.forEach((run) => {
    const info = getScoreInfo(run);

    if (info.isReal) {
      counts[info.key] = (counts[info.key] || 0) + 1;
    }
  });

  const ordered = SCORE_METRICS.filter((metric) => counts[metric.key]).sort(
    (a, b) => counts[b.key] - counts[a.key]
  );

  return ordered.length ? ordered[0] : null;
}

function scoreSpeed(trainingTime, fastestTime) {
  // Without a usable reference time nothing can be ranked on speed, so speed
  // stops discriminating rather than blowing the composite past 100.
  if (fastestTime === null || fastestTime <= 0) return 100;
  if (trainingTime === null) return 0;

  return Number(
    clamp((100 * fastestTime) / Math.max(trainingTime, fastestTime), 0, 100).toFixed(1)
  );
}

export function buildDatasetLeaderboard(runs) {
  const groups = {};

  (runs || [])
    .filter((run) => run.dataset_hash)
    .forEach((run) => {
      // The hash identifies the data; the name is optional metadata that only
      // some runs carry, so keying on it would split one dataset in two.
      const group = groups[run.dataset_hash] || {
        datasetHash: run.dataset_hash,
        datasetName: null,
        samples: null,
        features: null,
        runs: [],
      };

      group.datasetName = group.datasetName || run.dataset_name || null;
      group.samples = group.samples ?? run.dataset_shape?.[0] ?? null;
      group.features = group.features ?? run.dataset_shape?.[1] ?? null;
      group.runs.push(run);

      groups[run.dataset_hash] = group;
    });

  return Object.values(groups)
    .map((group) => {
      const metric = pickGroupMetric(group.runs);

      const scoredRuns = metric
        ? group.runs.filter((run) => getScoreInfo(run).key === metric.key)
        : [];

      const fastestTime = getTrainingTime(getFastestRun(scoredRuns));

      const bestByModel = {};

      scoredRuns.forEach((run) => {
        const info = getScoreInfo(run);
        const speedScore = scoreSpeed(getTrainingTime(run), fastestTime);

        // R2 goes negative for a model worse than predicting the mean; the
        // real value is still displayed, it just cannot drag the composite
        // below zero.
        const rankedScore = clamp(info.value, 0, 100);

        const composite = Number(
          (rankedScore * SCORE_WEIGHT + speedScore * SPEED_WEIGHT).toFixed(1)
        );

        const existing = bestByModel[run.model_name];

        if (!existing || composite > existing.composite) {
          bestByModel[run.model_name] = {
            modelName: run.model_name,
            run,
            scoreValue: info.value,
            scoreLabel: info.shortLabel,
            isReal: true,
            speedScore,
            composite,
          };
        }
      });

      const ranked = Object.values(bestByModel)
        .sort(
          (a, b) =>
            b.composite - a.composite ||
            b.scoreValue - a.scoreValue ||
            a.modelName.localeCompare(b.modelName)
        )
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      return {
        ...group,
        metricKey: metric ? metric.key : null,
        metricLabel: metric ? metric.shortLabel : "Score",
        ranked,
        runCount: group.runs.length,
        unscoredRunCount: group.runs.length - scoredRuns.length,
      };
    })
    .sort(
      (a, b) =>
        b.ranked.length - a.ranked.length ||
        (b.samples ?? -1) - (a.samples ?? -1)
    );
}

export function formatShortDate(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return String(timestamp);
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
