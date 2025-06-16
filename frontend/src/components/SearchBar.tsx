import React from 'react';

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Search events..."
      value={query}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded"
    />
  );
};

export default SearchBar;
