export interface Event {
  id: string; // UUID (string)
  title: string;
  date: string; // ISO format date string
  location: string;
  description?: string; // Optional
}

export const events: Event[] = [];
