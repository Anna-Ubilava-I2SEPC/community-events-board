# 🔧 Technical Decisions - Community Events Board

This document outlines the key technical decisions made during the development of the Community Events Board application.

---

## 🎓 Project Structure

* We separated the application into two distinct folders: `/frontend` and `/backend`, enabling independent development, testing, and deployment.
* The backend follows a modular structure with `routes/`, `models/`, `middleware/`, and `config/` directories to improve scalability and clarity.

---

## 🔧 Tech Stack Justification

* **Frontend**: React + TypeScript

  * Chosen for modern component-based architecture and type safety.
  * Vite was used for fast builds and hot reload during development.

* **Backend**: Node.js + Express + TypeScript

  * Fast and flexible server with type enforcement.
  * Mongoose used for interacting with MongoDB due to its schema modeling features.

* **Database**: MongoDB Atlas

  * Chosen for its document-oriented structure and ease of cloud integration.

---

## 🔐 Authentication Strategy

* JWT-based authentication allows stateless access control.
* Role-based access (`user`, `admin`) supports future scalability like admin moderation.
* Passwords are hashed using bcrypt and validated on login.

---

## 📸 Image Storage via S3

* Instead of storing images locally, we chose **Amazon S3** for:

  * Scalability (no need to serve static files manually)
  * Direct public URLs for easy frontend integration
  * Better alignment with cloud-first architecture
* Used `multer-s3` to handle direct uploads from the backend.

---

## ✨ Real-time Functionality with Socket.IO

* Implemented Socket.IO on both backend and frontend for live updates without refresh.
* Events like `eventCreated`, `eventUpdated`, and `eventDeleted` are emitted by the server and handled by clients.
* Enables real-time collaboration and instant updates across sessions.

---

## 📅 Calendar and Ratings Features

* Integrated `react-calendar` to allow visual browsing of upcoming events.
* Implemented a star rating system with average ratings and vote counts.
* Ratings are stored per user to prevent duplicates.

---

## 🏠 Hosting & Deployment

* **Frontend**: Deployed on **AWS Amplify** using `amplify.yml` for CI/CD automation.
* **Backend**: Deployed on **Render** with auto-build from Git.
* `.env` files used locally and stored securely in platform dashboards.

---

## ✅ Testing Strategy

* Backend routes are tested using **Jest** and **Supertest**.
* Image upload testing includes `test-image.jpg` and mock form submissions.
* Frontend testing is minimal due to time constraints, but set up with `react-testing-library`.

---

## 📄 Environment Configuration

* Created `.env.example` templates for both frontend and backend to help with reproducibility.
* Tests use `.env.test.js` for isolated AWS and DB credentials.

---

## 📊 Performance & Optimization

* Images are served directly from S3 CDN for minimal frontend load.
* Socket updates avoid full page refreshes, improving UX.
* Build scripts exclude test-related dependencies during production deployment.

---

These decisions contributed to a secure, maintainable, and cloud-ready full-stack application ready for future growth.
