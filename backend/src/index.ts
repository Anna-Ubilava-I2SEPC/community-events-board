import express from "express";
import eventsRouter from "./routes/events";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json()); // Middleware to parse JSON
app.use("/events", eventsRouter); // Mount the events route

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
