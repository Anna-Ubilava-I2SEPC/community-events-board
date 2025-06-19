import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  EmailIcon,
} from "react-share";
import type { Event } from "../types/Event";
import EventForm from "./EventForm";
import CommentsSection from "./CommentsSection";
import StarRating from "./StarRating";
import { useAuth } from "../contexts/AuthContext";
import "../App.css";

const EventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [rating, setRating] = useState<{ average: number; votes: number }>({
    average: 0,
    votes: 0,
  });
  const [userRating, setUserRating] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState(false);

  // Get the current page URL for sharing
  const shareUrl = window.location.href;
  const shareTitle = `Check out this event: ${event?.title}`;
  const shareDescription =
    event?.description || `${event?.title} - ${event?.location}`;

  // Check if current user is the creator of the event or an admin
  const isCreator = isAuthenticated && user && event && event.createdBy === user._id;
  const isAdmin = isAuthenticated && user && user.role === 'admin';
  const canEditOrDelete = isCreator || isAdmin;

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError("Event ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://51.21.199.217:4000/events?page=1&limit=1000`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        const foundEvent = data.events.find(
          (e: any) => e._id === id || e.id === id
        );

        if (!foundEvent) {
          setError("Event not found");
          setLoading(false);
          return;
        }

        // Normalize the event data
        const normalizedEvent = {
          ...foundEvent,
          id: foundEvent._id || foundEvent.id,
          categoryIds:
            foundEvent.categoryIds?.map((cat: any) =>
              typeof cat === "object" && cat !== null
                ? { ...cat, id: cat._id || cat.id }
                : cat
            ) || [],
        };

        setEvent(normalizedEvent);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    const fetchRating = async () => {
      if (!event) return;

      try {
        const res = await fetch(`http://51.21.199.217:4000/ratings/${event.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setRating({
            average: data.averageRating || 0,
            votes: data.totalVotes || 0,
          });
          if (data.userRating) {
            setUserRating(data.userRating);
          }
        }
      } catch (err) {
        console.error("Failed to fetch rating for event:", event.id);
      }
    };

    fetchRating();
  }, [event]);

  const handleRating = async (value: number) => {
    if (!event) return;

    try {
      const res = await fetch("http://51.21.199.217:4000/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ eventId: event.id, value }),
      });

      if (res.ok) {
        setUserRating(value);

        // Fetch updated average and vote count
        const ratingRes = await fetch(
          `http://51.21.199.217:4000/ratings/${event.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (ratingRes.ok) {
          const data = await ratingRes.json();
          setRating({
            average: data.averageRating,
            votes: data.totalVotes,
          });
        }
      } else {
        const err = await res.text();
        console.error("Failed to submit rating:", err);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const handleEditClick = () => {
    if (event) {
      setEditingEvent(event);
    }
  };

  const handleEditCancel = () => {
    setEditingEvent(null);
  };

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
        `http://51.21.199.217:4000/events/${updatedEvent.id}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      const updatedData = await response.json();
      const normalizedUpdatedEvent = {
        ...updatedData,
        id: updatedData._id || updatedData.id,
        categoryIds:
          updatedData.categoryIds?.map((cat: any) =>
            typeof cat === "object" && cat !== null
              ? { ...cat, id: cat._id || cat.id }
              : cat
          ) || [],
      };

      setEvent(normalizedUpdatedEvent);
      setEditingEvent(null);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("There was a problem updating the event.");
    }
  };

  const handleDeleteClick = async () => {
    if (!event) return;

    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`http://51.21.199.217:4000/events/${event.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete event");

      // Navigate back to home page after deletion
      navigate("/");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("There was a problem deleting the event.");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleBackClick = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={handleBackClick} className="back-button">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-container">
        <div className="error-state">
          <p>Event not found</p>
          <button onClick={handleBackClick} className="back-button">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={handleBackClick} className="back-button">
          ← Back to Events
        </button>
        <h1>{event.title}</h1>
      </div>

      <div className="event-page-content">
        {editingEvent ? (
          <div className="event-edit-form">
            <EventForm
              initialEvent={editingEvent}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
              isEditing={true}
            />
          </div>
        ) : (
          <>
            <div className="event-details-card">
              {event.imageUrl && (
                <div className="event-image-wrapper">
                  <img
                    src={`http://51.21.199.217:4000${event.imageUrl}`}
                    alt={event.title}
                    className="event-image-large"
                  />
                </div>
              )}

              <div className="event-info">
                <div className="event-basic-info">
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
                  {event.createdByName && (
                    <p className="event-creator">
                      <strong>👤 Created by:</strong> {event.createdByName}
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
                              <span key={key} className="event-category-badge">
                                {name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>

                <div className="event-rating-section">
                  <StarRating rating={userRating} onRate={handleRating} />
                  <p style={{ fontSize: "0.9rem", color: "#666" }}>
                    Average Rating: {rating.average.toFixed(1)} / 5 (
                    {rating.votes} votes)
                  </p>
                </div>

                {canEditOrDelete && (
                  <div className="event-actions">
                    <button className="edit-button" onClick={handleEditClick}>
                      Edit Event
                    </button>
                    <button className="delete-button" onClick={handleDeleteClick}>
                      Delete Event
                    </button>
                  </div>
                )}

                <div className="social-sharing-section">
                  <h3>Share this event:</h3>
                  <div className="social-buttons">
                    <FacebookShareButton
                      url={shareUrl}
                      quote={`Check out this event: ${event.title}`}
                      hashtag="#CommunityEvents"
                    >
                      <FacebookIcon size={32} round />
                    </FacebookShareButton>

                    <TwitterShareButton
                      url={shareUrl}
                      title={`Check out this event: ${event.title}`}
                      hashtags={["CommunityEvents", "Event"]}
                    >
                      <TwitterIcon size={32} round />
                    </TwitterShareButton>

                    <LinkedinShareButton
                      url={shareUrl}
                      title={shareTitle}
                      summary={shareDescription}
                    >
                      <LinkedinIcon size={32} round />
                    </LinkedinShareButton>

                    <WhatsappShareButton url={shareUrl} title={shareTitle}>
                      <WhatsappIcon size={32} round />
                    </WhatsappShareButton>

                    <EmailShareButton
                      url={shareUrl}
                      subject={`Event: ${event.title}`}
                      body={`I thought you might be interested in this event: ${
                        event.title
                      }\n\nDate: ${new Date(
                        event.date
                      ).toLocaleDateString()}\nLocation: ${
                        event.location
                      }\n\nCheck it out here:`}
                    >
                      <EmailIcon size={32} round />
                    </EmailShareButton>

                    <button
                      className="copy-link-button"
                      onClick={handleCopyLink}
                      title="Copy event link"
                    >
                      {copySuccess ? "✓ Copied!" : "📋 Copy Link"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <CommentsSection eventId={event.id} />
          </>
        )}
      </div>
    </div>
  );
};

export default EventPage;
