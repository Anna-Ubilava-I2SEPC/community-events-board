import React from "react";
import "./App.css";
import EventForm from "./components/EventForm";
import EventList from "./components/EventList";
import type { Event } from "./types/Event";

function App() {
  const sampleEvents: Event[] = [];

  return (
    <div>
      <h1>Community Events Board</h1>
      <EventForm />
      <EventList events={sampleEvents} />
    </div>
  );
}

export default App;
