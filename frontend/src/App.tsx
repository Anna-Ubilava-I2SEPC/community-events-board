import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import EventForm from "./components/EventForm";
import EventList from "./components/EventList";
import CategoryForm from "./components/CategoryForm";
import CategoryList from "./components/CategoryList";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import SearchBar from "./components/SearchBar";
import FilterSidebar, { type FilterState } from "./components/FilterSidebar";
import SortDropdown, { type SortState } from "./components/SortDropdown";
import NoResults from "./components/NoResults";
import type { Event } from "./types/Event";
import type { Category } from "./types/Category";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Extended Event response type for API
interface EventsResponse {
  events: Event[];
  pagination: {
    current: number;
    total: number;
    count: number;
    totalEvents: number;
  };
  filters: {
    search: string;
    categories: string;
    startDate: string;
    endDate: string;
    location: string;
    sortBy: string;
    sortOrder: string;
  };
}

// Navigation Component
const Navigation: React.FC = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🎉 </span>
            Events Board
          </Link>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-link">
              <span className="nav-icon">🏠 </span>
              Home
            </Link>
          </li>
          <li>
            <Link to="/add-event" className="nav-link">
              <span className="nav-icon">➕ </span>
              Add Event
            </Link>
          </li>
          <li>
            <Link to="/categories" className="nav-link">
              <span className="nav-icon">📂 </span>
              Categories
            </Link>
          </li>
          
          {!loading && (
            <>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/profile" className="nav-link">
                      <span className="nav-icon">👤 </span>
                      {user?.name || 'Profile'}
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="nav-link nav-button">
                      <span className="nav-icon">🚪 </span>
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="nav-link">
                      <span className="nav-icon">🔑 </span>
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="nav-link">
                      <span className="nav-icon">👤 </span>
                      Register
                    </Link>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

function AppContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Filter, and Sort state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    startDate: "",
    endDate: "",
    location: "",
  });
  const [sortState, setSortState] = useState<SortState>({
    sortBy: "date",
    sortOrder: "asc",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalEvents: 0,
  });

  // Build query parameters for API calls
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    if (searchTerm) params.append("search", searchTerm);
    if (filters.categories.length > 0)
      params.append("categories", filters.categories.join(","));
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.location) params.append("location", filters.location);
    if (sortState.sortBy) params.append("sortBy", sortState.sortBy);
    if (sortState.sortOrder) params.append("sortOrder", sortState.sortOrder);

    return params.toString();
  }, [searchTerm, filters, sortState]);

  // Function to fetch events from the API
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = buildQueryParams();
      const url = `http://localhost:4000/events${
        queryParams ? `?${queryParams}` : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data: EventsResponse = await response.json();

      // Normalize id field for events
      const eventsData = data.events.map((event: any) => ({
        ...event,
        id: event._id || event.id,
        categoryIds:
          event.categoryIds?.map((cat: any) =>
            typeof cat === "object" && cat !== null
              ? { ...cat, id: cat._id || cat.id }
              : cat
          ) || [],
      }));

      setEvents(eventsData);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // Function to fetch categories from the API
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:4000/categories");

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      let categoriesData = await response.json();
      // Normalize id field
      categoriesData = categoriesData.map((cat: any) => ({
        ...cat,
        id: cat._id || cat.id,
      }));
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories. Please try again later.");
    }
  };

  // Fetch events when search, filter, or sort changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Search handlers
  const handleSearch = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Filter handlers
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      categories: [],
      startDate: "",
      endDate: "",
      location: "",
    });
  }, []);

  // Sort handlers
  const handleSortChange = useCallback((newSortState: SortState) => {
    setSortState(newSortState);
  }, []);

  // Function to refresh events (to be called after form submission)
  const handleEventAdded = () => {
    fetchEvents();
  };

  // Function to refresh categories (to be called after form submission)
  const handleCategoryAdded = () => {
    fetchCategories();
  };

  // Check if we have active filters
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.startDate ||
    filters.endDate ||
    filters.location;

  // Home Page Component
  const Home = () => (
    <div className="page-container">
      <div className="page-header">
        <h1>Community Events Board</h1>
        <p className="page-subtitle">
          Discover and explore upcoming events in your community
        </p>
      </div>

      <div className="home-layout">
        {/* Left Sidebar: Search, Sort, Filters */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <SearchBar
              onSearch={handleSearch}
              initialValue={searchTerm}
              loading={loading}
            />
          </div>

          <div className="sidebar-section">
            <SortDropdown
              sortState={sortState}
              onSortChange={handleSortChange}
              loading={loading}
            />
          </div>

          <div className="sidebar-section">
            <FilterSidebar
              categories={categories}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              loading={loading}
            />
          </div>
        </aside>

        {/* Main Content: Events */}
        <main className="main-content">
          <div className="content-header">
            <div className="results-info">
              {!loading && (
                <span className="results-count">
                  {pagination.totalEvents === 0
                    ? "No events found"
                    : `${pagination.totalEvents} event${
                        pagination.totalEvents !== 1 ? "s" : ""
                      } found`}
                  {(searchTerm || hasActiveFilters) && (
                    <span className="filter-indicator">
                      {searchTerm && ` matching "${searchTerm}"`}
                      {hasActiveFilters && " with filters applied"}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="events-container">
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading events...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && events.length === 0 && (
              <NoResults
                searchTerm={searchTerm}
                hasFilters={!!hasActiveFilters}
                onClearSearch={handleClearSearch}
                onClearFilters={handleClearFilters}
              />
            )}

            {!loading && !error && events.length > 0 && (
              <EventList events={events} onEventUpdated={handleEventAdded} />
            )}
          </div>
        </main>
      </div>
    </div>
  );

  // Add Event Page Component
  const AddEventPage = () => (
    <div className="page-container">
      <div className="page-header">
        <h1>Add New Event</h1>
        <p className="page-subtitle">Create a new event for your community</p>
      </div>
      <div className="form-container">
        <EventForm onEventAdded={handleEventAdded} />
      </div>
    </div>
  );

  // Categories Management Page Component
  const CategoriesPage = () => (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Categories</h1>
        <p className="page-subtitle">Create and organize event categories</p>
      </div>
      <div className="categories-layout">
        <div className="form-container">
          <CategoryForm onCategoryAdded={handleCategoryAdded} />
        </div>
        <div className="categories-list-container">
          <CategoryList
            categories={categories}
            onCategoryUpdated={handleCategoryAdded}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Router>
      <div className="app">
        <Navigation />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-event" element={<AddEventPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
