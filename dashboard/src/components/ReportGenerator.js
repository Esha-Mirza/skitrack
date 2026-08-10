

export function generateHTMLReport(run) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Experiment Report - ${run.run_id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f0f2f5;
      padding: 40px 20px;
      color: #1a1a2e;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1100px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }
    
    /* Header */
    .report-header {
      border-bottom: 3px solid #667eea;
      padding-bottom: 20px;
      margin-bottom: 32px;
    }
    
    .report-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    
    .report-header .subtitle {
      color: #718096;
      font-size: 14px;
    }
    
    .report-header .badge {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      margin-top: 8px;
    }
    
    /* Sections */
    .section {
      margin-bottom: 32px;
    }
    
    .section h2 {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    /* Grid */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 16px;
      background: #f7fafc;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    
    .info-item .label {
      color: #4a5568;
      font-weight: 500;
      font-size: 14px;
    }
    
    .info-item .value {
      color: #1a1a2e;
      font-weight: 600;
      font-size: 14px;
    }
    
    .info-item .value.monospace {
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }
    
    /* Parameters */
    .params-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 24px;
    }
    
    .param-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 12px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
    }
    
    .param-item .param-key {
      color: #4a5568;
      font-weight: 500;
    }
    
    .param-item .param-value {
      color: #1a1a2e;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }
    
    /* Metrics */
    .metric-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }
    
    .metric-card .metric-value {
      font-size: 32px;
      font-weight: 700;
    }
    
    .metric-card .metric-label {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 4px;
    }
    
    /* Footer */
    .report-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #a0aec0;
      font-size: 13px;
    }
    
    .report-footer .footer-brand {
      font-weight: 600;
      color: #667eea;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 24px;
      }
      
      .grid-2,
      .grid-3 {
        grid-template-columns: 1fr;
      }
      
      .params-grid {
        grid-template-columns: 1fr;
      }
      
      .report-header h1 {
        font-size: 24px;
      }
      
      .metric-card .metric-value {
        font-size: 24px;
      }
      
      .report-footer {
        flex-direction: column;
        gap: 8px;
        text-align: center;
      }
    }
    
    @media print {
      body {
        background: white;
        padding: 20px;
      }
      
      .container {
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="report-header">
      <h1>Experiment Report</h1>
      <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>
      <span class="badge">${run.model_name}</span>
    </div>

    <!-- Overview -->
    <div class="section">
      <h2>Overview</h2>
      <div class="grid-2">
        <div class="info-item">
          <span class="label">Run ID</span>
          <span class="value monospace">${run.run_id}</span>
        </div>
        <div class="info-item">
          <span class="label">Model</span>
          <span class="value">${run.model_name}</span>
        </div>
        <div class="info-item">
          <span class="label">Timestamp</span>
          <span class="value">${run.timestamp}</span>
        </div>
        <div class="info-item">
          <span class="label">Training Time</span>
          <span class="value">${run.training_time.toFixed(3)} seconds</span>
        </div>
        <div class="info-item">
          <span class="label">Dataset Shape</span>
          <span class="value">${run.dataset_shape[0]} rows × ${run.dataset_shape[1]} columns</span>
        </div>
        <div class="info-item">
          <span class="label">Dataset Hash</span>
          <span class="value monospace">${run.dataset_hash}</span>
        </div>
      </div>
    </div>

    <!-- Metrics -->
    <div class="section">
      <h2>Performance Metrics</h2>
      <div class="grid-3">
        <div class="metric-card">
          <div class="metric-value">${run.training_time.toFixed(3)}s</div>
          <div class="metric-label">Training Time</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${run.dataset_shape[0]}</div>
          <div class="metric-label">Samples</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${Object.keys(run.params).length}</div>
          <div class="metric-label">Parameters</div>
        </div>
      </div>
    </div>

    <!-- Parameters -->
    <div class="section">
      <h2>Parameters (${Object.keys(run.params).length})</h2>
      <div class="params-grid">
        ${Object.entries(run.params).map(([key, value]) => `
          <div class="param-item">
            <span class="param-key">${key}</span>
            <span class="param-value">${String(value)}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Footer -->
    <div class="report-footer">
      <span>Generated by <span class="footer-brand">Experiment Tracker</span> v1.0.0</span>
      <span>${new Date().toLocaleDateString()}</span>
    </div>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Download HTML report for a single run
 */
export function downloadHTMLReport(run) {
  try {
    const html = generateHTMLReport(run);
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

/**
 * Generate a summary HTML report for ALL runs
 */
export function generateSummaryReport(runs) {
  // Count models
  const modelCounts = runs.reduce((acc, run) => {
    acc[run.model_name] = (acc[run.model_name] || 0) + 1;
    return acc;
  }, {});

  const avgTime = runs.length ? 
    runs.reduce((sum, r) => sum + r.training_time, 0) / runs.length : 0;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Experiment Summary Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f0f2f5;
      padding: 40px 20px;
      color: #1a1a2e;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
    h1 { font-size: 32px; margin-bottom: 4px; }
    .subtitle { color: #718096; margin-bottom: 24px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: #f7fafc;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }
    .stat-card .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #667eea;
    }
    .stat-card .stat-label {
      color: #4a5568;
      font-size: 14px;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    th {
      text-align: left;
      padding: 12px;
      background: #f7fafc;
      font-weight: 600;
      color: #4a5568;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #a0aec0;
      font-size: 13px;
    }
    @media (max-width: 768px) {
      .container { padding: 24px; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Experiment Summary Report</h1>
    <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${runs.length}</div>
        <div class="stat-label">Total Experiments</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Object.keys(modelCounts).length}</div>
        <div class="stat-label">Models Used</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${avgTime.toFixed(3)}s</div>
        <div class="stat-label">Avg Training Time</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${runs.reduce((sum, r) => sum + Object.keys(r.params).length, 0) / runs.length || 0}</div>
        <div class="stat-label">Avg Parameters</div>
      </div>
    </div>

    <h2>All Experiments</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Run ID</th>
          <th>Model</th>
          <th>Training Time</th>
          <th>Samples</th>
          <th>Parameters</th>
        </tr>
      </thead>
      <tbody>
        ${runs.map((run, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><code>${run.run_id}</code></td>
            <td>${run.model_name}</td>
            <td>${run.training_time.toFixed(3)}s</td>
            <td>${run.dataset_shape[0]}</td>
            <td>${Object.keys(run.params).length}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      Generated by Experiment Tracker v1.0.0
    </div>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Download summary HTML report
 */
export function downloadSummaryReport(runs) {
  try {
    const html = generateSummaryReport(runs);
    const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `experiment-summary-report.html`;
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