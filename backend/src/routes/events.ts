import { Router, RequestHandler } from "express";
import { Event } from "../models/event";
import { Category } from "../models/category";
import { User } from "../models/User";
import { upload } from "../config/upload"; // This now uses S3
import { auth } from "../middleware/auth";
import mongoose from "mongoose";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3";
import { io } from "../index";

const router = Router();

// Utility function to delete image file from S3
const deleteImageFile = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the key from the S3 URL
    // S3 URLs typically look like: https://bucket-name.s3.region.amazonaws.com/key
    // or https://s3.region.amazonaws.com/bucket-name/key
    let key: string;

    if (imageUrl.includes("amazonaws.com")) {
      // For S3 URLs, extract the key (filename)
      const urlParts = imageUrl.split("/");
      key = urlParts[urlParts.length - 1]; // Get the last part (filename)
    } else if (imageUrl.startsWith("/uploads/")) {
      // Handle legacy local URLs that might still exist in database
      key = imageUrl.replace("/uploads/", "");
    } else {
      // If it's already just a key/filename
      key = imageUrl;
    }

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    };

    await s3.send(new DeleteObjectCommand(deleteParams));
    console.log(`Successfully deleted image from S3: ${key}`);
  } catch (error) {
    console.error(`Error deleting image file from S3 (${imageUrl}):`, error);
    // Don't throw error - we want to continue with the operation even if file deletion fails
  }
};

