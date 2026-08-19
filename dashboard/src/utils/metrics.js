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

export function getFastestRun(runs) {
  if (!runs.length) return null;

  return runs.reduce(
    (fastest, run) =>
      run.training_time < fastest.training_time ? run : fastest,
    runs[0]
  );
}

export function getMostParamsRun(runs) {
  if (!runs.length) return null;

  return runs.reduce(
    (most, run) =>
      Object.keys(run.params || {}).length > Object.keys(most.params || {}).length
        ? run
        : most,
    runs[0]
  );
}

export function getBestAccuracyRun(runs) {
  const scoredRuns = runs.filter((run) => getAccuracyInfo(run).isReal);

  if (!scoredRuns.length) return null;

  return scoredRuns.reduce(
    (best, run) =>
      getAccuracyInfo(run).value > getAccuracyInfo(best).value ? run : best,
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

export function buildDatasetLeaderboard(runs) {
  const groups = {};

  runs.filter((run) => run.dataset_hash).forEach((run) => {
    const key = run.dataset_name || run.dataset_hash;

    if (!groups[key]) {
      groups[key] = {
        datasetHash: run.dataset_hash,
        datasetName: run.dataset_name || null,
        samples: run.dataset_shape?.[0] ?? null,
        features: run.dataset_shape?.[1] ?? null,
        runs: [],
      };
    }

    groups[key].runs.push(run);
  });

  return Object.values(groups)
    .map((group) => {
      const scoredRuns = group.runs.filter(
        (run) => getAccuracyInfo(run).isReal
      );

      const fastestTime =
        Math.min(...group.runs.map((run) => run.training_time)) || 1;

      const bestByModel = {};

      scoredRuns.forEach((run) => {
        const accuracy = getAccuracyInfo(run).value;

        const speedScore = Number(
          (
            (100 * fastestTime) /
            Math.max(run.training_time, Number.EPSILON)
          ).toFixed(1)
        );

        const composite = Number(
          ((accuracy + speedScore) / 2).toFixed(1)
        );

        const existing = bestByModel[run.model_name];

        if (!existing || composite > existing.composite) {
          bestByModel[run.model_name] = {
            modelName: run.model_name,
            run,
            accuracyValue: accuracy,
            isReal: true,
            speedScore,
            composite,
          };
        }
      });

      const ranked = Object.values(bestByModel)
        .sort((a, b) => b.composite - a.composite)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      return {
        ...group,
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