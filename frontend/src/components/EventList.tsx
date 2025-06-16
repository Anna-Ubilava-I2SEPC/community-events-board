import React, { useState } from "react";
import type { Event } from "../types/Event";
import EventForm from "./EventForm";

interface EventListProps {
  events: Event[];
  onEventUpdated?: () => void;
}

const EventList: React.FC<EventListProps> = ({ events, onEventUpdated }) => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
  };

  const handleEditCancel = () => {
    setEditingEvent(null);
  };

  const handleEditSubmit = async (updatedEvent: Event) => {
    try {
      const response = await fetch(`http://localhost:4000/events/${updatedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      setEditingEvent(null);
      if (onEventUpdated) {
        onEventUpdated();
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("There was a problem updating the event.");
    }
  };

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
              {editingEvent?.id === event.id ? (
                <EventForm
                  initialEvent={event}
                  onSubmit={handleEditSubmit}
                  onCancel={handleEditCancel}
                  isEditing={true}
                />
              ) : (
                <>
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
                    <button 
                      className="edit-button"
                      onClick={() => handleEditClick(event)}
                    >
                      Edit Event
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
