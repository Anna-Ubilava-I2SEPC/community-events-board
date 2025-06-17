import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // automatically manages createdAt and updatedAt
  }
);

export default mongoose.model<IComment>("Comment", CommentSchema);
