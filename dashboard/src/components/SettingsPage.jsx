import React from 'react';
import { Moon, Sun, Bell, Database, Info } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

function SettingsPage() {
  const { isDark, toggleTheme } = useDarkMode();

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
            className={`settings-toggle ${isDark ? 'on' : ''}`}
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          />
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <strong><Bell size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Notifications</strong>
            <span>Get notified when a new run finishes tracking</span>
          </div>
          <button className="settings-toggle on" aria-label="Toggle notifications" disabled />
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
