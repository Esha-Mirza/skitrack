import { 
  PlayCircle, 
  Layers, 
  BarChart3, 
  GitCompare, 
  FileDown,
  Zap,
  Sparkles,
  Rocket,
  Terminal,
  LayoutDashboard
} from 'lucide-react';

function HelpPage() {
  const steps = [
    {
      icon: PlayCircle,
      title: 'Track Your First Experiment',
      description: 'Add the @track_run decorator to your model training function. The tracker works with scikit-learn models and datasets from any source.',
      code: `from experiment_tracker import track_run

@track_run
def train_model():
    model = RandomForestClassifier()
    model.fit(X_train, y_train)
    return model, X_test, y_test`
    },
    {
      icon: Rocket,
      title: 'Launch the Dashboard',
      description: 'The dashboard is bundled with the Python package, so no Node.js, npm, or Vite setup is required.',
      code: 'tracker dashboard\nOpen http://127.0.0.1:5000',
    },
    {
      icon: Layers,
      title: 'View Your Experiments',
      description: 'All tracked experiments are automatically saved to the database',
      code: 'tracker list'
    },
    {
      icon: BarChart3,
      title: 'Analyze Performance',
      description: 'Visualize training times, accuracy, and model parameters',
      code: 'Open the dashboard → Analytics'
    },
    {
      icon: GitCompare,
      title: 'Compare Runs',
      description: 'Select two experiments to compare side-by-side',
      code: 'Click "Compare" in the sidebar'
    },
    {
      icon: FileDown,
      title: 'Export Results',
      description: 'Export experiments as CSV or HTML reports',
      code: 'Click "Export" → Select format'
    },
  ];

  return (
    <div className="help-page">
      <div className="help-header">
        <h1>Getting Started with SkiTrack</h1>
        <p className="help-subtitle">Track, analyze, compare, and export experiments from one SkiTrack Python package.</p>
      </div>

      <div className="help-steps">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="help-step">
              <div className="step-icon">
                <Icon size={24} />
              </div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {step.code && (
                  <pre className="step-code">
                    <code>{step.code}</code>
                  </pre>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="help-footer">
        <div className="help-tip">
          <Sparkles size={20} />
          <span>Tip: Use <strong>tracker --help</strong> for all CLI commands</span>
        </div>
        <div className="help-tip">
          <Rocket size={20} />
          <span>Dashboard: Run <strong>tracker dashboard</strong> to launch the bundled local dashboard at <strong>http://127.0.0.1:5000</strong></span>
        </div>
        <div className="help-tip">
          <Zap size={20} />
          <span>Quick: Use <strong>tracker list --limit 5</strong> to see latest runs</span>
        </div>
        <div className="help-tip">
          <Terminal size={20} />
          <span>CLI: <strong>tracker export</strong> to save all experiments as CSV</span>
        </div>
        <div className="help-tip">
          <LayoutDashboard size={20} />
          <span>Dashboard: All charts are interactive - hover for details!</span>
        </div>
      </div>
    </div>
  );
}

export default HelpPage;
