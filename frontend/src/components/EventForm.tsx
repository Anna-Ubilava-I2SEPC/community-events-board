// src/components/EventForm.tsx
import React, { useState } from 'react';

const EventForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Just log for now (Task 3.4 will clear and validate)
    console.log({ title, date, location, description });
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
