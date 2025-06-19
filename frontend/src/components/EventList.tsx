import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Event } from "../types/Event";
import StarRating from "./StarRating";

interface EventListProps {
  events: Event[];
  onEventUpdated?: () => void;
}

const EventList: React.FC<EventListProps> = ({ events, onEventUpdated }) => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<
    Record<string, { average: number; votes: number }>
  >({});
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});

  const handleCardClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleRating = async (eventId: string, value: number) => {
    try {
      const res = await fetch("http://51.21.199.217:4000/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ eventId, value }),
      });

      if (res.ok) {
        setUserRatings((prev) => ({ ...prev, [eventId]: value }));

        // Fetch updated average and vote count
        const ratingRes = await fetch(
          `http://51.21.199.217:4000/ratings/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (ratingRes.ok) {
          const data = await ratingRes.json();

          setRatings((prev) => ({
            ...prev,
            [eventId]: {
              average: data.averageRating,
              votes: data.totalVotes,
            },
          }));
        }
        onEventUpdated?.();
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
      const allRatings: Record<string, { average: number; votes: number }> = {};
      const userGivenRatings: Record<string, number> = {};

      for (const event of events) {
        try {
          const res = await fetch(`http://51.21.199.217:4000/ratings/${event.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            allRatings[event.id] = {
              average: data.averageRating || 0,
              votes: data.totalVotes || 0,
            };
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
            <div
              key={event.id}
              className="event-card event-card-clickable"
              onClick={() => handleCardClick(event.id)}
            >
              {event.imageUrl && (
                <div className="event-image-wrapper">
                  <img
                    src={`http://51.21.199.217:4000${event.imageUrl}`}
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
                              <span key={key} className="event-category-badge">
                                {name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  <div
                    className="rating-section"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StarRating
                      rating={userRatings[event.id] || 0}
                      onRate={(val) => handleRating(event.id, val)}
                    />
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#666",
                        margin: "4px 0 0",
                      }}
                    >
                      Average Rating:{" "}
                      {ratings[event.id]?.average?.toFixed(1) || "N/A"} / 5 (
                      {ratings[event.id]?.votes?.toFixed(0)} votes)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
