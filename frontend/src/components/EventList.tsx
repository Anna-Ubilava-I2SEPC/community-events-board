import React from "react";
import type { Event } from "../types/Event";

interface EventListProps {
  events: Event[];
}

const EventList: React.FC<EventListProps> = ({ events }) => {
  return (
    <div>
      <h2>Upcoming Events</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {events.map((event) => (
          <li
            key={event.id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <h3>{event.title}</h3>
            <p>
              <strong>Date:</strong> {new Date(event.date).toLocaleString()}
            </p>
            <p>
              <strong>Location:</strong> {event.location}
            </p>
            {event.description && <p>{event.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;
