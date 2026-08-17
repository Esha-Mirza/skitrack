import { useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeProvider } from './context/ThemeContext';
import { useDarkMode } from './hooks/useDarkMode';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import StatsCards from './components/layout/StatsCards';
import Leaderboard from './components/layout/Leaderboard';
import DatasetLeaderboard from './components/layout/Datasetleaderboard';

// Chart Components
import TrainingTimeChart from './components/charts/TrainingTimeChart';
import AccuracyChart from './components/charts/AccuracyChart';
import ParameterChart from './components/charts/ParameterChart';
import ModelDistributionChart from './components/charts/ModelDistributionChart';
import ScatterChart from './components/charts/ScatterChart';
import DatasetSizeChart from './components/charts/DatasetSizeChart';
import TrainingTrendChart from './components/charts/TrainingTrendChart';
import ParameterImpactChart from './components/charts/ParameterImpactChart';
import ModelBreakdownChart from './components/charts/ModelBreakdownChart';

// Table Components
import ExperimentsTable from './components/tables/ExperimentsTable';

// Feature Pages
import ComparisonPage from './components/ComparisonPage';
import ExportPage from './components/ExportPage';
import SettingsPage from './components/SettingsPage';
import DataConsistencyPanel from './components/DataConsistencyPanel';

// UI Components
import LoadingSkeleton from './components/ui/LoadingSkeleton';
import ToastNotification from './components/ui/ToastNotification';
import RunDetailModal from './components/ui/RunDetailModal';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/runs');
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
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <p>Run: <code>python -c &quot;from experiment_tracker.api import app; app.run(debug=True, port=5000)&quot;</code></p>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <>
            <StatsCards runs={runs} />
            <Leaderboard runs={runs} onViewRun={setSelectedRun} />
            <DatasetLeaderboard runs={runs} onViewRun={setSelectedRun} />
            <div className="charts-grid">
              <TrainingTimeChart data={runs} />
              <AccuracyChart data={runs} />
              <ParameterChart data={runs} />
              <ModelDistributionChart data={runs} />
              <ScatterChart data={runs} />
              <DatasetSizeChart data={runs} />
            </div>
            <ExperimentsTable
              runs={runs}
              onViewRun={setSelectedRun}
              searchQuery={searchQuery}
            />
          </>
        );

      case 'experiments':
        return (
          <ExperimentsTable
            runs={runs}
            onViewRun={setSelectedRun}
            searchQuery={searchQuery}
          />
        );

      case 'analytics':
        return (
          <>
            <StatsCards runs={runs} />
            <DatasetLeaderboard runs={runs} onViewRun={setSelectedRun} />
            <div className="charts-grid charts-grid-featured">
              <TrainingTrendChart data={runs} />
            </div>
            <div className="charts-grid charts-grid-secondary">
              <TrainingTimeChart data={runs} />
              <AccuracyChart data={runs} />
              <ParameterChart data={runs} />
              <ModelDistributionChart data={runs} />
              <ScatterChart data={runs} />
              <DatasetSizeChart data={runs} />
              <ParameterImpactChart data={runs} />
              <ModelBreakdownChart data={runs} />
            </div>
            <DataConsistencyPanel runs={runs} />
          </>
        );

      case 'compare':
        return <ComparisonPage runs={runs} />;

      case 'export':
        return (
          <ExportPage
            runs={runs}
            onExported={() => showToast('Report downloaded successfully')}
          />
        );

      case 'settings':
        return <SettingsPage />;

      case 'help':
        return <HelpPage />;

      default:
        return <StatsCards runs={runs} />;
    }
  };

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />
      <div className="main-content">
        <Header onSearch={setSearchQuery} currentView={currentView} />
        <main className="content">
          <div key={currentView} className="page-fade">
            {renderContent()}
          </div>
        </main>
      </div>
      {selectedRun && (
        <RunDetailModal
          run={selectedRun}
          onClose={() => setSelectedRun(null)}
        />
      )}
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