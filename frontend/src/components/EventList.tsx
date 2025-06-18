import React, { useEffect, useState } from "react";
import type { Event } from "../types/Event";
import EventForm from "./EventForm";
import CommentsSection from "./CommentsSection";
import StarRating from "./StarRating";

interface EventListProps {
  events: Event[];
  onEventUpdated?: () => void;
}

const EventList: React.FC<EventListProps> = ({ events, onEventUpdated }) => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});

  const handleEditClick = (event: Event) => setEditingEvent(event);
  const handleEditCancel = () => setEditingEvent(null);

  const handleEditSubmit = async (
    updatedEvent: Event & { image?: File | null }
  ) => {
    try {
      const formData = new FormData();
      formData.append("title", updatedEvent.title);
      formData.append("date", updatedEvent.date);
      formData.append("location", updatedEvent.location);
      formData.append("description", updatedEvent.description || "");
      formData.append(
        "categoryIds",
        JSON.stringify(
          updatedEvent.categoryIds.map((cat) =>
            typeof cat === "object" && cat !== null && "id" in cat
              ? cat.id
              : cat
          )
        )
      );
      if (updatedEvent.image) formData.append("image", updatedEvent.image);

      const response = await fetch(
        `http://localhost:4000/events/${updatedEvent.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      setEditingEvent(null);
      onEventUpdated?.();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("There was a problem updating the event.");
    }
  };

  const handleDeleteClick = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`http://localhost:4000/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete event");

      onEventUpdated?.();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("There was a problem deleting the event.");
    }
  };

  const handleRating = async (eventId: string, value: number) => {
    try {
      const res = await fetch("http://localhost:4000/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ eventId, value }),
      });

      if (res.ok) {
        setUserRatings((prev) => ({ ...prev, [eventId]: value }));

        // Fetch updated average and userRating
        const ratingRes = await fetch(
          `http://localhost:4000/ratings/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (ratingRes.ok) {
          const data = await ratingRes.json();
          setRatings((prev) => ({ ...prev, [eventId]: data.averageRating }));
        }
      } else {
        const err = await res.text();
        console.error("Failed to submit rating:", err);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  useEffect(() => {
    const fetchRatings = async () => {
      const allRatings: Record<string, number> = {};
      const userGivenRatings: Record<string, number> = {};

      for (const event of events) {
        try {
          const res = await fetch(`http://localhost:4000/ratings/${event.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            allRatings[event.id] = data.averageRating || 0;
            if (data.userRating) {
              userGivenRatings[event.id] = data.userRating;
            }
          }
        } catch (err) {
          console.error("Failed to fetch rating for event:", event.id);
        }
      }

      setRatings(allRatings);
      setUserRatings(userGivenRatings);
    };

    fetchRatings();
  }, [events]);

  return (
    <div className="event-list">
      <h2>Upcoming Events</h2>
      {events.length === 0 ? (
        <div className="no-events">
          <p>No events found. Try changing your search or filters.</p>
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
                      <img
                        src={`http://localhost:4000${event.imageUrl}`}
                        alt={event.title}
                        className="event-image"
                      />
                    </div>
                  )}

                  <h3>{event.title}</h3>

                  <StarRating
                    rating={userRatings[event.id] || 0}
                    onRate={(val) => handleRating(event.id, val)}
                  />

                  <p style={{ fontSize: "0.9rem", color: "#666" }}>
                    Average Rating: {ratings[event.id]?.toFixed(1) || "N/A"} / 5
                  </p>

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
                    {event.description && (
                      <p className="event-description">
                        <strong>ℹ️ Description:</strong> {event.description}
                      </p>
                    )}
                    {Array.isArray(event.categoryIds) &&
                      event.categoryIds.length > 0 && (
                        <div className="event-categories-list">
                          <strong>🏷️ Categories:</strong>
                          <div className="event-category-badges">
                            {event.categoryIds.map((cat, idx) => {
                              let name = "";
                              let key = "";
                              if (typeof cat === "object" && cat !== null) {
                                name = (cat as any).name || "";
                                key =
                                  (cat as any).id ||
                                  (cat as any)._id ||
                                  idx.toString();
                              } else if (typeof cat === "string") {
                                name = cat;
                                key = cat;
                              } else {
                                key = idx.toString();
                              }
                              return (
                                <span
                                  key={key}
                                  className="event-category-badge"
                                >
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
                  <CommentsSection eventId={event.id} />
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
