import express, { Request, Response } from "express";
import Rating from "../models/Rating";
import { auth } from "../middleware/auth";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// GET /ratings/:eventId – returns average + current user's rating
router.get(
  "/:eventId",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { eventId } = req.params;
    const userId = req.user?.userId;

    try {
      const ratings = await Rating.find({ eventId });

      const average =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
          : 0;

      const userRating =
        ratings.find((r) => r.userId === userId)?.value ?? null;

      res.json({
        averageRating: average,
        userRating,
        totalVotes: ratings.length,
      });
    } catch (err) {
      console.error("Error fetching ratings:", err);
      res.status(500).json({ message: "Failed to load ratings" });
    }
  }
);

// POST /ratings – user submits/updates their rating
router.post(
  "/",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { eventId, value } = req.body;
    const userId = req.user?.userId;

    if (!eventId || !value || value < 1 || value > 5) {
      res.status(400).json({ message: "Invalid rating data" });
      return;
    }

    try {
      const existing = await Rating.findOne({ eventId, userId });

      if (existing) {
        existing.value = value;
        await existing.save();
        res.json({ message: "Rating updated", rating: existing });
        return;
      }

      const newRating = new Rating({ eventId, userId, value });
      await newRating.save();
      res.status(201).json({ message: "Rating submitted", rating: newRating });
    } catch (err) {
      console.error("Error saving rating:", err);
      res.status(500).json({ message: "Failed to save rating" });
    }
  }
);

export default router;
