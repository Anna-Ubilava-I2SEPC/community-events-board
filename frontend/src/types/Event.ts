import type { Category } from "./Category";

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  categoryIds: (string | Category)[];
  imageUrl?: string;
  createdBy?: string;
  createdByName?: string;
}
