import express from "express";
import cors from "cors";
import eventsRouter from "./routes/events";
import usersRouter from "./routes/users";
import { connectDB } from "./config/database";

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB().catch(console.error);

// Enable CORS for frontend communication
app.use(cors());

app.use(express.json()); // Middleware to parse JSON
app.use("/events", eventsRouter); // Mount the events route
app.use("/users", usersRouter); // Mount the users route

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
