import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import EventForm from "./components/EventForm";
import EventList from "./components/EventList";
import CategoryForm from "./components/CategoryForm";
import CategoryList from "./components/CategoryList";
import Login from "./components/Login";
import Register from "./components/Register";
import type { Event } from "./types/Event";
import type { Category } from "./types/Category";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch events from the API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:4000/events");

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      let eventsData = await response.json();
      // Normalize id field
      eventsData = eventsData.map((event: any) => ({
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
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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

  // Fetch events and categories when component mounts
  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

  // Function to refresh events (to be called after form submission)
  const handleEventAdded = () => {
    fetchEvents();
  };

  // Function to refresh categories (to be called after form submission)
  const handleCategoryAdded = () => {
    fetchCategories();
  };

  const Home = () => (
    <div>
      <h1>Community Events Board</h1>
      <div className="content-grid">
        <div className="events-section">
          <EventForm onEventAdded={handleEventAdded} />
          {loading && <p>Loading events...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && (
            <EventList events={events} onEventUpdated={handleEventAdded} />
          )}
        </div>
        <div className="categories-section">
          <CategoryForm onCategoryAdded={handleCategoryAdded} />
          <CategoryList
            categories={categories}
            onCategoryUpdated={handleCategoryAdded}
          />
        </div>
      </div>
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </ul>
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
