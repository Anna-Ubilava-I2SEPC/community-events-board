import express from "express";
import cors from "cors";
import path from "path";
import eventsRouter from "./routes/events";
import usersRouter from "./routes/users";
import categoriesRouter from "./routes/categories";
import commentsRouter from "./routes/comments";
import ratingsRouter from "./routes/ratings";
import { connectDB } from "./config/database";

const app = express();
const PORT = Number(process.env.PORT) || "4000";

// Connect to MongoDB
connectDB().catch(console.error);

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:5173", // Local development
    `http://${process.env.EC2_PUBLIC_IP || "51.21.199.217"}:5173`, // EC2 frontend
  ],
  credentials: true, // Allow cookies if needed
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json()); // Middleware to parse JSON

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/events", eventsRouter); // Mount the events route
app.use("/users", usersRouter); // Mount the users route
app.use("/categories", categoriesRouter); // Mount the categories route
app.use("/comments", commentsRouter);
app.use("/ratings", ratingsRouter);

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.listen(4000, "0.0.0.0", () => {
  console.log(`Server running at http://51.21.199.217:4000`);
});
