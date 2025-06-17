import React from "react";

interface NoResultsProps {
  searchTerm?: string;
  hasFilters?: boolean;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
}

const NoResults: React.FC<NoResultsProps> = ({
  searchTerm,
  hasFilters,
  onClearSearch,
  onClearFilters,
}) => {
  return (
    <div className="no-results">
      <div className="no-results-icon">🔍</div>

      <h3 className="no-results-title">No Events Found</h3>

      <div className="no-results-message">
        {searchTerm && hasFilters ? (
          <p>
            No events match your search "<strong>{searchTerm}</strong>" with the
            current filters applied.
          </p>
        ) : searchTerm ? (
          <p>
            No events match your search "<strong>{searchTerm}</strong>".
          </p>
        ) : hasFilters ? (
          <p>No events match your current filters.</p>
        ) : (
          <p>No events have been added yet.</p>
        )}
      </div>

      <div className="no-results-suggestions">
        <h4>Try the following:</h4>
        <ul>
          {searchTerm && <li>Check your spelling or try different keywords</li>}
          {hasFilters && <li>Remove some filters to see more results</li>}
          {(searchTerm || hasFilters) && (
            <li>Clear all filters and search terms</li>
          )}
          {!searchTerm && !hasFilters && (
            <li>Be the first to add an event to the community board!</li>
          )}
        </ul>
      </div>

      <div className="no-results-actions">
        {searchTerm && onClearSearch && (
          <button onClick={onClearSearch} className="clear-search-action">
            Clear Search
          </button>
        )}

        {hasFilters && onClearFilters && (
          <button onClick={onClearFilters} className="clear-filters-action">
            Clear All Filters
          </button>
        )}

        {(searchTerm || hasFilters) && onClearSearch && onClearFilters && (
          <button
            onClick={() => {
              onClearSearch();
              onClearFilters();
            }}
            className="clear-all-action"
          >
            Clear Everything
          </button>
        )}
      </div>
    </div>
  );
};

export default NoResults;
