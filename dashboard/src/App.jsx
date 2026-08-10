import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeProvider } from './context/ThemeContext';
import { useDarkMode } from './hooks/useDarkMode';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import StatsCards from './components/layout/StatsCards';

// Chart Components
import TrainingTimeChart from './components/charts/TrainingTimeChart';
import AccuracyChart from './components/charts/AccuracyChart';
import ParameterChart from './components/charts/ParameterChart';
import ModelDistributionChart from './components/charts/ModelDistributionChart';
import ScatterChart from './components/charts/ScatterChart';
import DatasetSizeChart from './components/charts/DatasetSizeChart';
import RadarChartComponent from './components/charts/RadarChart';
import ComparisonPage from './components/ComparisonPage';

// Table Components
import ExperimentsTable from './components/tables/ExperimentsTable';

// UI Components
import LoadingSkeleton from './components/ui/LoadingSkeleton';
import ToastNotification from './components/ui/ToastNotification';
import SettingsModal from './components/ui/SettingsModal';

// Pages
import HelpPage from './components/Help/HelpPage';

import './App.css';

function AppContent() {
  const { isDark } = useDarkMode();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [chartColors, setChartColors] = useState({
    training: '#667eea',
    accuracy: '#48bb78',
    parameters: '#f6ad55',
    distribution: '#764ba2',
    scatter: '#4facfe'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/runs');
        setRuns(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Make sure the API is running.');
        setLoading(false);
        console.error('Error:', err);
      }
    };
    
    fetchData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleViewRun = (run) => {
    setSelectedRun(run);
    setCurrentView('experiments');
    showToast(`Viewing experiment: ${run.run_id}`, 'success');
  };

  const handleColorChange = (chartName, color) => {
    setChartColors(prev => ({ ...prev, [chartName]: color }));
    showToast(`Updated color for ${chartName}`, 'success');
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <p>Run: <code>python -c "from experiment_tracker.api import app; app.run(debug=True, port=5000)"</code></p>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <>
            <StatsCards runs={runs} />
            <div className="charts-grid">
              <TrainingTimeChart data={runs} color={chartColors.training} />
              <AccuracyChart data={runs} color={chartColors.accuracy} />
              <ParameterChart data={runs} color={chartColors.parameters} />
              <ModelDistributionChart data={runs} color={chartColors.distribution} />
              <ScatterChart data={runs} color={chartColors.scatter} />
              <DatasetSizeChart data={runs} color={chartColors.training} />
              <RadarChartComponent data={runs} />
            </div>
            <ExperimentsTable 
              runs={runs} 
              onViewRun={handleViewRun}
              searchQuery={searchQuery}
              selectedRun={selectedRun}
            />
          </>
        );
      
      case 'experiments':
        return (
          <ExperimentsTable 
            runs={runs} 
            onViewRun={handleViewRun}
            searchQuery={searchQuery}
            selectedRun={selectedRun}
          />
        );
      
      case 'analytics':
        return (
          <>
            <StatsCards runs={runs} />
            <div className="charts-grid">
              <TrainingTimeChart data={runs} color={chartColors.training} />
              <AccuracyChart data={runs} color={chartColors.accuracy} />
              <ParameterChart data={runs} color={chartColors.parameters} />
              <ModelDistributionChart data={runs} color={chartColors.distribution} />
              <ScatterChart data={runs} color={chartColors.scatter} />
              <DatasetSizeChart data={runs} color={chartColors.training} />
              <RadarChartComponent data={runs} />
            </div>
          </>
        );
      
      case 'compare':
        return <ComparisonPage runs={runs} />;
      
      case 'export':
        return (
          <div className="export-page">
            <h1>Export</h1>
            <p>Export your experiment data</p>
            <div className="export-options">
              <button onClick={() => showToast('Exporting to CSV...', 'success')}>
                Export CSV
              </button>
              <button onClick={() => showToast('Exporting to JSON...', 'success')}>
                Export JSON
              </button>
              <button onClick={() => showToast('Exporting to HTML...', 'success')}>
                Export HTML
              </button>
            </div>
          </div>
        );
      
      case 'help':
        return <HelpPage />;
      
      case 'settings':
        return (
          <SettingsModal 
            isOpen={true}
            onClose={() => setCurrentView('dashboard')}
            colors={chartColors}
            onColorChange={handleColorChange}
          />
        );
      
      default:
        return <StatsCards runs={runs} />;
    }
  };

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="main-content">
        <Header onSearch={setSearchQuery} />
        <main className="content">
          {renderContent()}
        </main>
      </div>
      {toast && (
        <ToastNotification 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;