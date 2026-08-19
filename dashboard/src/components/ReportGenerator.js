function getPalette(isDark) {
  return isDark
    ? {
        bg: '#0a0708',
        card: '#171112',
        cardAlt: '#221718',
        border: '#2a2224',
        text: '#fdf5f5',
        textSecondary: '#b9a5a7',
        textMuted: '#6e5a5c',
        accent: '#ff3b47',
        accentGradient: 'linear-gradient(135deg, #ff5b63 0%, #e01e2b 55%, #6e0e15 100%)',
        shadow: 'rgba(0, 0, 0, 0.5)',
      }
    : {
        bg: '#f6f3f4',
        card: '#ffffff',
        cardAlt: '#fdf1f2',
        border: '#f0e3e5',
        text: '#1a1418',
        textSecondary: '#6b5a5e',
        textMuted: '#ad9ca0',
        accent: '#e01e2b',
        accentGradient: 'linear-gradient(135deg, #ff4d4d 0%, #e01e2b 60%, #a3121f 100%)',
        shadow: 'rgba(224, 30, 43, 0.1)',
      };
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTrainingTime(value) {
  return typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(3)} seconds` : 'Not available';
}

function formatDatasetShape(shape) {
  if (!Array.isArray(shape) || shape.length < 2 || !Number.isFinite(shape[0]) || !Number.isFinite(shape[1])) {
    return 'Not available';
  }
  return `${shape[0]} rows × ${shape[1]} columns`;
}

function getParameterCount(run) {
  return run?.params && typeof run.params === 'object' ? Object.keys(run.params).length : 0;
}

function getMetricEntries(run) {
  return run?.metrics && typeof run.metrics === 'object' ? Object.entries(run.metrics) : [];
}

export function generateHTMLReport(run, isDark = false) {
  const c = getPalette(isDark);
  const params = run?.params && typeof run.params === 'object' ? run.params : {};
  const metrics = getMetricEntries(run);
  const parameterCount = Object.keys(params).length;
  const datasetShape = formatDatasetShape(run?.dataset_shape);
  const trainingTime = formatTrainingTime(run?.training_time);
  const datasetHash = run?.dataset_hash || 'Not available';
  const datasetName = run?.dataset_name || 'Not specified';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Experiment Report - ${escapeHTML(run?.run_id)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:${c.bg};padding:40px 20px;color:${c.text};line-height:1.6}
.container{max-width:1100px;margin:0 auto;background:${c.card};border-radius:16px;padding:48px;box-shadow:0 8px 30px ${c.shadow};border:1px solid ${c.border}}
.report-header{border-bottom:3px solid ${c.accent};padding-bottom:20px;margin-bottom:32px}
.report-header h1{font-size:32px;font-weight:700;color:${c.text};margin-bottom:4px}
.report-header .subtitle{color:${c.textMuted};font-size:14px}
.report-header .badge{display:inline-block;background:${c.accentGradient};color:white;padding:4px 16px;border-radius:20px;font-size:13px;font-weight:500;margin-top:8px}
.section{margin-bottom:32px}
.section h2{font-size:20px;font-weight:600;color:${c.text};margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid ${c.border}}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.info-item{display:flex;justify-content:space-between;gap:16px;padding:10px 16px;background:${c.cardAlt};border-radius:8px;border-left:4px solid ${c.accent}}
.info-item .label{color:${c.textSecondary};font-weight:500;font-size:14px}
.info-item .value{color:${c.text};font-weight:600;font-size:14px;text-align:right;word-break:break-word}
.info-item .value.monospace{font-family:'Courier New',monospace;font-size:13px}
.params-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px}
.param-item{display:flex;justify-content:space-between;gap:16px;padding:6px 12px;border-bottom:1px solid ${c.border};font-size:14px}
.param-item .param-key{color:${c.textSecondary};font-weight:500}
.param-item .param-value{color:${c.text};font-family:'Courier New',monospace;font-size:13px;text-align:right;word-break:break-word}
.metric-card{background:${c.accentGradient};color:white;padding:20px;border-radius:12px;text-align:center}
.metric-card .metric-value{font-size:28px;font-weight:700;word-break:break-word}
.metric-card .metric-label{font-size:14px;opacity:.9;margin-top:4px}
.metrics-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
.report-footer{margin-top:40px;padding-top:20px;border-top:2px solid ${c.border};display:flex;justify-content:space-between;align-items:center;color:${c.textMuted};font-size:13px}
.report-footer .footer-brand{font-weight:600;color:${c.accent}}
.empty-state{padding:20px;text-align:center;color:${c.textMuted};background:${c.cardAlt};border-radius:8px}
@media(max-width:768px){.container{padding:24px}.grid-2,.grid-3,.params-grid{grid-template-columns:1fr}.report-header h1{font-size:24px}.metric-card .metric-value{font-size:24px}.report-footer{flex-direction:column;gap:8px;text-align:center}}
@media print{body{background:white;color:#1a1418;padding:20px}.container{box-shadow:none;padding:20px;background:white;border:none}}
</style>
</head>
<body>
<div class="container">
<div class="report-header">
<h1>Experiment Report</h1>
<div class="subtitle">Recorded at ${escapeHTML(run?.timestamp || 'Not available')}</div>
<span class="badge">${escapeHTML(run?.model_name || 'Unknown model')}</span>
</div>
<div class="section">
<h2>Overview</h2>
<div class="grid-2">
<div class="info-item"><span class="label">Run ID</span><span class="value monospace">${escapeHTML(run?.run_id || 'Not available')}</span></div>
<div class="info-item"><span class="label">Model</span><span class="value">${escapeHTML(run?.model_name || 'Not available')}</span></div>
<div class="info-item"><span class="label">Timestamp</span><span class="value">${escapeHTML(run?.timestamp || 'Not available')}</span></div>
<div class="info-item"><span class="label">Training Time</span><span class="value">${trainingTime}</span></div>
<div class="info-item"><span class="label">Dataset</span><span class="value">${escapeHTML(datasetName)}</span></div>
<div class="info-item"><span class="label">Dataset Shape</span><span class="value">${escapeHTML(datasetShape)}</span></div>
<div class="info-item"><span class="label">Dataset Hash</span><span class="value monospace">${escapeHTML(datasetHash)}</span></div>
</div>
</div>
<div class="section">
<h2>Performance Metrics</h2>
<div class="metrics-grid">
${metrics.length ? metrics.map(([key,value]) => `<div class="metric-card"><div class="metric-value">${escapeHTML(typeof value === 'number' && Number.isFinite(value) ? value.toString() : value)}</div><div class="metric-label">${escapeHTML(key)}</div></div>`).join('') : '<div class="empty-state">No metrics were recorded for this run.</div>'}
</div>
</div>
<div class="section">
<h2>Run Details</h2>
<div class="grid-3">
<div class="metric-card"><div class="metric-value">${escapeHTML(run?.dataset_shape?.[0] ?? 'N/A')}</div><div class="metric-label">Samples</div></div>
<div class="metric-card"><div class="metric-value">${escapeHTML(run?.dataset_shape?.[1] ?? 'N/A')}</div><div class="metric-label">Features</div></div>
<div class="metric-card"><div class="metric-value">${parameterCount}</div><div class="metric-label">Parameters</div></div>
</div>
</div>
<div class="section">
<h2>Parameters (${parameterCount})</h2>
${parameterCount ? `<div class="params-grid">${Object.entries(params).map(([key,value]) => `<div class="param-item"><span class="param-key">${escapeHTML(key)}</span><span class="param-value">${escapeHTML(value)}</span></div>`).join('')}</div>` : '<div class="empty-state">No parameters were recorded for this run.</div>'}
</div>
<div class="report-footer">
<span>Generated by <span class="footer-brand">Experiment Tracker</span></span>
<span>${escapeHTML(run?.timestamp || '')}</span>
</div>
</div>
</body>
</html>`;
  return html;
}

