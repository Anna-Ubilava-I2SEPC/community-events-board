import React from "react";

export interface SortOption {
  value: string;
  label: string;
  field: string;
  order: "asc" | "desc";
}

export interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface SortDropdownProps {
  sortState: SortState;
  onSortChange: (sortState: SortState) => void;
  loading?: boolean;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  sortState,
  onSortChange,
  loading = false,
}) => {
  const sortOptions: SortOption[] = [
    {
      value: "date-asc",
      label: "Date (Earliest First)",
      field: "date",
      order: "asc",
    },
    {
      value: "date-desc",
      label: "Date (Latest First)",
      field: "date",
      order: "desc",
    },
    { value: "title-asc", label: "Title (A-Z)", field: "title", order: "asc" },
    {
      value: "title-desc",
      label: "Title (Z-A)",
      field: "title",
      order: "desc",
    },
    {
      value: "location-asc",
      label: "Location (A-Z)",
      field: "location",
      order: "asc",
    },
    {
      value: "location-desc",
      label: "Location (Z-A)",
      field: "location",
      order: "desc",
    },
  ];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = sortOptions.find(
      (option) => option.value === e.target.value
    );
    if (selectedOption) {
      onSortChange({
        sortBy: selectedOption.field,
        sortOrder: selectedOption.order,
      });
    }
  };

  const currentSortValue = `${sortState.sortBy}-${sortState.sortOrder}`;

  const getSortIcon = (field: string, order: "asc" | "desc") => {
    if (sortState.sortBy !== field) return "";

    switch (field) {
      case "date":
        return sortState.sortOrder === "asc" ? "📅↑" : "📅↓";
      case "title":
        return sortState.sortOrder === "asc" ? "🔤↑" : "🔤↓";
      case "location":
        return sortState.sortOrder === "asc" ? "📍↑" : "📍↓";
      default:
        return sortState.sortOrder === "asc" ? "↑" : "↓";
    }
  };

  return (
    <div className="sort-dropdown">
      <div className="sort-wrapper">
        <label htmlFor="sort-select" className="sort-label">
          <h3>Sort by: </h3>
        </label>
        <div className="sort-select-wrapper">
          <select
            id="sort-select"
            value={currentSortValue}
            onChange={handleSortChange}
            disabled={loading}
            className="sort-select"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="sort-indicator">
            {getSortIcon(sortState.sortBy, sortState.sortOrder)}
          </div>
        </div>
      </div>

      {/* Sort info display */}
      <div className="sort-info">
        <span className="sort-current">
          Sorted by{" "}
          {sortState.sortBy === "date"
            ? "Date"
            : sortState.sortBy === "title"
            ? "Title"
            : "Location"}
          ({sortState.sortOrder === "asc" ? "Ascending" : "Descending"})
        </span>
      </div>
    </div>
  );
};

export default SortDropdown;
