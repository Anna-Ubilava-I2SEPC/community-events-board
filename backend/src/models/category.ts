import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, trim: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, required: true, trim: true }
});

export const Category = mongoose.model<ICategory>('Category', categorySchema); 