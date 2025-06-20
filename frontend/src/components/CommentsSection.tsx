import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface Comment {
  _id: string;
  content: string;
  userName: string;
  userId: string;
  createdAt: string;
}

interface Props {
  eventId: string;
}

const CommentsSection: React.FC<Props> = ({ eventId }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const { user, isAuthenticated } = useAuth();

  const getUserId = (): string | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId;
    } catch {
      return null;
    }
  };

  // Check if user can edit/delete a comment (owner or admin)
  const canEditOrDeleteComment = (comment: Comment): boolean => {
    return !!(
      isAuthenticated &&
      user &&
      (comment.userId === user._id || user.role === "admin")
    );
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`${apiUrl}/comments/${eventId}`);
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ eventId, content: newComment }),
      });

      if (res.ok) {
        const newEntry = await res.json();
        setComments((prev) => [newEntry, ...prev]);
        setNewComment("");
      } else {
        const err = await res.text();
        console.error("Failed to submit comment:", err);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }

    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`${apiUrl}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 204) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      } else {
        const error = await res.text();
        console.error("Failed to delete comment:", error);
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleEdit = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditedContent(content);
  };

  const handleSaveEdit = async (commentId: string) => {
    try {
      const res = await fetch(`${apiUrl}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content: editedContent }),
      });

      if (res.ok) {
        const updated = await res.json();
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? updated : c))
        );
        setEditingCommentId(null);
        setEditedContent("");
      } else {
        const error = await res.text();
        console.error("Failed to update comment:", error);
      }
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent("");
  };

  useEffect(() => {
    fetchComments();
  }, [eventId]);

  const isDark = document.body.classList.contains("dark");

  return (
    <div className="comments-section" style={{ marginTop: "2rem" }}>
      <h4 style={{ marginBottom: "0.75rem" }}>Comments</h4>

      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Write your comment..."
        style={{
          width: "100%",
          minHeight: "100px",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          fontSize: "1rem",
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={submitComment}
        disabled={loading}
        style={{
          marginTop: "0.75rem",
          padding: "8px 16px",
          borderRadius: "6px",
          backgroundColor: isDark ? "#555" : "#1a202c",
          color: "#fff",
          fontWeight: "bold",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Posting..." : "Post"}
      </button>

      <ul style={{ marginTop: "1rem", paddingLeft: "0" }}>
        {comments.map((c) => (
          <li
            key={c._id}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "1rem",
              backgroundColor: isDark ? "#333" : "#fff",
            }}
          >
            <div>
              <strong>{c.userName}</strong>
              <span
                style={{
                  color: "#999",
                  fontSize: "0.875rem",
                  marginLeft: "8px",
                }}
              >
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>

            {editingCommentId === c._id ? (
              <div style={{ marginTop: "8px" }}>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    padding: "8px",
                    fontSize: "0.95rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
                <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
                  <button onClick={() => handleSaveEdit(c._id)}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{ marginTop: "8px", whiteSpace: "pre-wrap" }}>
                {c.content}
              </p>
            )}

            {canEditOrDeleteComment(c) && editingCommentId !== c._id && (
              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button
                  onClick={() => handleEdit(c._id, c.content)}
                  style={{
                    background: "#f0f0f0",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "4px 10px",
                    cursor: "pointer",
                    color: "#333",
                    fontSize: "0.875rem",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
                  style={{
                    background: "#fef1f1",
                    border: "1px solid #e65d5d",
                    borderRadius: "4px",
                    padding: "4px 10px",
                    cursor: "pointer",
                    color: "#e65d5d",
                    fontSize: "0.875rem",
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentsSection;
