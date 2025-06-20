import React, { useState } from "react";
import type { Category } from "../types/Category";
import CategoryForm from "./CategoryForm";
import { useAuth } from "../contexts/AuthContext";
const apiUrl = import.meta.env.VITE_API_URL;

interface CategoryListProps {
  categories: Category[];
  onCategoryUpdated?: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onCategoryUpdated,
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Check if current user is the creator of a category or an admin
  const isCreator = (category: Category) => {
    return isAuthenticated && user && category.createdBy === user._id;
  };

  const isAdmin = isAuthenticated && user && user.role === "admin";

  const canEditOrDelete = (category: Category) => {
    return isCreator(category) || isAdmin;
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
  };

  const handleEditCancel = () => {
    setEditingCategory(null);
  };

  const handleEditSubmit = async (updatedCategory: Category) => {
    try {
      const response = await fetch(
        `${apiUrl}/categories/${updatedCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedCategory),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      setEditingCategory(null);
      if (onCategoryUpdated) {
        onCategoryUpdated();
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert("There was a problem updating the category.");
    }
  };

  const handleDeleteClick = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      if (onCategoryUpdated) {
        onCategoryUpdated();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("There was a problem deleting the category.");
    }
  };

  return (
    <div className="category-list">
      <h2>Categories</h2>
      {categories.length === 0 ? (
        <div className="no-categories">
          <p>No categories found. Add one to get started!</p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              {editingCategory?.id === category.id ? (
                <CategoryForm
                  initialCategory={category}
                  onSubmit={handleEditSubmit}
                  onCancel={handleEditCancel}
                  isEditing={true}
                />
              ) : (
                <>
                  <h3>{category.name}</h3>
                  {category.description && (
                    <p className="category-description">
                      {category.description}
                    </p>
                  )}
                  {category.createdByName && (
                    <p className="category-creator">
                      <strong>👤 Created by:</strong> {category.createdByName}
                    </p>
                  )}
                  {canEditOrDelete(category) && (
                    <div className="category-actions">
                      <button
                        className="edit-button"
                        onClick={() => handleEditClick(category)}
                      >
                        Edit Category
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteClick(category.id)}
                      >
                        Delete Category
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
