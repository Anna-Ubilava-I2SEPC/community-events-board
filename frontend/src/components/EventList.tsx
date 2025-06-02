import React from "react";
import type { Event } from "../types/Event";

interface EventListProps {
  events: Event[];
}

const EventList: React.FC<EventListProps> = ({ events }) => {
  return (
    <div className="event-list">
      <h2>Upcoming Events</h2>
      {events.length === 0 ? (
        <div className="no-events">
          <p>No events found. Be the first to add one!</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.title}</h3>
              <div className="event-details">
                <p className="event-date">
                  <strong>📅 Date:</strong> {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric", 
                    month: "long",
                    day: "numeric"
                  })}
                </p>
                <p className="event-location">
                  <strong>📍 Location:</strong> {event.location}
                </p>
                {event.description && (
                  <p className="event-description">
                    <strong>ℹ️ Description:</strong> {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
