import {
  LayoutDashboard,
  Table2,
  BarChart3,
  GitCompare,
  FileDown,
  HelpCircle,
  Settings,
  Activity
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'experiments', label: 'Experiments', icon: Table2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'compare', label: 'Compare', icon: GitCompare },
  { id: 'export', label: 'Export', icon: FileDown },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

function Sidebar({ currentView, onViewChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <Activity size={28} className="logo-icon" />
          <span className="logo-text">SkiTrack</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-item" onClick={() => onViewChange('settings')}>
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
