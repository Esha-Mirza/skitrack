import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import DarkModeToggle from '../ui/DarkModeToggle';
import SearchBar from '../ui/SearchBar';

const TITLES = {
  dashboard: 'Dashboard',
  experiments: 'Experiments',
  analytics: 'Analytics',
  compare: 'Compare Runs',
  export: 'Export Reports',
  help: 'Help',
  settings: 'Settings',
};

const INITIAL_NOTIFICATIONS = [];

function Header({ onSearch, currentView = 'dashboard' }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const containerRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneRead = (id) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title" key={currentView}>{TITLES[currentView] || 'Dashboard'}</h1>
      </div>
      <div className="header-center">
        <SearchBar onSearch={onSearch} />
      </div>
      <div className="header-right" ref={containerRef}>
        <div className="header-dropdown-wrap">
          <button
            className={`header-icon-btn ${notificationsOpen ? 'active' : ''}`}
            title="Notifications"
            onClick={() => setNotificationsOpen(prev => !prev)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="header-badge-dot" />}
          </button>
          {notificationsOpen && (
            <div className="header-dropdown notifications-dropdown">
              <div className="dropdown-header">
                <span>Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}</span>
                <button
                  className="dropdown-mark-read"
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              </div>
              <div className="dropdown-list">
                {notifications.length === 0 && (
                  <div className="dropdown-empty">You&apos;re all caught up</div>
                )}
                {notifications.map(n => (
                  <button
                    key={n.id}
                    className={`dropdown-item ${n.read ? 'is-read' : ''}`}
                    onClick={() => markOneRead(n.id)}
                  >
                    {!n.read && <span className="dropdown-item-dot" />}
                    <div>
                      <p>{n.text}</p>
                      <span className="dropdown-item-time">{n.time}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DarkModeToggle />
      </div>
    </header>
  );
}

export default Header;
