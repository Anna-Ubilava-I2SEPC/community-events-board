import React, { useState, useEffect } from "react";
import type { Category } from "../types/Category";

export interface FilterState {
  categories: string[];
  startDate: string;
  endDate: string;
  location: string;
}

interface FilterSidebarProps {
  categories: Category[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter((id) => id !== categoryId);

    onFiltersChange({
      ...filters,
      categories: updatedCategories,
    });
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const handleLocationChange = (value: string) => {
    onFiltersChange({
      ...filters,
      location: value,
    });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.startDate ||
    filters.endDate ||
    filters.location;

  // Get today's date in YYYY-MM-DD format for date input min value
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3>Filters</h3>
        <div className="filter-header-actions">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="clear-filters-button"
              disabled={loading}
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="toggle-filters-button"
            aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="filter-content">
          {/* Category Filter */}
          <div className="filter-section">
            <h4>Categories</h4>
            <div className="category-filters">
              {categories.length === 0 ? (
                <p className="no-categories">No categories available</p>
              ) : (
                categories.map((category) => (
                  <label key={category.id} className="category-filter-item">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category.id)}
                      onChange={(e) =>
                        handleCategoryChange(category.id, e.target.checked)
                      }
                      disabled={loading}
                    />
                    <div className="category-filter-label">
                      <span className="category-name">{category.name}</span>
                      {category.description && (
                        <small className="category-description">
                          {category.description}
                        </small>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="filter-section">
            <h4>Date Range</h4>
            <div className="date-range-filters">
              <div className="date-input-group">
                <label htmlFor="start-date">From:</label>
                <input
                  id="start-date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleDateChange("startDate", e.target.value)
                  }
                  min={today}
                  disabled={loading}
                  className="date-input"
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="end-date">To:</label>
                <input
                  id="end-date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleDateChange("endDate", e.target.value)}
                  min={filters.startDate || today}
                  disabled={loading}
                  className="date-input"
                />
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div className="filter-section">
            <h4>Location</h4>
            <div className="location-filter">
              <input
                type="text"
                placeholder="Filter by location..."
                value={filters.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                disabled={loading}
                className="location-input"
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="filter-section active-filters">
              <h4>Active Filters</h4>
              <div className="active-filters-list">
                {filters.categories.length > 0 && (
                  <div className="active-filter-group">
                    <span className="filter-label">Categories:</span>
                    <div className="filter-tags">
                      {filters.categories.map((categoryId) => {
                        const category = categories.find(
                          (c) => c.id === categoryId
                        );
                        return category ? (
                          <span key={categoryId} className="filter-tag">
                            {category.name}
                            <button
                              onClick={() =>
                                handleCategoryChange(categoryId, false)
                              }
                              className="remove-filter-tag"
                              aria-label={`Remove ${category.name} filter`}
                            >
                              ✕
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {(filters.startDate || filters.endDate) && (
                  <div className="active-filter-group">
                    <span className="filter-label">Date Range:</span>
                    <span className="filter-value">
                      {filters.startDate &&
                        new Date(filters.startDate).toLocaleDateString()}
                      {filters.startDate && filters.endDate && " - "}
                      {filters.endDate &&
                        new Date(filters.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {filters.location && (
                  <div className="active-filter-group">
                    <span className="filter-label">Location:</span>
                    <span className="filter-value">{filters.location}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
