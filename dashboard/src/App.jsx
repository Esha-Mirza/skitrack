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

// Table Components
import ExperimentsTable from './components/tables/ExperimentsTable';

// UI Components
import LoadingSkeleton from './components/ui/LoadingSkeleton';
import ToastNotification from './components/ui/ToastNotification';

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
            <div className="charts-grid">
              <TrainingTimeChart data={runs} />
              <AccuracyChart data={runs} />
              <ParameterChart data={runs} />
              <ModelDistributionChart data={runs} />
              <ScatterChart data={runs} />
              <DatasetSizeChart data={runs} />
            </div>
          </>
        );
      
      case 'help':
        return <HelpPage />;
      
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