import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEvent extends Document {
  title: string;
  date: string;
  location: string;
  description?: string;
  categoryIds: Types.ObjectId[];
  imageUrl?: string;
  createdBy: Types.ObjectId;
  createdByName: string;
}

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  location: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  imageUrl: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdByName: { type: String, required: true, trim: true },
});

export const Event = mongoose.model<IEvent>("Event", eventSchema);
