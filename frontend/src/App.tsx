import React, { useState, useEffect } from "react";
import "./App.css";
import EventForm from "./components/EventForm";
import EventList from "./components/EventList";
import type { Event } from "./types/Event";

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

  return (
    <div>
      <h1>Community Events Board</h1>
      <EventForm onEventAdded={handleEventAdded} />
      {loading && <p>Loading events...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && <EventList events={events} />}
    </div>
  );
}

export default App;
