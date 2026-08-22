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
  const value = run?.metrics?.[metricName];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return {
    value,
    label: metricName,
  };
}

export function getHyperparameterCount(run) {
  return Object.keys(run?.params || {}).length;
}

export function getFastestRun(runs) {
  if (!runs.length) return null;

  return runs.reduce(
    (fastest, run) =>
      run.training_time < fastest.training_time ? run : fastest,
    runs[0]
  );
}

export function getMostHyperparametersRun(runs) {
  if (!runs.length) return null;

  return runs.reduce(
    (most, run) =>
      getHyperparameterCount(run) > getHyperparameterCount(most)
        ? run
        : most,
    runs[0]
  );
}

export function getBestAccuracyRun(runs) {
  const scoredRuns = runs.filter(
    (run) => getAccuracyInfo(run).isReal
  );

  if (!scoredRuns.length) return null;

  return scoredRuns.reduce(
    (best, run) =>
      getAccuracyInfo(run).value >
      getAccuracyInfo(best).value
        ? run
        : best,
    scoredRuns[0]
  );
}

export function findSharedNumericParam(runs) {
  const counts = {};

  runs.forEach((run) => {
    Object.entries(run.params || {}).forEach(
      ([key, value]) => {
        const num =
          typeof value === "number"
            ? value
            : parseFloat(value);

        if (!Number.isNaN(num) && Number.isFinite(num)) {
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    );
  });

  let bestKey = null;
  let bestCount = 0;

  Object.entries(counts).forEach(([key, count]) => {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  });

  const threshold = Math.max(
    2,
    Math.ceil(runs.length * 0.4)
  );

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

  runs
    .filter((run) => run.dataset_hash)
    .forEach((run) => {
      const key = run.dataset_hash;

      if (!groups[key]) {
        groups[key] = {
          datasetHash: run.dataset_hash,
          datasetName: run.dataset_name || null,
          samples: run.dataset_shape?.[0] ?? null,
          features: run.dataset_shape?.[1] ?? null,
          runs: [],
        };
      }

      if (!groups[key].datasetName && run.dataset_name) {
        groups[key].datasetName = run.dataset_name;
      }

      groups[key].runs.push(run);
    });

  return Object.values(groups)
    .map((group) => {
      const bestByModel = {};

      group.runs.forEach((run) => {
        const accuracy = getAccuracyInfo(run);
        if (!accuracy.isReal) return;

        const trainingTime = Number(run.training_time);
        const existing = bestByModel[run.model_name];

        // Keep the strongest run for each model on this dataset.
        // Accuracy is the primary quality signal; training time breaks ties.
        if (
          !existing ||
          accuracy.value > existing.accuracyValue ||
          (accuracy.value === existing.accuracyValue &&
            Number.isFinite(trainingTime) &&
            (!Number.isFinite(existing.trainingTime) ||
              trainingTime < existing.trainingTime))
        ) {
          bestByModel[run.model_name] = {
            modelName: run.model_name,
            run,
            accuracyValue: accuracy.value,
            trainingTime: Number.isFinite(trainingTime)
              ? trainingTime
              : null,
            isReal: true,
          };
        }
      });

      const entries = Object.values(bestByModel);
      const times = entries
        .map((entry) => entry.trainingTime)
        .filter(
          (value) =>
            Number.isFinite(value) && value >= 0
        );

      const minTime = times.length
        ? Math.min(...times)
        : null;

      const maxTime = times.length
        ? Math.max(...times)
        : null;

      const ranked = entries
        .map((entry) => {
          
          let efficiencyScore = 100;

          if (
            minTime !== null &&
            maxTime !== null &&
            maxTime > minTime &&
            Number.isFinite(entry.trainingTime)
          ) {
            efficiencyScore =
              ((maxTime - entry.trainingTime) /
                (maxTime - minTime)) *
              100;
          }


          const overallScore =
            entry.accuracyValue * 0.8 +
            efficiencyScore * 0.2;

          return {
            ...entry,
            efficiencyScore: Number(
              efficiencyScore.toFixed(1)
            ),
            overallScore: Number(
              overallScore.toFixed(1)
            ),
          };
        })
        .sort(
          (a, b) =>
            b.overallScore - a.overallScore ||
            b.accuracyValue - a.accuracyValue ||
            (a.trainingTime ??
              Number.POSITIVE_INFINITY) -
              (b.trainingTime ??
                Number.POSITIVE_INFINITY)
        )
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      return {
        ...group,
        ranked,
        runCount: group.runs.length,
        unscoredRunCount:
          group.runs.length -
          group.runs.filter(
            (run) => getAccuracyInfo(run).isReal
          ).length,
      };
    });
}

export function formatShortDate(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return String(timestamp);
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  );
}