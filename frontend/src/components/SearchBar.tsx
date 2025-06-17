import React, { useState, useCallback } from "react";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  initialValue?: string;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search events by title, description, or location...",
  initialValue = "",
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(searchTerm.trim());
    },
    [searchTerm, onSearch]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="search-input"
            disabled={loading}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-search-button"
              disabled={loading}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? "🔄" : "🔍"} Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
