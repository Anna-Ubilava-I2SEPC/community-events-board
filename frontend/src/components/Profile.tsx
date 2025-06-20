import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import type { Event } from "../types/Event";
import type { Category } from "../types/Category";
import EventForm from "./EventForm";

const Profile: React.FC = () => {
  const { user, isAuthenticated, updateUserData, logout } = useAuth();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "profile" | "email" | "password" | "myevents"
  >("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // My Events states
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Filters for My Events
  const [eventSearch, setEventSearch] = useState("");
  const [eventCategories, setEventCategories] = useState<string[]>([]);
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventSortBy, setEventSortBy] = useState("date");
  const [eventSortOrder, setEventSortOrder] = useState("asc");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Initialize form data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch my events when My Events section is active or filters change
  useEffect(() => {
    if (activeSection === "myevents") {
      fetchMyEvents();
    }
  }, [
    activeSection,
    eventSearch,
    eventCategories,
    eventStartDate,
    eventEndDate,
    eventSortBy,
    eventSortOrder,
  ]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${apiUrl}/users/profile`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateUserData(response.data.user);
      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${apiUrl}/users/change-email`,
        { newEmail: email, currentPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateUserData(response.data.user);
      setMessage("Email updated successfully!");
      setCurrentPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiUrl}/users/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    switch (field) {
      case "current":
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case "new":
        setShowNewPassword(!showNewPassword);
        break;
      case "confirm":
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  // Fetch categories for filtering
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch user's events
  const fetchMyEvents = async () => {
    try {
      setEventsLoading(true);
      setEventsError("");

      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (eventSearch) params.append("search", eventSearch);
      if (eventCategories.length > 0)
        params.append("categories", eventCategories.join(","));
      if (eventStartDate) params.append("startDate", eventStartDate);
      if (eventEndDate) params.append("endDate", eventEndDate);
      if (eventSortBy) params.append("sortBy", eventSortBy);
      if (eventSortOrder) params.append("sortOrder", eventSortOrder);

      const url = `${apiUrl}/events/my${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Normalize event data
      const eventsData = response.data.events.map((event: any) => ({
        ...event,
        id: event._id || event.id,
        categoryIds:
          event.categoryIds?.map((cat: any) =>
            typeof cat === "object" && cat !== null
              ? { ...cat, id: cat._id || cat.id }
              : cat
          ) || [],
      }));

      setMyEvents(eventsData);
    } catch (err: any) {
      console.error("Error fetching my events:", err);
      setEventsError("Failed to load your events");
    } finally {
      setEventsLoading(false);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from local state
      setMyEvents((prev) => prev.filter((event) => event.id !== eventId));
      setMessage("Event deleted successfully!");
    } catch (err: any) {
      setError("Failed to delete event");
    }
  };

  // Handle event editing
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
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

      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/events/${updatedEvent.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

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

      // Update local state
      setMyEvents((prev) =>
        prev.map((event) =>
          event.id === updatedEvent.id ? normalizedUpdatedEvent : event
        )
      );
      setEditingEvent(null);
      setMessage("Event updated successfully!");
    } catch (err: any) {
      setError("Failed to update event");
    }
  };

  const handleEditCancel = () => {
    setEditingEvent(null);
  };

  // Clear event filters
  const clearEventFilters = () => {
    setEventSearch("");
    setEventCategories([]);
    setEventStartDate("");
    setEventEndDate("");
    setEventSortBy("date");
    setEventSortOrder("asc");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        <p className="profile-subtitle">Manage your account settings</p>
      </div>

      {/* Messages */}
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="profile-layout">
        {/* Sidebar Navigation */}
        <div className="profile-sidebar">
          <nav className="profile-nav">
            <button
              className={`profile-nav-btn ${
                activeSection === "profile" ? "active" : ""
              }`}
              onClick={() => setActiveSection("profile")}
            >
              <span className="nav-icon">👤</span>
              Profile Info
            </button>
            <button
              className={`profile-nav-btn ${
                activeSection === "email" ? "active" : ""
              }`}
              onClick={() => setActiveSection("email")}
            >
              <span className="nav-icon">📧</span>
              Change Email
            </button>
            <button
              className={`profile-nav-btn ${
                activeSection === "password" ? "active" : ""
              }`}
              onClick={() => setActiveSection("password")}
            >
              <span className="nav-icon">🔐</span>
              Change Password
            </button>
            <button
              className={`profile-nav-btn ${
                activeSection === "myevents" ? "active" : ""
              }`}
              onClick={() => setActiveSection("myevents")}
            >
              <span className="nav-icon">📅</span>
              My Events
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="profile-content">
          {/* Profile Info Section */}
          {activeSection === "profile" && (
            <div className="profile-section">
              <h2>Profile Information</h2>
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="currentEmail">Current Email</label>
                  <input
                    type="email"
                    id="currentEmail"
                    value={user.email}
                    disabled
                    className="disabled-input"
                  />
                </div>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </form>
            </div>
          )}

          {/* Change Email Section */}
          {activeSection === "email" && (
            <div className="profile-section">
              <h2>Change Email</h2>
              <form onSubmit={handleChangeEmail} className="profile-form">
                <div className="form-group">
                  <label htmlFor="newEmail">New Email</label>
                  <input
                    type="email"
                    id="newEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="currentPasswordEmail">Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPasswordEmail"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="eye-button"
                      onClick={() => togglePasswordVisibility("current")}
                      disabled={loading}
                    >
                      {showCurrentPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Updating..." : "Update Email"}
                </button>
              </form>
            </div>
          )}

          {/* Change Password Section */}
          {activeSection === "password" && (
            <div className="profile-section">
              <h2>Change Password</h2>
              <form onSubmit={handleChangePassword} className="profile-form">
                <div className="form-group">
                  <label htmlFor="currentPasswordChange">
                    Current Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPasswordChange"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="eye-button"
                      onClick={() => togglePasswordVisibility("current")}
                      disabled={loading}
                    >
                      {showCurrentPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="newPasswordChange">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPasswordChange"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="eye-button"
                      onClick={() => togglePasswordVisibility("new")}
                      disabled={loading}
                    >
                      {showNewPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPasswordChange">
                    Confirm New Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPasswordChange"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="eye-button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      disabled={loading}
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}

          {/* My Events Section */}
          {activeSection === "myevents" && (
            <div className="profile-section">
              <h2>My Events</h2>

              {editingEvent ? (
                <div className="editing-event-form">
                  <h3>Edit Event</h3>
                  <EventForm
                    initialEvent={editingEvent}
                    onSubmit={handleEditSubmit}
                    onCancel={handleEditCancel}
                    isEditing={true}
                  />
                </div>
              ) : (
                <>
                  {/* Filters */}
                  <div className="my-events-filters">
                    <div className="filters-row">
                      <div className="filter-group">
                        <label htmlFor="event-search">Search Events</label>
                        <input
                          type="text"
                          id="event-search"
                          placeholder="Search by title, description, or location..."
                          value={eventSearch}
                          onChange={(e) => setEventSearch(e.target.value)}
                        />
                      </div>

                      <div className="filter-group">
                        <label htmlFor="event-start-date">Start Date</label>
                        <input
                          type="date"
                          id="event-start-date"
                          value={eventStartDate}
                          onChange={(e) => setEventStartDate(e.target.value)}
                        />
                      </div>

                      <div className="filter-group">
                        <label htmlFor="event-end-date">End Date</label>
                        <input
                          type="date"
                          id="event-end-date"
                          value={eventEndDate}
                          onChange={(e) => setEventEndDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="filters-row">
                      <div className="filter-group">
                        <label htmlFor="event-sort">Sort By</label>
                        <select
                          id="event-sort"
                          value={`${eventSortBy}-${eventSortOrder}`}
                          onChange={(e) => {
                            const [sortBy, sortOrder] =
                              e.target.value.split("-");
                            setEventSortBy(sortBy);
                            setEventSortOrder(sortOrder);
                          }}
                        >
                          <option value="date-asc">Date (Oldest First)</option>
                          <option value="date-desc">Date (Newest First)</option>
                          <option value="title-asc">Title (A-Z)</option>
                          <option value="title-desc">Title (Z-A)</option>
                          <option value="location-asc">Location (A-Z)</option>
                          <option value="location-desc">Location (Z-A)</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Categories</label>
                        <div className="categories-filter">
                          {categories.map((category) => (
                            <label
                              key={category.id || category._id}
                              className="category-checkbox"
                            >
                              <input
                                type="checkbox"
                                checked={eventCategories.includes(
                                  category.id || category._id || ""
                                )}
                                onChange={(e) => {
                                  const categoryId =
                                    category.id || category._id || "";
                                  if (e.target.checked) {
                                    setEventCategories((prev) => [
                                      ...prev,
                                      categoryId,
                                    ]);
                                  } else {
                                    setEventCategories((prev) =>
                                      prev.filter((id) => id !== categoryId)
                                    );
                                  }
                                }}
                              />
                              {category.name}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="filter-group">
                        <button
                          type="button"
                          onClick={clearEventFilters}
                          className="clear-filters-btn"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Events List */}
                  <div className="my-events-list">
                    {eventsLoading && (
                      <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading your events...</p>
                      </div>
                    )}

                    {eventsError && (
                      <div className="error-state">
                        <p>{eventsError}</p>
                        <button onClick={fetchMyEvents} className="retry-btn">
                          Retry
                        </button>
                      </div>
                    )}

                    {!eventsLoading &&
                      !eventsError &&
                      myEvents.length === 0 && (
                        <div className="empty-state">
                          <p>No events found.</p>
                          <p className="empty-state-subtitle">
                            {eventSearch ||
                            eventCategories.length > 0 ||
                            eventStartDate ||
                            eventEndDate
                              ? "Try adjusting your filters or create your first event."
                              : "You haven't created any events yet."}
                          </p>
                        </div>
                      )}

                    {!eventsLoading && !eventsError && myEvents.length > 0 && (
                      <div className="events-grid">
                        {myEvents.map((event) => (
                          <div key={event.id} className="my-event-card">
                            {event.imageUrl && (
                              <div className="event-image-wrapper">
                                <img
                                  src={`${apiUrl}${event.imageUrl}`}
                                  alt={event.title}
                                  className="event-image"
                                />
                              </div>
                            )}

                            <div className="event-card-content">
                              <h3>{event.title}</h3>
                              <div className="event-details">
                                <p>
                                  <strong>📅 Date:</strong>{" "}
                                  {new Date(event.date).toLocaleDateString()}
                                </p>
                                <p>
                                  <strong>📍 Location:</strong> {event.location}
                                </p>
                                {event.description && (
                                  <p>
                                    <strong>ℹ️ Description:</strong>{" "}
                                    {event.description}
                                  </p>
                                )}
                                {Array.isArray(event.categoryIds) &&
                                  event.categoryIds.length > 0 && (
                                    <div className="event-categories">
                                      <strong>🏷️ Categories:</strong>
                                      <div className="event-category-badges">
                                        {event.categoryIds.map((cat, idx) => {
                                          let name = "";
                                          let key = "";
                                          if (
                                            typeof cat === "object" &&
                                            cat !== null
                                          ) {
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
                              </div>

                              <div className="my-event-actions">
                                <button
                                  onClick={() => handleEditEvent(event)}
                                  className="edit-btn"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="delete-btn"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