export function downloadHTMLReport(run, isDark = false) {
  try {
    const html = generateHTMLReport(run, isDark);
    const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `experiment-report-${run.run_id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
}

export function generateSummaryReport(runs, isDark = false) {
  const c = getPalette(isDark);
  const safeRuns = Array.isArray(runs) ? runs : [];
  const modelCounts = safeRuns.reduce((acc, run) => {
    const modelName = run?.model_name || 'Unknown model';
    acc[modelName] = (acc[modelName] || 0) + 1;
    return acc;
  }, {});
  const trainingTimes = safeRuns
    .map(run => run?.training_time)
    .filter(value => typeof value === 'number' && Number.isFinite(value));
  const avgTime = trainingTimes.length ? trainingTimes.reduce((sum, value) => sum + value, 0) / trainingTimes.length : null;
  const parameterCounts = safeRuns.map(getParameterCount);
  const avgParameters = parameterCounts.length ? parameterCounts.reduce((sum, value) => sum + value, 0) / parameterCounts.length : null;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Experiment Summary Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${c.bg};padding:40px 20px;color:${c.text}}
.container{max-width:1200px;margin:0 auto;background:${c.card};border-radius:16px;padding:48px;box-shadow:0 8px 30px ${c.shadow};border:1px solid ${c.border}}
h1{font-size:32px;margin-bottom:4px;color:${c.text}}
h2{font-size:20px;font-weight:600;color:${c.text};margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid ${c.border}}
.subtitle{color:${c.textMuted};margin-bottom:24px}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
.stat-card{background:${c.cardAlt};padding:20px;border-radius:12px;text-align:center;border:1px solid ${c.border}}
.stat-card .stat-value{font-size:28px;font-weight:700;color:${c.accent}}
.stat-card .stat-label{color:${c.textSecondary};font-size:14px;margin-top:4px}
table{width:100%;border-collapse:collapse;margin-top:16px}
th{text-align:left;padding:12px;background:${c.cardAlt};font-weight:600;color:${c.textSecondary};border-bottom:2px solid ${c.border}}
td{padding:10px 12px;border-bottom:1px solid ${c.border};color:${c.text}}
code{font-family:'Courier New',monospace;color:${c.text}}
.footer{margin-top:32px;padding-top:16px;border-top:2px solid ${c.border};text-align:center;color:${c.textMuted};font-size:13px}
.empty-state{padding:20px;text-align:center;color:${c.textMuted};background:${c.cardAlt};border-radius:8px}
@media(max-width:768px){.container{padding:24px}.stats-grid{grid-template-columns:1fr 1fr}table{display:block;overflow-x:auto;white-space:nowrap}}
@media print{body{background:white;color:#1a1418}.container{box-shadow:none;background:white;border:none}}
</style>
</head>
<body>
<div class="container">
<h1>Experiment Summary Report</h1>
<div class="subtitle">Summary of recorded experiment runs</div>
<div class="stats-grid">
<div class="stat-card"><div class="stat-value">${safeRuns.length}</div><div class="stat-label">Total Experiments</div></div>
<div class="stat-card"><div class="stat-value">${Object.keys(modelCounts).length}</div><div class="stat-label">Models Used</div></div>
<div class="stat-card"><div class="stat-value">${avgTime === null ? 'N/A' : `${avgTime.toFixed(3)}s`}</div><div class="stat-label">Avg Training Time</div></div>
<div class="stat-card"><div class="stat-value">${avgParameters === null ? 'N/A' : avgParameters.toFixed(1)}</div><div class="stat-label">Avg Parameters</div></div>
</div>
<h2>All Experiments</h2>
${safeRuns.length ? `<table><thead><tr><th>#</th><th>Run ID</th><th>Model</th><th>Training Time</th><th>Samples</th><th>Parameters</th></tr></thead><tbody>${safeRuns.map((run,i) => `<tr><td>${i + 1}</td><td><code>${escapeHTML(run?.run_id || 'Not available')}</code></td><td>${escapeHTML(run?.model_name || 'Not available')}</td><td>${escapeHTML(formatTrainingTime(run?.training_time))}</td><td>${escapeHTML(run?.dataset_shape?.[0] ?? 'N/A')}</td><td>${getParameterCount(run)}</td></tr>`).join('')}</tbody></table>` : '<div class="empty-state">No experiment runs are available.</div>'}
<div class="footer">Generated by Experiment Tracker</div>
</div>
</body>
</html>`;
  return html;
}

export function downloadSummaryReport(runs, isDark = false) {
  try {
    const html = generateSummaryReport(runs, isDark);
    const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'experiment-summary-report.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
}