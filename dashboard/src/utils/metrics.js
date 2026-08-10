// Shared analysis helpers used across charts, leaderboard, and comparison views.
// Centralizing these keeps numbers (like simulated accuracy) consistent
// everywhere they're shown, instead of each chart rolling its own random value.

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministic "simulated" accuracy for a run, stable across re-renders
 * and across every component that displays it (until a real `accuracy`
 * field exists on tracked runs).
 */
export function simulatedAccuracy(run) {
  const key = run?.run_id || String(run?.id ?? '');
  const h = hashString(key);
  const frac = (h % 1000) / 1000; // 0 .. 0.999
  return parseFloat((85 + frac * 14.5).toFixed(1));
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
  return runs.reduce((b, r) => (simulatedAccuracy(r) > simulatedAccuracy(b) ? r : b), runs[0]);
}

/**
 * Finds a parameter key that appears as a numeric value across a decent
 * share of runs, so we can plot it meaningfully. Returns null if nothing
 * qualifies (mixed model types with unrelated hyperparameters, etc).
 */
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