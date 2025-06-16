import express from "express";
import cors from "cors";
import path from "path";
import eventsRouter from "./routes/events";
import usersRouter from "./routes/users";
import categoriesRouter from "./routes/categories";
import { connectDB } from "./config/database";

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB().catch(console.error);

// Enable CORS for frontend communication
app.use(cors());

app.use(express.json()); // Middleware to parse JSON

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/events", eventsRouter); // Mount the events route
app.use("/users", usersRouter); // Mount the users route
app.use("/categories", categoriesRouter); // Mount the categories route

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
