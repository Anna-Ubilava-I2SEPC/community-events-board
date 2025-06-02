import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { events, Event } from "../models/event";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json(events);
});

// POST /events - Create a new event
router.post("/", (req, res) => {
  try {
    const { title, date, location, description } = req.body;

    // Basic validation - check required fields
    if (!title || !date || !location) {
      return res.status(400).json({
        error: "Missing required fields. Title, date, and location are required."
      });
    }

    // Validate that title and location are strings and not empty
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        error: "Title must be a non-empty string."
      });
    }

    if (typeof location !== "string" || location.trim() === "") {
      return res.status(400).json({
        error: "Location must be a non-empty string."
      });
    }

    // Validate date format and that it's in the future
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        error: "Invalid date format. Please provide a valid date."
      });
    }

    const now = new Date();
    if (eventDate < now) {
      return res.status(400).json({
        error: "Event date must be in the future."
      });
    }

    // Validate description if provided
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        error: "Description must be a string."
      });
    }

    // Create new event with generated UUID
    const newEvent: Event = {
      id: uuidv4(),
      title: title.trim(),
      date: eventDate.toISOString(),
      location: location.trim(),
      description: description ? description.trim() : undefined
    };

    // Push to memory (events array)
    events.push(newEvent);

    // Return the created event
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      error: "Internal server error while creating event."
    });
  }
});

export default router;
