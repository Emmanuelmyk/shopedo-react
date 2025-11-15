// ==========================================
// FILE: src/components/SearchBar/SearchBar.jsx
// ==========================================
import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, initialValue = '' }) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  const handleSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    onSearch(searchValue);
  };

  const handleClear = () => {
    setSearchValue('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    onSearch('');
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      onSearch(searchValue);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="input-group">
          <input
            id="searchInput"
            className="form-control"
            placeholder="Search products..."
            value={searchValue}
            onChange={handleInputChange}
            onKeyUp={handleKeyUp}
          />
          {searchValue && (
            <button
              id="clearBtn"
              className="btn btn-outline-secondary"
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
          <button
            id="searchBtn"
            className="btn btn-success"
            type="button"
            onClick={handleSearch}
            aria-label="Search"
          >
            <i className="bi bi-search"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;