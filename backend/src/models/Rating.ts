import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: { type: String, required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

ratingSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);
