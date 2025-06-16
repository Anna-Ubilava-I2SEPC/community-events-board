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

  const handleEditSubmit = async (updatedEvent: Event & { image?: File | null }) => {
    try {
      const formData = new FormData();
      formData.append("title", updatedEvent.title);
      formData.append("date", updatedEvent.date);
      formData.append("location", updatedEvent.location);
      formData.append("description", updatedEvent.description || "");
      formData.append("categoryIds", JSON.stringify(
        updatedEvent.categoryIds.map(cat => typeof cat === 'object' && cat !== null && 'id' in cat ? cat.id : cat)
      ));
      // If image is present in updatedEvent, append it
      if (updatedEvent.image) formData.append("image", updatedEvent.image);

      const response = await fetch(`http://localhost:4000/events/${updatedEvent.id}`, {
        method: "PUT",
        body: formData,
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

  const handleDeleteClick = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      if (onEventUpdated) {
        onEventUpdated();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("There was a problem deleting the event.");
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
                  {event.imageUrl && (
                    <div className="event-image-wrapper">
                      <img src={`http://localhost:4000${event.imageUrl}`} alt={event.title} className="event-image" />
                    </div>
                  )}
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
                    {/* Show categories if available */}
                    {Array.isArray(event.categoryIds) && event.categoryIds.length > 0 && (
                      <div className="event-categories-list">
                        <strong>🏷️ Categories:</strong>
                        <div className="event-category-badges">
                          {event.categoryIds.map((cat, idx) => {
                            let name = '';
                            let key = '';
                            if (typeof cat === 'object' && cat !== null) {
                              name = (cat as any).name || '';
                              key = (cat as any).id || (cat as any)._id || idx.toString();
                            } else if (typeof cat === 'string') {
                              name = cat;
                              key = cat;
                            } else {
                              key = idx.toString();
                            }
                            return (
                              <span key={key} className="event-category-badge">
                                {name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="event-actions">
                      <button 
                        className="edit-button"
                        onClick={() => handleEditClick(event)}
                      >
                        Edit Event
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteClick(event.id)}
                      >
                        Delete Event
                      </button>
                    </div>
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
