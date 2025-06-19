import { Router, RequestHandler } from "express";
import { Category } from "../models/category";
import { User } from "../models/User";
import { auth } from "../middleware/auth";

const router = Router();

// GET /categories - Get all categories
router.get("/", (async (_req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}) as RequestHandler);

// POST /categories - Create a new category (authenticated)
router.post("/", auth, (async (req: any, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Missing required field. Name is required." });
    }

    // Fetch the user's name from the database
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const category = new Category({ 
      name: name.trim(), 
      description: description ? description.trim() : undefined,
      createdBy: req.user.userId,
      createdByName: user.name
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
}) as RequestHandler);

// PUT /categories/:id - Update a category (authenticated, only by creator)
router.put("/:id", auth, (async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if the user is the creator of the category or an admin
    if (category.createdBy && category.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: "You can only edit categories that you created" });
    }

    category.name = name;
    category.description = description;
    await category.save();
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to update category" });
  }
}) as RequestHandler);

// DELETE /categories/:id - Delete a category (authenticated, only by creator)
router.delete("/:id", auth, (async (req: any, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if the user is the creator of the category or an admin
    if (category.createdBy && category.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: "You can only delete categories that you created" });
    }

    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
}) as RequestHandler);

export default router; 