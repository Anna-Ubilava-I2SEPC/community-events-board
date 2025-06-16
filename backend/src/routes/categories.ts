import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { categories, Category } from "../models/category";

const router = Router();

// GET /categories - Get all categories
router.get("/", (_req, res) => {
  res.status(200).json(categories);
});

// POST /categories - Create a new category
router.post("/", (req, res) => {
  try {
    const { name, description } = req.body;

    // Basic validation - check required fields
    if (!name) {
      return res.status(400).json({
        error: "Missing required field. Name is required."
      });
    }

    // Validate that name is a string and not empty
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        error: "Name must be a non-empty string."
      });
    }

    // Validate description if provided
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        error: "Description must be a string."
      });
    }

    // Create new category with generated UUID
    const newCategory: Category = {
      id: uuidv4(),
      name: name.trim(),
      description: description ? description.trim() : undefined
    };

    // Push to memory (categories array)
    categories.push(newCategory);

    // Return the created category
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      error: "Internal server error while creating category."
    });
  }
});

// PUT /categories/:id - Update a category
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Find the category
    const categoryIndex = categories.findIndex(category => category.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({
        error: "Category not found"
      });
    }

    // Basic validation - check required fields
    if (!name) {
      return res.status(400).json({
        error: "Missing required field. Name is required."
      });
    }

    // Validate that name is a string and not empty
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        error: "Name must be a non-empty string."
      });
    }

    // Validate description if provided
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        error: "Description must be a string."
      });
    }

    // Update the category
    const updatedCategory: Category = {
      ...categories[categoryIndex],
      name: name.trim(),
      description: description ? description.trim() : undefined
    };

    categories[categoryIndex] = updatedCategory;

    // Return the updated category
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      error: "Internal server error while updating category."
    });
  }
});

// DELETE /categories/:id - Delete a category
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;

    // Find the category
    const categoryIndex = categories.findIndex(category => category.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({
        error: "Category not found"
      });
    }

    // Remove the category
    categories.splice(categoryIndex, 1);

    // Return success response
    res.status(200).json({
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      error: "Internal server error while deleting category."
    });
  }
});

export default router; 