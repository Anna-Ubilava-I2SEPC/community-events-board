import express from "express";
import cors from "cors";
import eventsRouter from "./routes/events";

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for frontend communication
app.use(cors());

app.use(express.json()); // Middleware to parse JSON
app.use("/events", eventsRouter); // Mount the events route

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
