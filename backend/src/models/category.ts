import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, trim: true }
});

export const Category = mongoose.model<ICategory>('Category', categorySchema); 