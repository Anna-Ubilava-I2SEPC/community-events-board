# 📣 Community Events Board

A full-stack web application that enables users to create, browse, and manage community events in real-time, with support for authentication, image uploads, filtering, ratings, and more.

---

## 🌐 Live Deployment

- **Frontend**: [https://main.d1r03isbgzcqje.amplifyapp.com](https://main.d1r03isbgzcqje.amplifyapp.com)
- **Backend**: [https://community-events-board.onrender.com](https://community-events-board.onrender.com)

---

## 🚀 Features

- User registration/login with JWT authentication
- Create, edit, delete events (with optional image upload)
- Filter events by category, date, and location
- Sort events by date, title and location
- Rate and comment on events
- Calendar view for upcoming events
- Real-time updates with Socket.IO
- Upload images to Amazon S3
- Responsive UI with light/dark mode toggle

---

## 💪 Tech Stack

| Frontend                  | Backend                        | DevOps & Infra                                               |
| ------------------------- | ------------------------------ | ------------------------------------------------------------ |
| React + TypeScript        | Node.js + Express + TypeScript | AWS Amplify (frontend), Render (backend), Amazon S3 (images) |
| Vite                      | MongoDB + Mongoose             | Socket.IO, dotenv, Jest                                      |
| React Router, Context API | Multer, multer-s3              | GitHub + Amplify CI/CD                                       |

---

## 📂 Project Structure

```
event-board/
├── backend/
│   ├── src/
│   │   ├── config/       # DB, S3, Multer config
│   │   ├── middleware/   # Auth, S3 upload
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API endpoints
│   │   ├── index.ts      # Main server entry
│   ├── tests/            # Jest tests + sample images
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── contexts/     # Auth, Theme contexts
│   │   ├── types/        # Type definitions
│   │   ├── utils/        # socket.ts client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── .env
```

---

## ⚙️ Setup & Installation

### 🔧 Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
MONGODB_URI=...
JWT_SECRET=...
PORT=4000
NODE_ENV=production
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
AWS_REGION=...
```

Run server:

```bash
npm run build
npm start
```

### 🔧 Frontend

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=https://community-events-board.onrender.com
```

Run frontend:

```bash
npm run dev
```

---

## 🔢 Testing (Jest + Supertest)

```bash
cd backend
npm run test:build
npm test
```

> Note: Requires S3 and MongoDB credentials in `.env.test.js`

---

## 📸 Image Uploads with S3

- Images uploaded using `multer-s3`
- Stored in AWS S3 bucket with `public-read` access
- Events contain direct `imageUrl` to S3 object
- Works both in production and local testing

---

## 🔄 Real-Time Event Updates (Socket.IO)

- Server emits:

  - `eventCreated`
  - `eventUpdated`
  - `eventDeleted`

- Frontend listens using shared `socket.ts` and updates state live
- Works across browser tabs and users

---

## 🚨 API Example

- `GET /events` – Fetch all events
- `POST /events` – Create a new event
- `PUT /events/:id` – Update an event (with image/S3 handling)
- `DELETE /events/:id` – Delete event
- `POST /users/register` – Sign up
- `POST /users/login` – Login

> All routes protected by JWT-based `auth.ts` middleware where applicable

---

## 🏙️ Deployment Notes

- **Frontend** deployed via `amplify.yml` pipeline to AWS Amplify
- **Backend** deployed to Render (Web Service)
- **Environment Variables** are set securely on both platforms

---

## 📘 Documentation

- [`API_TESTING_RESULTS.md`](API_TESTING_RESULTS.md): Verified endpoint behaviors
- [`ProjectIdea.md`](ProjectIdea.md): Team roles, vision, and plan
- `README.md`: Deployment and developer guide (this file)

---

## 🟢 Uptime Monitoring

To keep the backend server active and responsive after deployment, we configured [UptimeRobot](https://uptimerobot.com):

- **Monitored URL**: `https://community-events-board.onrender.com/ping`
- **Monitor Type**: HTTP(s) keyword check
- **Interval**: Every 5 minutes

The `/ping` route returns a simple `"pong"` response, ensuring the server is alive.  
This prevents Render’s free-tier service from idling and enables reliable real-time updates via Socket.IO.

---

## 📊 Grading Criteria Covered

| Criteria                            | Status                                           |
| ----------------------------------- | ------------------------------------------------ |
| Code Quality & Architecture         | ✅ Fully modular TS code                         |
| Testing Strategy & Implementation   | ✅ Jest + Supertest tested                       |
| Functionality & User Experience     | ✅ Intuitive UI, filters, ratings, and much more |
| Documentation & Technical Decisions | ✅ This README + MD files                        |
| Deployment & DevOps                 | ✅ CI/CD, S3, Render, Amplify                    |

---

## 👨‍💼 Team

David Ramishvili  
 Nana Kvirkvelia  
 Anna Ubilava

---

Made with Love ❤️
