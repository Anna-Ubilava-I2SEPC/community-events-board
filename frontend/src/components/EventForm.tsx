import { Event } from "../types/Event";

const EventForm = () => {
  return (
    <form>
      <input type="text" placeholder="Title" required />
      <input type="date" required />
      <input type="text" placeholder="Location" required />
      <textarea placeholder="Description" />
      <button type="submit">Add Event</button>
    </form>
  );
};

export default EventForm;
