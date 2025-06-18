import React from "react";

interface StarRatingProps {
  rating: number; // current rating (1–5)
  onRate?: (value: number) => void; // optional callback when clicked
  size?: number; // pixel size
  readOnly?: boolean; // disable click if true
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRate,
  size = 24,
  readOnly = false,
}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => !readOnly && onRate?.(star)}
          style={{
            cursor: readOnly ? "default" : "pointer",
            fontSize: `${size}px`,
            color: star <= rating ? "#fbbf24" : "#d1d5db",
            transition: "color 0.2s",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