// GET /events - Get all events with search, filtering, and sorting
router.get("/", (async (req, res) => {
  try {
    console.log("QUERY PARAMS:", req.query);
    const {
      search,
      categories, // comma-separated category IDs
      startDate,
      endDate,
      location,
      sortBy = "date",
      sortOrder = "asc",
      limit = 50,
      page = 1,
      date,
    } = req.query;

    let query = Event.find();

    // Search functionality - search across title, description, and location
    if (search && typeof search === "string") {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query = query.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
        ],
      });
    }

    // Category filtering
    if (categories && typeof categories === "string") {
      const categoryIds = categories
        .split(",")
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (categoryIds.length > 0) {
        query = query.find({
          categoryIds: {
            $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        });
      }
    }

    // Date range filtering
    // Exact date filtering (for calendar)
    if (date && typeof date === "string") {
      query = query.find({ date: date });
    }

    if (!date && (startDate || endDate)) {
      const dateQuery: any = {};
      if (startDate && typeof startDate === "string") {
        dateQuery.$gte = startDate;
      }
      if (endDate && typeof endDate === "string") {
        dateQuery.$lte = endDate;
      }
      if (Object.keys(dateQuery).length > 0) {
        query = query.find({ date: dateQuery });
      }
    }

    // Location filtering
    if (location && typeof location === "string") {
      query = query.find({
        location: { $regex: location.trim(), $options: "i" },
      });
    }

    // Sorting
    const sortOptions: any = {};
    const validSortFields = ["date", "title", "location"];
    const sortField = validSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : "date";

    if (sortField === "date") {
      // For date sorting, we need to handle it as a date
      sortOptions.date = sortOrder === "desc" ? -1 : 1;
    } else {
      // For text fields, use collation for proper alphabetical sorting
      sortOptions[sortField] = sortOrder === "desc" ? -1 : 1;
    }

    query = query.sort(sortOptions);

    // Add collation for case-insensitive sorting of text fields
    if (sortField !== "date") {
      query = query.collation({ locale: "en", strength: 2 });
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(
      1,
      Math.min(100, parseInt(limit as string) || 50)
    );
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination info
    const totalQuery = Event.find(query.getQuery());
    const total = await totalQuery.countDocuments();

    // Apply pagination and populate
    const events = await query
      .skip(skip)
      .limit(limitNum)
      .populate("categoryIds")
      .exec();

    const mappedEvents = events.map((event) => {
      const obj = event.toObject();
      return { ...obj, id: obj._id, _id: undefined };
    });

    // Return events with pagination info
    res.status(200).json({
      events: mappedEvents,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: events.length,
        totalEvents: total,
      },
      filters: {
        search: search || "",
        categories: categories || "",
        startDate: startDate || "",
        endDate: endDate || "",
        location: location || "",
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
}) as RequestHandler);

// GET /events/my - Get events created by the authenticated user
router.get("/my", auth, (async (req: any, res) => {
  try {
    const {
      search,
      categories,
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "asc",
      limit = 50,
      page = 1,
    } = req.query;

    let query = Event.find({ createdBy: req.user.userId });

    // Apply same filtering logic as main events route
    if (search && typeof search === "string") {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query = query.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
        ],
      });
    }

    if (categories && typeof categories === "string") {
      const categoryIds = categories
        .split(",")
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (categoryIds.length > 0) {
        query = query.find({
          categoryIds: {
            $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        });
      }
    }

    if (startDate || endDate) {
      const dateQuery: any = {};
      if (startDate && typeof startDate === "string") {
        dateQuery.$gte = startDate;
      }
      if (endDate && typeof endDate === "string") {
        dateQuery.$lte = endDate;
      }
      if (Object.keys(dateQuery).length > 0) {
        query = query.find({ date: dateQuery });
      }
    }

    // Sorting
    const sortOptions: any = {};
    const validSortFields = ["date", "title", "location"];
    const sortField = validSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : "date";

    if (sortField === "date") {
      sortOptions.date = sortOrder === "desc" ? -1 : 1;
    } else {
      sortOptions[sortField] = sortOrder === "desc" ? -1 : 1;
    }

    query = query.sort(sortOptions);

    if (sortField !== "date") {
      query = query.collation({ locale: "en", strength: 2 });
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(
      1,
      Math.min(100, parseInt(limit as string) || 50)
    );
    const skip = (pageNum - 1) * limitNum;

    const totalQuery = Event.find({ createdBy: req.user.userId });
    const total = await totalQuery.countDocuments();

    const events = await query
      .skip(skip)
      .limit(limitNum)
      .populate("categoryIds")
      .exec();

    res.status(200).json({
      events,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: events.length,
        totalEvents: total,
      },
      filters: {
        search: search || "",
        categories: categories || "",
        startDate: startDate || "",
        endDate: endDate || "",
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).json({ error: "Failed to fetch your events" });
  }
}) as RequestHandler);

// POST /events - Create a new event (authenticated)
router.post("/", auth, upload.single("image"), (async (req: any, res) => {
  try {
    const { title, date, location, description, categoryIds } = req.body;
    if (!title || !date || !location) {
      return res.status(400).json({
        error:
          "Missing required fields. Title, date, and location are required.",
      });
    }

    let parsedCategoryIds: mongoose.Types.ObjectId[] = [];
    if (categoryIds) {
      try {
        const arr = JSON.parse(categoryIds);
        if (!Array.isArray(arr)) {
          return res
            .status(400)
            .json({ error: "categoryIds must be an array" });
        }
        // Validate each category ID
        for (const id of arr) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
              .status(400)
              .json({ error: `Invalid category ID: ${id}` });
          }
        }
        parsedCategoryIds = arr.map((id) => new mongoose.Types.ObjectId(id));
      } catch (error) {
        return res.status(400).json({
          error:
            "Invalid categoryIds format. Must be a JSON array of valid MongoDB ObjectIds.",
        });
      }
    }

    // Fetch the user's name from the database
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const event = new Event({
      title: title.trim(),
      date,
      location: location.trim(),
      description: description ? description.trim() : undefined,
      categoryIds: parsedCategoryIds,
      // multer-s3 provides the full S3 URL in req.file.location
      imageUrl: req.file ? req.file.location : undefined,
      createdBy: req.user.userId,
      createdByName: user.name,
    });

    await event.save();
    const populated = await event.populate("categoryIds");
    io.emit("eventCreated", populated); // Emit real-time event to all connected clients
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
}) as RequestHandler);

// PUT /events/:id - Update an existing event (authenticated, only by creator)
router.put("/:id", auth, upload.single("image"), (async (req: any, res) => {
  try {
    const { id } = req.params;
    const { title, date, location, description, categoryIds, removeImage } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if the user is the creator of the event or an admin
    if (
      event.createdBy &&
      event.createdBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "You can only edit events that you created" });
    }

    let parsedCategoryIds: mongoose.Types.ObjectId[] = [];
    if (categoryIds) {
      try {
        const arr = JSON.parse(categoryIds);
        if (!Array.isArray(arr)) {
          return res
            .status(400)
            .json({ error: "categoryIds must be an array" });
        }
        // Validate each category ID
        for (const id of arr) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
              .status(400)
              .json({ error: `Invalid category ID: ${id}` });
          }
        }
        parsedCategoryIds = arr.map((id) => new mongoose.Types.ObjectId(id));
      } catch (error) {
        return res.status(400).json({
          error:
            "Invalid categoryIds format. Must be a JSON array of valid MongoDB ObjectIds.",
        });
      }
    }

    // Handle image operations
    const shouldRemoveImage = removeImage === "true" || removeImage === true;

    // If a new image is uploaded or we want to remove the current image, delete the old one from S3
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
      // multer-s3 provides the full S3 URL in req.file.location
      event.imageUrl = req.file.location;
    } else if (shouldRemoveImage) {
      event.imageUrl = undefined;
    }
    // If neither new image nor remove image, keep the existing imageUrl

    await event.save();
    const populated = await event.populate("categoryIds");
    io.emit("eventUpdated", populated);
    res.status(200).json(populated);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
}) as RequestHandler);

// DELETE /events/:id - Delete an event (authenticated, only by creator)
router.delete("/:id", auth, (async (req: any, res) => {
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

    // Check if the user is the creator of the event or an admin
    if (
      event.createdBy &&
      event.createdBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "You can only delete events that you created" });
    }

    // Delete the image file from S3 if it exists
    if (event.imageUrl) {
      await deleteImageFile(event.imageUrl);
    }

    // Delete the event from the database
    await Event.findByIdAndDelete(id);
    io.emit("eventDeleted", { id });
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
}) as RequestHandler);

export default router;
