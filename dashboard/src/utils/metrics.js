
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