## Project Specification: Community Events Board

---

### 1. Project Summary

Community Events Board is a simple full-stack web application where users in a small community (such as university campus) can view and add local events. The app uses React + TypeScript on the frontend, Node.js + TypeScript on the backend, and MongoDB as the data store.

The project is initially intentionally minimal, focusing on core full-stack concepts like frontend-backend communication, basic data storage, and TypeScript-based structure enforcement.

---

### 2. MVP Feature Set

-Event submission form
-Event listing display
-Basic Express.js server
-In-memory or simple MongoDB-based storage
-Basic input validation
-Minimal styling and responsive design

---

### 3. Core Features

#### 3.1. View Events List

- **Goal:** Display a list of upcoming events in the frontend.
- **UI Behavior:**
  - Sorted by date (soonest first).
  - Each event card includes:
    - Title
    - Date
    - Location
    - Description

#### 3.2. Submit New Event

- **Goal:** Allow users to add events via a form.
- **Form Fields:**
  - `Title` (required, text input)
  - `Date` (required, date picker)
  - `Location` (required, text input)
  - `Description` (optional, textarea)
- **Validation:**
  - All required fields must be filled before submission.
  - Date must be a valid ISO 8601 date string.
- **On Submit:**
  - Send POST request to backend.
  - Show success or error message.
  - Append new event to list without reload.
  - Clear form upon success.

---

### 4. Data Model

**TypeScript Interface (shared across frontend and backend):**

// Event definition in TypeScript

```ts
export interface Event {
  id: string; // UUID
  title: string;
  date: string; // ISO string format
  location: string;
  description?: string; // Optional
}
```

---

### 5. API Endpoints

- GET /events
  - Returns a list of all stored events
- POST /events
  - Accepts an event object in JSON format and adds it to the database

---

### 6. Database Schema (MongoDB)

{
"\_id": ObjectId,
"title": String,
"date": String,
"location": String,
"description": String
}

---

### 7. Initial Task List

1. Set up frontend project with React + TypeScript
2. Set up backend server with Node.js + TypeScript + Express
3. Create a static form in React for submitting an event
4. Implement basic POST and GET endpoints in backend
5. Connect frontend form to backend using fetch and display events list

- 5.1 wire form to backend
- 5.2 Fetch+ render events (view list)

---

### 8. Potential Future Enhanced Features

- Add login system and user roles
- Improve form validation and feedback
- Add event deletion/editing

---

This spec.md is meant to be iteratively updated as development progresses.
