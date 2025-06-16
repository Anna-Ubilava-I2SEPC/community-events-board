// src/components/EventForm.tsx
import React, { useState, useEffect } from "react";
import type { Event } from "../types/Event";
import type { Category } from "../types/Category";

interface EventFormProps {
  onEventAdded?: () => void;
  initialEvent?: Event;
  onSubmit?: (event: Event) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ 
  onEventAdded, 
  initialEvent, 
  onSubmit, 
  onCancel,
  isEditing = false 
}) => {
  const [title, setTitle] = useState(initialEvent?.title || "");
  const [date, setDate] = useState(initialEvent?.date ? new Date(initialEvent.date).toISOString().split('T')[0] : "");
  const [location, setLocation] = useState(initialEvent?.location || "");
  const [description, setDescription] = useState(initialEvent?.description || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialEvent?.categoryIds ? initialEvent.categoryIds.map(cat => {
      if (typeof cat === 'string') return cat;
      return cat.id || cat._id || '';
    }).filter(Boolean) : []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    // Fetch categories when component mounts
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch("http://localhost:4000/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData = await response.json();
        setCategories(categoriesData);
        // Sync selectedCategories to only valid IDs
        setSelectedCategories(prev => prev.filter(id => categoriesData.some((cat: Category) => String(cat.id) === id)));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const clearForm = () => {
    setTitle("");
    setDate("");
    setLocation("");
    setDescription("");
    setSelectedCategories([]);
    setImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic required field check
    if (!title.trim() || !date || !location.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    // Optional: validate ISO format & future date
    const inputDate = new Date(date);
    const now = new Date();

    if (isNaN(inputDate.getTime())) {
      alert("Please enter a valid date.");
      return;
    }

    if (inputDate < now) {
      alert("Date must be in the future.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("date", date);
    formData.append("location", location);
    formData.append("description", description);
    // Ensure categoryIds is properly formatted
    if (selectedCategories.length > 0) {
      formData.append("categoryIds", JSON.stringify(selectedCategories));
    }
    if (image) {
      formData.append("image", image);
    }

    try {
      setIsSubmitting(true);

      if (isEditing && onSubmit) {
        // Handle edit submission
        const updatedEvent = {
          ...(initialEvent || {}),
          title,
          date,
          location,
          description,
          categoryIds: selectedCategories
        } as Event;
        await onSubmit(updatedEvent);
      } else {
        // Handle new event creation
        const response = await fetch("http://localhost:4000/events", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to submit event");
        }

        // Show success state
        setSubmitSuccess(true);
        clearForm();
        if (onEventAdded) {
          onEventAdded();
        }
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting event:", error);
      alert(error instanceof Error ? error.message : "There was a problem submitting your event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => {
      const normalizedId = categoryId.toString();
      if (prev.includes(normalizedId)) {
        return prev.filter(id => id !== normalizedId);
      } else {
        return [...prev, normalizedId];
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEditing ? "Edit Event" : "Add New Event"}</h2>

      <label>
        Title*:
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>

      <label>
        Date*:
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <label>
        Location*:
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
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

      <label>
        Categories:
        {categoriesLoading ? (
          <div>Loading categories...</div>
        ) : (
          <div className="category-checkboxes">
            {categories.map(category => {
              const catId = String(category.id || category._id);
              const checkboxId = `category-checkbox-${catId}`;
              return (
                <label key={catId} className="category-checkbox" htmlFor={checkboxId}>
                  <input
                    id={checkboxId}
                    name={checkboxId}
                    type="checkbox"
                    checked={selectedCategories.includes(catId)}
                    onChange={() => handleCategoryChange(catId)}
                  />
                  <span style={{ margin: 0, fontWeight: 600 }}>{category.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </label>

      <label>
        Image:
        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
        />
      </label>

      <div className="buttons">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={submitSuccess ? "success" : ""}
        >
          {isSubmitting ? "Submitting..." : submitSuccess ? "✓ Success!" : isEditing ? "Update Event" : "Submit Event"}
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

export default EventForm;
