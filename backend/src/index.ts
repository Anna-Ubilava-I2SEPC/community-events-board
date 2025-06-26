import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import eventsRouter from "./routes/events";
import usersRouter from "./routes/users";
import categoriesRouter from "./routes/categories";
import commentsRouter from "./routes/comments";
import ratingsRouter from "./routes/ratings";
import { connectDB } from "./config/database";

const app = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: "https://main.d1r03isbgzcqje.amplifyapp.com",
    methods: ["GET", "POST", "PUT"],
  },
});

export { io };

// Connect to MongoDB
connectDB().catch(console.error);

// Enable CORS for frontend communication
app.use(
  cors({
    origin: "https://main.d1r03isbgzcqje.amplifyapp.com",
    credentials: true,
  })
);

app.use(express.json()); // Middleware to parse JSON

app.use("/events", eventsRouter); // Mount the events route
app.use("/users", usersRouter); // Mount the users route
app.use("/categories", categoriesRouter); // Mount the categories route
app.use("/comments", commentsRouter);
app.use("/ratings", ratingsRouter);

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`
  <!DOCTYPE html>
  <html>
    <head><title>Community Events Board API</title></head>
    <body style="font-family: sans-serif; text-align: center; padding: 2rem;">
      <h1>🎉 Community Events Board API</h1>
      <p>This is the backend server.</p>
      <p>API: <a href="/events">/events</a></p>
      <p>Frontend: <a href="https://main.d1r03isbgzcqje.amplifyapp.com" target="_blank">Website</a></p>
    </body>
  </html>
`);
});

// Only start server if not being imported for tests
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  io.on("connection", (socket) => {
    console.log("🔌 User connected");

    socket.on("disconnect", () => {
      console.log("❌ User disconnected");
    });
  });
}

export default app;
