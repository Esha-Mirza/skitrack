import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, Filter, ArrowUpDown } from 'lucide-react';

function ExperimentsTable({ runs, onViewRun, searchQuery = '', selectedRun }) {
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterModel, setFilterModel] = useState('');

  const models = [...new Set(runs.map(r => r.model_name))];

  const filteredRuns = runs.filter(run => {
    const matchesSearch = !searchQuery || (
      run.run_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(run.id).includes(searchQuery)
    );
    const matchesModel = !filterModel || run.model_name === filterModel;
    return matchesSearch && matchesModel;
  });

  const sortedRuns = [...filteredRuns].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'training_time') {
      aVal = a.training_time;
      bVal = b.training_time;
    } else if (sortField === 'params_count') {
      aVal = Object.keys(a.params).length;
      bVal = Object.keys(b.params).length;
    } else if (sortField === 'samples') {
      aVal = a.dataset_shape[0];
      bVal = b.dataset_shape[0];
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="sort-icon" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  // Check if a run is selected
  const isSelected = (run) => {
    return selectedRun && selectedRun.id === run.id;
  };

  if (filteredRuns.length === 0) {
    return (
      <div className="table-container">
        <div className="table-empty">
          <p>No experiments found matching your criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>Experiments</h2>
        <div className="table-controls">
          <select 
            className="filter-select"
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
          >
            <option value="">All Models</option>
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          <span className="table-count">{filteredRuns.length} runs</span>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="experiments-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                # <SortIcon field="id" />
              </th>
              <th onClick={() => handleSort('run_id')}>
                Run ID <SortIcon field="run_id" />
              </th>
              <th onClick={() => handleSort('model_name')}>
                Model <SortIcon field="model_name" />
              </th>
              <th onClick={() => handleSort('training_time')}>
                Time (s) <SortIcon field="training_time" />
              </th>
              <th onClick={() => handleSort('samples')}>
                Samples <SortIcon field="samples" />
              </th>
              <th onClick={() => handleSort('params_count')}>
                Params <SortIcon field="params_count" />
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRuns.map((run, index) => (
              <tr key={run.id} className={isSelected(run) ? 'selected-row' : ''}>
                <td>{index + 1}</td>
                <td className="run-id-cell">{run.run_id}</td>
                <td>
                  <span className="model-badge">{run.model_name}</span>
                </td>
                <td>{run.training_time.toFixed(3)}</td>
                <td>{run.dataset_shape[0]}</td>
                <td>{Object.keys(run.params).length}</td>
                <td>
                  <button 
                    className="view-btn"
                    onClick={() => onViewRun(run)}
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExperimentsTable;