// src/components/EventForm.tsx
import React, { useState } from "react";

const EventForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

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

    // If all good, log the event (you'll wire POST in 5.1)
    console.log({
      title,
      date,
      location,
      description,
    });

    const newEvent = {
      title,
      date,
      location,
      description,
    };

    try {
      const response = await fetch("http://localhost:4000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error("Failed to submit event");
      }

      alert("Event submitted successfully!");
      setTitle("");
      setDate("");
      setLocation("");
      setDescription("");
    } catch (error) {
      console.error("Error submitting event:", error);
      alert("There was a problem submitting your event.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Event</h2>

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

      <button type="submit">Submit Event</button>
    </form>
  );
};

export default EventForm;
