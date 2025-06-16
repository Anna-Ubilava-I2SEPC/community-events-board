import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import EventForm from "./components/EventForm";
import EventList from "./components/EventList";
import Login from "./components/Login";
import Register from "./components/Register";
import type { Event } from "./types/Event";
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
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
      
      const eventsData = await response.json();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  // Function to refresh events (to be called after form submission)
  const handleEventAdded = () => {
    fetchEvents();
  };

  const Home = () => (
    <div>
      <h1>Community Events Board</h1>
      <EventForm onEventAdded={handleEventAdded} />
      {loading && <p>Loading events...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && <EventList events={events} onEventUpdated={handleEventAdded} />}
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <div>
          <nav style={styles.nav}>
            <div style={styles.navLeft}>
              <Link to="/" style={styles.link}>Home</Link>
            </div>
            <div style={styles.navRight}>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.link}>Sign Up</Link>
            </div>
          </nav>

          <div style={styles.content}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#f8f9fa',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  navLeft: {
    display: 'flex',
    gap: '1rem',
  },
  navRight: {
    display: 'flex',
    gap: '1rem',
  },
  link: {
    textDecoration: 'none',
    color: '#007bff',
    fontWeight: 'bold',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  content: {
    padding: '2rem',
  },
};

export default App;
