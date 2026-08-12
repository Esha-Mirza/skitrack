import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Eye, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

function ExperimentsTable({ runs, onViewRun, searchQuery = '' }) {
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterModel, setFilterModel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(sortedRuns.length / PAGE_SIZE));
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterModel, sortField, sortDirection, runs.length]);

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedRuns = sortedRuns.slice(startIndex, startIndex + PAGE_SIZE);

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
            {paginatedRuns.map((run, index) => (
              <tr key={run.id}>
                <td>{startIndex + index + 1}</td>
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

      {totalPages > 1 && (
        <div className="table-pagination">
          <span className="pagination-info">
            Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, sortedRuns.length)} of {sortedRuns.length}
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="pagination-page">Page {safePage} of {totalPages}</span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExperimentsTable;