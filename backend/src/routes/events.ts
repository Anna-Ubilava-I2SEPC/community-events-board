import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { events, Event } from "../models/event";
import { upload } from "../config/upload";

const router = Router();

// GET /events - Get all events
router.get("/", (_req, res) => {
  res.status(200).json(events);
});

// POST /events - Create a new event
router.post("/", upload.single('image'), (req, res) => {
  try {
    const { title, date, location, description, categoryIds } = req.body;

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

    // Parse categoryIds if provided
    let parsedCategoryIds: string[] = [];
    if (categoryIds) {
      try {
        parsedCategoryIds = JSON.parse(categoryIds);
        if (!Array.isArray(parsedCategoryIds)) {
          throw new Error("categoryIds must be an array");
        }
      } catch (error) {
        return res.status(400).json({
          error: "Invalid categoryIds format. Must be a JSON array of strings."
        });
      }
    }

    // Create new event with generated UUID
    const newEvent: Event = {
      id: uuidv4(),
      title: title.trim(),
      date: eventDate.toISOString(),
      location: location.trim(),
      description: description ? description.trim() : undefined,
      categoryIds: parsedCategoryIds,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined
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

// PUT /events/:id - Update an existing event
router.put("/:id", upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, location, description, categoryIds } = req.body;

    // Find the event
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      return res.status(404).json({
        error: "Event not found"
      });
    }

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

    // Parse categoryIds if provided
    let parsedCategoryIds: string[] = [];
    if (categoryIds) {
      try {
        parsedCategoryIds = JSON.parse(categoryIds);
        if (!Array.isArray(parsedCategoryIds)) {
          throw new Error("categoryIds must be an array");
        }
      } catch (error) {
        return res.status(400).json({
          error: "Invalid categoryIds format. Must be a JSON array of strings."
        });
      }
    }

    // Update the event
    const updatedEvent: Event = {
      ...events[eventIndex],
      title: title.trim(),
      date: eventDate.toISOString(),
      location: location.trim(),
      description: description ? description.trim() : undefined,
      categoryIds: parsedCategoryIds,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : events[eventIndex].imageUrl
    };

    events[eventIndex] = updatedEvent;

    // Return the updated event
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      error: "Internal server error while updating event."
    });
  }
});

// DELETE /events/:id - Delete an event
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;

    // Find the event
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      return res.status(404).json({
        error: "Event not found"
      });
    }

    // Remove the event
    events.splice(eventIndex, 1);

    // Return success response
    res.status(200).json({
      message: "Event deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      error: "Internal server error while deleting event."
    });
  }
});

export default router;
