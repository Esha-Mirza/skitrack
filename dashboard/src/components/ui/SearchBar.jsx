import { useState } from 'react';
import { Search, X } from 'lucide-react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="search-bar">
      <Search size={18} className="search-icon" />
      <input
        type="text"
        placeholder="Search runs by ID or model..."
        value={query}
        onChange={handleChange}
        className="search-input"
      />
      {query && (
        <button className="search-clear" onClick={handleClear}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
