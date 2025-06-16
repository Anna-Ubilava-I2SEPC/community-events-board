import { Router, RequestHandler } from "express";
import { Event } from "../models/event";
import { Category } from "../models/category";
import { upload } from "../config/upload";
import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';

const router = Router();

// Utility function to delete image file
const deleteImageFile = async (imageUrl: string): Promise<void> => {
  // Only delete if the imageUrl is a local file (starts with /uploads/)
  if (imageUrl && imageUrl.startsWith('/uploads/')) {
    const filename = path.basename(imageUrl);
    const imagePath = path.join(process.cwd(), 'uploads', filename);
    try {
      // Check if file exists before trying to delete it
      await fs.promises.access(imagePath);
      await fs.promises.unlink(imagePath);
      console.log(`Successfully deleted image: ${filename}`);
    } catch (error) {
      console.error(`Error deleting image file (${filename}):`, error);
      // Don't throw error - we want to continue with the operation even if file deletion fails
    }
  }
};

// GET /events - Get all events (populate categories)
router.get("/", (async (_req, res) => {
  try {
    const events = await Event.find().populate("categoryIds");
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
}) as RequestHandler);

// POST /events - Create a new event
router.post("/", upload.single('image'), (async (req, res) => {
  try {
    const { title, date, location, description, categoryIds } = req.body;
    if (!title || !date || !location) {
      return res.status(400).json({ error: "Missing required fields. Title, date, and location are required." });
    }

    let parsedCategoryIds: mongoose.Types.ObjectId[] = [];
    if (categoryIds) {
      try {
        const arr = JSON.parse(categoryIds);
        if (!Array.isArray(arr)) {
          return res.status(400).json({ error: "categoryIds must be an array" });
        }
        // Validate each category ID
        for (const id of arr) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: `Invalid category ID: ${id}` });
          }
        }
        parsedCategoryIds = arr.map(id => new mongoose.Types.ObjectId(id));
      } catch (error) {
        return res.status(400).json({ error: "Invalid categoryIds format. Must be a JSON array of valid MongoDB ObjectIds." });
      }
    }

    const event = new Event({
      title: title.trim(),
      date,
      location: location.trim(),
      description: description ? description.trim() : undefined,
      categoryIds: parsedCategoryIds,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    await event.save();
    const populated = await event.populate("categoryIds");
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
}) as RequestHandler);

// PUT /events/:id - Update an existing event
router.put("/:id", upload.single('image'), (async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, location, description, categoryIds, removeImage } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    let parsedCategoryIds: mongoose.Types.ObjectId[] = [];
    if (categoryIds) {
      try {
        const arr = JSON.parse(categoryIds);
        if (!Array.isArray(arr)) {
          return res.status(400).json({ error: "categoryIds must be an array" });
        }
        // Validate each category ID
        for (const id of arr) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: `Invalid category ID: ${id}` });
          }
        }
        parsedCategoryIds = arr.map(id => new mongoose.Types.ObjectId(id));
      } catch (error) {
        return res.status(400).json({ error: "Invalid categoryIds format. Must be a JSON array of valid MongoDB ObjectIds." });
      }
    }

    // Handle image operations
    const shouldRemoveImage = removeImage === 'true' || removeImage === true;
    
    // If a new image is uploaded or we want to remove the current image, delete the old one
    if ((req.file || shouldRemoveImage) && event.imageUrl) {
      await deleteImageFile(event.imageUrl);
    }

    event.title = title.trim();
    event.date = date;
    event.location = location.trim();
    event.description = description ? description.trim() : undefined;
    event.categoryIds = parsedCategoryIds;
    
    // Update image URL based on the operation
    if (req.file) {
      event.imageUrl = `/uploads/${req.file.filename}`;
    } else if (shouldRemoveImage) {
      event.imageUrl = undefined;
    }
    // If neither new image nor remove image, keep the existing imageUrl

    await event.save();
    const populated = await event.populate("categoryIds");
    res.status(200).json(populated);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
}) as RequestHandler);

// DELETE /events/:id - Delete an event
router.delete("/:id", (async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    
    // Find the event first to get the image URL
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Delete the image file if it exists
    if (event.imageUrl) {
      await deleteImageFile(event.imageUrl);
    }

    // Delete the event from the database
    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
}) as RequestHandler);

export default router;
