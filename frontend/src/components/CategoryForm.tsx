import React, { useState } from "react";
import type { Category } from "../types/Category";

interface CategoryFormProps {
  onCategoryAdded?: () => void;
  initialCategory?: Category;
  onSubmit?: (category: Category) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  onCategoryAdded,
  initialCategory,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const [name, setName] = useState(initialCategory?.name || "");
  const [description, setDescription] = useState(initialCategory?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const clearForm = () => {
    setName("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic required field check
    if (!name.trim()) {
      alert("Please enter a category name.");
      return;
    }

    const categoryData = {
      ...(initialCategory || {}),
      name,
      description
    };

    try {
      setIsSubmitting(true);

      if (isEditing && onSubmit) {
        // Handle edit submission
        await onSubmit(categoryData as Category);
      } else {
        // Handle new category creation
        const response = await fetch("http://localhost:4000/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
          throw new Error("Failed to submit category");
        }

        // Show success state
        setSubmitSuccess(true);
        
        // Clear form on successful submission
        clearForm();
        
        // Notify parent component that a category was added
        if (onCategoryAdded) {
          onCategoryAdded();
        }

        // Reset success state after 2 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting category:", error);
      alert("There was a problem submitting your category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <h2>{isEditing ? "Edit Category" : "Add New Category"}</h2>

      <label>
        Name*:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <div className="buttons">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={submitSuccess ? "success" : ""}
        >
          {isSubmitting ? "Submitting..." : submitSuccess ? "✓ Success!" : isEditing ? "Update Category" : "Submit Category"}
        </button>
        {isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={clearForm}
            disabled={isSubmitting}
          >
            Clear Form
          </button>
        )}
      </div>
    </form>
  );
};

export default CategoryForm; 