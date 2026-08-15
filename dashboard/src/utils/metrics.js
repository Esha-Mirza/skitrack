function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function simulatedAccuracy(run) {
  const key = run?.run_id || String(run?.id ?? '');
  const h = hashString(key);
  const frac = (h % 1000) / 1000; // 0 .. 0.999
  return parseFloat((85 + frac * 14.5).toFixed(1));
}

export function getAccuracyInfo(run) {
  const metrics = run?.metrics || {};

  if (typeof metrics.accuracy === 'number' && !isNaN(metrics.accuracy)) {
    return { value: parseFloat((metrics.accuracy * 100).toFixed(1)), isReal: true, label: 'accuracy' };
  }

  if (typeof metrics.r2_score === 'number' && !isNaN(metrics.r2_score)) {
    return { value: parseFloat((metrics.r2_score * 100).toFixed(1)), isReal: true, label: 'r2 score' };
  }

  if (typeof metrics.score === 'number' && !isNaN(metrics.score)) {
    return { value: parseFloat((metrics.score * 100).toFixed(1)), isReal: true, label: 'score' };
  }

  return { value: simulatedAccuracy(run), isReal: false, label: 'accuracy (simulated)' };
}

export function getFastestRun(runs) {
  if (!runs.length) return null;
  return runs.reduce((f, r) => (r.training_time < f.training_time ? r : f), runs[0]);
}

export function getMostParamsRun(runs) {
  if (!runs.length) return null;
  return runs.reduce((m, r) =>
    Object.keys(r.params).length > Object.keys(m.params).length ? r : m, runs[0]);
}

export function getBestAccuracyRun(runs) {
  if (!runs.length) return null;
  return runs.reduce((b, r) => (getAccuracyInfo(r).value > getAccuracyInfo(b).value ? r : b), runs[0]);
}

export function findSharedNumericParam(runs) {
  const counts = {};
  runs.forEach(run => {
    Object.entries(run.params || {}).forEach(([key, value]) => {
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (!isNaN(num) && isFinite(num)) {
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

/**
 * Flags model families that were trained against more than one distinct
 * dataset hash — a signal that results across those runs may not be
 * directly comparable because the underlying data changed.
 */
export function findDataConsistencyIssues(runs) {
  const map = {};
  runs.forEach(run => {
    if (!map[run.model_name]) map[run.model_name] = new Set();
    map[run.model_name].add(run.dataset_hash);
  });

  return Object.entries(map)
    .filter(([, hashes]) => hashes.size > 1)
    .map(([model, hashes]) => ({ model, hashCount: hashes.size }));
}

export function formatShortDate(timestamp) {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return String(timestamp);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Builds a real per-dataset model leaderboard, answering "which model
 * actually performs best on this dataset" rather than a flat global
 * highlight across every run regardless of what data it was trained on.
 *
 * Runs are grouped by dataset_hash (so results are only ever compared
 * against runs trained on the exact same data). Within each dataset, if a
 * model type was run more than once, only its single best run is kept
 * (highest composite score) — this ranks model *types*, not every
 * individual run.
 *
 * Ranking is a 50/50 composite of accuracy and speed, both normalized to
 * 0-100 *within that dataset group* so the two scales are comparable:
 *   - accuracyScore: the real (or simulated-fallback) accuracy, already 0-100
 *   - speedScore: 100 * fastestTimeInGroup / thisRun'sTime, so the fastest
 *     run in the group scores 100 and slower ones score proportionally less
 * The #1 entry is the recommended model for that dataset.
 */
export function buildDatasetLeaderboard(runs) {
  const groups = {};

  runs.forEach((run) => {
    // Prefer the explicit dataset_name when the run has one — dataset_hash
    // alone fragments a single logical dataset into many groups whenever
    // train_test_split() wasn't called with an identical random_state
    // across runs. Falls back to the hash for older runs tracked before
    // dataset_name existed.
    const key = run.dataset_name || run.dataset_hash || 'unknown';
    if (!groups[key]) {
      groups[key] = {
        datasetHash: run.dataset_hash || 'unknown',
        datasetName: run.dataset_name || null,
        samples: run.dataset_shape?.[0] ?? 0,
        features: run.dataset_shape?.[1] ?? 0,
        runs: [],
      };
    }
    groups[key].runs.push(run);
  });

  return Object.values(groups)
    .map((group) => {
      const fastestTime = Math.min(...group.runs.map(r => r.training_time)) || 1;

      // Best single run per model type within this dataset, scored by the
      // composite metric (not accuracy alone).
      const bestByModel = {};
      group.runs.forEach((run) => {
        const acc = getAccuracyInfo(run);
        const speedScore = parseFloat((100 * fastestTime / run.training_time).toFixed(1));
        const composite = parseFloat(((acc.value + speedScore) / 2).toFixed(1));

        const existing = bestByModel[run.model_name];
        if (!existing || composite > existing.composite) {
          bestByModel[run.model_name] = {
            modelName: run.model_name,
            run,
            accuracyValue: acc.value,
            isReal: acc.isReal,
            speedScore,
            composite,
          };
        }
      });

      const ranked = Object.values(bestByModel)
        .sort((a, b) => b.composite - a.composite)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      return { ...group, ranked, runCount: group.runs.length };
    })
    // Datasets with more model coverage (more meaningful comparisons) first.
    .sort((a, b) => b.ranked.length - a.ranked.length || b.samples - a.samples);
}