# ✅ Project TODO – Community Events Board

This TODO list reflects the current status of tasks based on the initial 5-feature breakdown. These tasks are divided among 3 team members in their own todo-name.md files.

---

## ✅ Task 1: Set up frontend project with React + TypeScript

- [x] Create React app using CRA with TypeScript
- [x] Clean template and confirm app runs
- [x] Create `frontend/` structure inside repo

---

## 🟠 Task 2: Set up backend server with Node.js + TypeScript + Express

- [ ] 2.1 – Initialize Node.js project with TypeScript (`npm init`, `tsconfig.json`, create `src/`)
- [ ] 2.2 – Set up Express app and basic `/ping` route

- [ ] 2.3 – Create backend folder structure, configure `tsconfig.json`, `nodemon`, and scripts
- [ ] 2.4 – Test backend server locally using sample route

---

## 🟢 Task 3: Create static form in React for submitting an event

- [ ] 3.1 – Create `EventForm` component with fields: title, date, location, description
- [ ] 3.2 – Handle form input using `useState`

- [ ] 3.3 – Add basic validation to form (required fields, ISO date format)
- [ ] 3.4 – Finalize `onSubmit` to log data and clear form on success

---

## 🟡 Task 4: Implement basic POST and GET endpoints in backend

- [ ] 4.1 – Define `Event` interface/model in TypeScript
- [ ] 4.2 – Implement `GET /events` to return events from in-memory store
- [ ] 4.3 – Implement `POST /events` to add new event with validation
- [ ] 4.4 – Test both endpoints using Postman or curl

---

## 🟢 Task 5: Connect frontend form to backend using fetch and display events list

- [ ] 5.1 – Connect `EventForm` to `POST /events` with `fetch`
- [ ] Clear form and show result on success

- [ ] 5.2 – Create `EventList` component to display events
- [ ] 5.3 – Fetch events via `GET /events` and display them
- [ ] 5.4 – Apply minimal styling to event cards or list

---

## ✅ Notes

- Each member contributes to at least one frontend, one backend, and one integration task
- Responsibilities are balanced across technical areas
- Tasks should be committed with clear commit messages per feature
