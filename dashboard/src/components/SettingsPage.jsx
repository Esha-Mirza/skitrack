import { Moon, Sun, Bell, Database, Info } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { useState } from 'react';

function SettingsPage() {
  const { isDark, toggleTheme } = useDarkMode();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      return localStorage.getItem('experiment-tracker-notifications') !== 'off';
    } catch {
      return true;
    }
  });

  const toggleNotifications = () => {
    setNotificationsEnabled((enabled) => {
      const next = !enabled;
      try {
        localStorage.setItem('experiment-tracker-notifications', next ? 'on' : 'off');
      } catch {
        // Keep the preference for this session if storage is unavailable.
      }
      window.dispatchEvent(
        new CustomEvent('experiment-tracker-notifications-change', {
          detail: { enabled: next },
        })
      );
      return next;
    });
  };

  return (
    <div className="settings-page">
      <div className="page-heading">
        <h2>Settings</h2>
        <p className="description">Preferences for how the dashboard looks and behaves</p>
      </div>

      <div className="settings-section">
        <div className="settings-row">
          <div className="settings-row-text">
            <strong>{isDark ? <Moon size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> : <Sun size={14} style={{ verticalAlign: -2, marginRight: 6 }} />}Dark Mode</strong>
            <span>Switch between light and dark theme</span>
          </div>
          <button
            type="button"
            className={`settings-toggle ${isDark ? 'on' : ''}`}
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            aria-pressed={isDark}
          />
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <strong><Bell size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Notifications</strong>
            <span>Show dashboard notifications when actions complete</span>
          </div>
          <button
            type="button"
            className={`settings-toggle ${notificationsEnabled ? 'on' : ''}`}
            onClick={toggleNotifications}
            aria-label="Toggle notifications"
            aria-pressed={notificationsEnabled}
          />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-row">
          <div className="settings-row-text">
            <strong><Database size={14} style={{ verticalAlign: -2, marginRight: 6 }} />API Endpoint</strong>
            <span>http://127.0.0.1:5000/api/runs</span>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <strong><Info size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Version</strong>
            <span>Local-First Experiment Tracker · Dashboard v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
