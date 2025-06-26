import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Link } from "react-router-dom";
import "./CalendarPage.css";
import "../App.css";
import type { Event } from "../types/Event";

const apiUrl = import.meta.env.VITE_API_URL;

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [allEventDates, setAllEventDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all event dates for red highlighting
  useEffect(() => {
    const preloadEventDates = async () => {
      try {
        const response = await fetch(`${apiUrl}/events?limit=1000`);
        const data = await response.json();
        const dates = data.events.map((e: Event) => e.date);
        setAllEventDates(dates);
      } catch (err) {
        console.error("Could not load all event dates", err);
      }
    };

    preloadEventDates();
  }, []);

  // Load events for selected date
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedDate) return;

      const formattedDate = selectedDate.toLocaleDateString("sv-SE"); // yyyy-mm-dd
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/events?date=${formattedDate}`);

        if (!response.ok) throw new Error("Failed to fetch events.");

        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error(err);
        setError("Could not load events for this date.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedDate]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Event Calendar</h1>
        <p>Select a date to view events.</p>
      </div>

      <div className="calendar-wrapper">
        <Calendar
          onChange={(value) => {
            if (value instanceof Date) {
              setSelectedDate(value);
            }
          }}
          value={selectedDate}
          selectRange={false}
          tileClassName={({ date, view }) => {
            if (view === "month") {
              const formatted = date.toLocaleDateString("sv-SE");
              if (allEventDates.includes(formatted)) {
                return "has-event";
              }
            }
            return null;
          }}
        />
      </div>

      <div className="event-list-for-date">
        {selectedDate && (
          <>
            <h2>
              Events on{" "}
              {selectedDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>

            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !error && events.length > 0 ? (
              <div className="events-grid">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="event-card event-card-clickable"
                    onClick={() => {
                      window.location.href = `/events/${event.id}`;
                    }}
                  >
                    {event.imageUrl && (
                      <div className="event-image-wrapper">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="event-image"
                          style={{ maxHeight: "180px", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    <div className="event-card-content">
                      <h3>{event.title}</h3>

                      <div className="event-details">
                        <p className="event-date">
                          <strong>📅 Date:</strong>{" "}
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="event-location">
                          <strong>📍 Location:</strong> {event.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !loading &&
              !error && (
                <div className="no-events">
                  <p>No event for this date.</p>
                  <Link to="/add-event" className="add-event-button">
                    ➕ Add Event
                  </Link>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
