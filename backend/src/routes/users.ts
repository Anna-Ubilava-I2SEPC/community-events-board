import express, { Request, Response } from "express";
import { register, login } from "../controllers/userController";
import { auth } from "../middleware/auth";
import { User } from "../models/User";
import bcrypt from "bcryptjs";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// Public routes
router.post("/register", register);
router.post("/login", login);

// GET /users/profile - Get current user's profile
router.get(
  "/profile",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user?.userId).select("-password");
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// PUT /users/profile - Update user profile (name and basic info)
router.put(
  "/profile",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ message: "Name is required" });
        return;
      }

      const user = await User.findById(req.user?.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      user.name = name.trim();
      await user.save();

      // Return user without password
      const updatedUser = await User.findById(user._id).select("-password");
      res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// PUT /users/change-email - Change user email
router.put(
  "/change-email",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { newEmail, currentPassword } = req.body;

      if (!newEmail || !currentPassword) {
        res
          .status(400)
          .json({ message: "New email and current password are required" });
        return;
      }

      const user = await User.findById(req.user?.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        res.status(400).json({ message: "Current password is incorrect" });
        return;
      }

      // temporarily commented because it had some error
      // // Check if new email is already taken
      // const existingUser = await User.findOne({ email: newEmail.toLowerCase().trim() });
      // if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      //   res.status(400).json({ message: 'Email is already in use' });
      //   return;
      // }

      user.email = newEmail.toLowerCase().trim();
      await user.save();

      const updatedUser = await User.findById(user._id).select("-password");
      res.json({ message: "Email updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error changing email:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// PUT /users/change-password - Change user password
router.put(
  "/change-password",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res
          .status(400)
          .json({ message: "Current password and new password are required" });
        return;
      }

      if (newPassword.length < 6) {
        res
          .status(400)
          .json({ message: "New password must be at least 6 characters long" });
        return;
      }

      const user = await User.findById(req.user?.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        res.status(400).json({ message: "Current password is incorrect" });
        return;
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedNewPassword;
      await user.save();

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
