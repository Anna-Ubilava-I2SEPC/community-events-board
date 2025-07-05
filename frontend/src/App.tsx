import React, { useState, useEffect, useCallback } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTheme } from "./contexts/ThemeContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import EventForm from "./components/EventForm";
import EventList from "./components/EventList";
import EventPage from "./components/EventPage";
import CategoryForm from "./components/CategoryForm";
import CategoryList from "./components/CategoryList";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import SearchBar from "./components/SearchBar";
import FilterSidebar, { type FilterState } from "./components/FilterSidebar";
import SortDropdown, { type SortState } from "./components/SortDropdown";
import NoResults from "./components/NoResults";
import type { Event } from "./types/Event";
import type { Category } from "./types/Category";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import CalendarPage from "./components/CalendarPage";
import { io } from "socket.io-client";
import { socket } from "./utils/socket";

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
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to home page after logout
  };
  const { theme, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🎉 </span>
            Events Board
          </Link>
        </div>

        {/* ☰ Icon */}
        <div className="nav-actions">
          <button
            className="mobile-nav-toggle"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            ☰
          </button>
        </div>

        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-link">
              <span className="nav-icon">🏠 </span>
              Home
            </Link>
          </li>
          <li>
            <Link to="/calendar" className="nav-link">
              <span className="nav-icon">📅 </span>
              Calendar
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
                      {user?.name || "Profile"}
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="nav-link nav-button"
                    >
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
          <li>
            <button
              onClick={toggleTheme}
              className="nav-link nav-button"
              style={{ fontSize: "1rem" }}
            >
              🌓 {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </li>
        </ul>
      </div>

      {/* Full-screen Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <button
            className="close-mobile-menu"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close mobile menu"
          >
            ✕
          </button>
          <ul className="mobile-nav-links">
            <li>
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                🏠 Home
              </Link>
            </li>
            <li>
              <Link to="/calendar" onClick={() => setIsMobileMenuOpen(false)}>
                📅 Calendar
              </Link>
            </li>
            <li>
              <Link to="/add-event" onClick={() => setIsMobileMenuOpen(false)}>
                ➕ Add Event
              </Link>
            </li>
            <li>
              <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)}>
                📂 Categories
              </Link>
            </li>
            {!loading &&
              (isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      👤 {user?.name || "Profile"}
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      🚪 Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      🔑 Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      👤 Register
                    </Link>
                  </li>
                </>
              ))}
            <li>
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
              >
                🌓 {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

function AppContent() {
  const apiUrl = import.meta.env.VITE_API_URL;
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
      const url = `${apiUrl}/events${queryParams ? `?${queryParams}` : ""}`;
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
      const response = await fetch(`${apiUrl}/categories`);

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

  useEffect(() => {
    // Handle real-time updates from the server
    const handleEventCreated = (newEvent: Event) => {
      setEvents((prev) => [newEvent, ...prev]);
    };

    const handleEventUpdated = (updatedEvent: Event) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
      );
    };

    const handleEventDeleted = (deletedEventId: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== deletedEventId));
    };

    socket.on("eventCreated", handleEventCreated);
    socket.on("eventUpdated", handleEventUpdated);
    socket.on("eventDeleted", handleEventDeleted);

    // Cleanup on unmount
    return () => {
      socket.off("eventCreated", handleEventCreated);
      socket.off("eventUpdated", handleEventUpdated);
      socket.off("eventDeleted", handleEventDeleted);
    };
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
          <div className="content-footer">
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
        </main>
      </div>
    </div>
  );

  const { theme } = useTheme();

  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(theme);
  }, [theme]);

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
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/events/:id" element={<EventPage />} />
            <Route
              path="/add-event"
              element={
                <ProtectedRoute>
                  <ToastContainer />
                  <AddEventPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
