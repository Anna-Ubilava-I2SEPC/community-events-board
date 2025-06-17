import express, { Request, Response } from "express";
import Comment from "../models/Comment";
import { auth } from "../middleware/auth";

const router = express.Router();

// GET /comments/:eventId
// Fetch all comments for a specific event
router.get("/:eventId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const comments = await Comment.find({ eventId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// POST /comments
// Submit a new comment (authenticated)
router.post("/", auth, async (req: any, res: Response): Promise<void> => {
  try {
    const { eventId, content } = req.body;

    if (!eventId || !content) {
      res.status(400).json({ message: "eventId and content are required" });
      return;
    }

    const newComment = new Comment({
      eventId,
      content,
      userId: req.user.userId,
      userName: req.user.userId, // Replace with actual user name if available
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Failed to submit comment" });
  }
});

// PUT /comments/:id
// Edit existing comment (only by author)
router.put("/:id", auth, async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    if (comment.userId.toString() !== req.user.userId) {
      res.status(403).json({ message: "Unauthorized to edit this comment" });
      return;
    }

    comment.content = content;
    comment.updatedAt = new Date();
    await comment.save();

    res.json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Failed to update comment" });
  }
});

// DELETE /comments/:id
// Delete a comment (only by author)
router.delete("/:id", auth, async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    if (comment.userId.toString() !== req.user.userId) {
      res.status(403).json({ message: "Unauthorized to delete this comment" });
      return;
    }

    await comment.deleteOne();
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

export default router;
