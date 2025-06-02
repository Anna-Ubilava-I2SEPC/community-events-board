// src/components/EventForm.tsx
import React, { useState } from "react";

const EventForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
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

    // Optional: show message
    alert("Event validated! Ready to submit.");
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

      <div className="buttons">
        <button type="submit">Submit Event</button>
        <button
          type="button"
          onClick={() => {
            setTitle("");
            setDate("");
            setLocation("");
            setDescription("");
          }}
        >
          Clear Form
        </button>
      </div>
    </form>
  );
};

export default EventForm;
