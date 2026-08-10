import React from 'react';
import { Bell, User } from 'lucide-react';
import DarkModeToggle from '../ui/DarkModeToggle';
import SearchBar from '../ui/SearchBar';

function Header({ onSearch }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Dashboard</h1>
      </div>
      <div className="header-center">
        <SearchBar onSearch={onSearch} />
      </div>
      <div className="header-right">
        <button className="header-icon-btn" title="Notifications">
          <Bell size={20} />
        </button>
        <DarkModeToggle />
        <button className="header-icon-btn" title="Profile">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;