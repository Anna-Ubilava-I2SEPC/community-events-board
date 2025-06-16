// src/components/EventForm.tsx
import React, { useState, useEffect } from "react";
import type { Event } from "../types/Event";

interface EventFormProps {
  onEventAdded?: () => void;
  initialEvent?: Event;
  onSubmit?: (event: Event) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ 
  onEventAdded, 
  initialEvent, 
  onSubmit, 
  onCancel,
  isEditing = false 
}) => {
  const [title, setTitle] = useState(initialEvent?.title || "");
  const [date, setDate] = useState(initialEvent?.date ? new Date(initialEvent.date).toISOString().split('T')[0] : "");
  const [location, setLocation] = useState(initialEvent?.location || "");
  const [description, setDescription] = useState(initialEvent?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const clearForm = () => {
    setTitle("");
    setDate("");
    setLocation("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic required field check
    if (!title.trim() || !date || !location.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    // Optional: validate ISO format & future date
    const inputDate = new Date(date);
    const now = new Date();

    if (isNaN(inputDate.getTime())) {
      alert("Please enter a valid date.");
      return;
    }

    if (inputDate < now) {
      alert("Date must be in the future.");
      return;
    }

    const eventData = {
      ...(initialEvent || {}),
      title,
      date,
      location,
      description,
    };

    try {
      setIsSubmitting(true);

      if (isEditing && onSubmit) {
        // Handle edit submission
        await onSubmit(eventData as Event);
      } else {
        // Handle new event creation
        const response = await fetch("http://localhost:4000/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          throw new Error("Failed to submit event");
        }

        // Show success state
        setSubmitSuccess(true);
        
        // Clear form on successful submission
        clearForm();
        
        // Notify parent component that an event was added
        if (onEventAdded) {
          onEventAdded();
        }

        // Reset success state after 2 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting event:", error);
      alert("There was a problem submitting your event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEditing ? "Edit Event" : "Add New Event"}</h2>

      <label>
        Title*:
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>

      <label>
        Date*:
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <label>
        Location*:
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </label>

      <label>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <div className="buttons">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={submitSuccess ? "success" : ""}
        >
          {isSubmitting ? "Submitting..." : submitSuccess ? "✓ Success!" : isEditing ? "Update Event" : "Submit Event"}
        </button>
        {isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={clearForm}
            disabled={isSubmitting}
          >
            Clear Form
          </button>
        )}
      </div>
    </form>
  );
};

export default EventForm;
