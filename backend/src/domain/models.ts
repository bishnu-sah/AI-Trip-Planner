export type TripStatus = 'draft' | 'confirmed';

export interface Place {
  id: string;
  name: string;
  country: string;
  coordinates: { lat: number; lng: number };
}

export interface Activity {
  time: string;
  title: string;
  description: string;
}

export interface TripDay {
  date: string;
  places: Place[];
  notes?: string;
  theme?: string;
  activities?: Activity[];
}

export interface Trip {
  id: string;
  userId?: string; // Associate trip with user
  title: string;
  travelerName: string;
  budget?: string;
  budgetEstimate?: {
    total: string;
    currency: string;
    breakdown: Array<{ category: string; amount: string; description: string }>;
  };
  status: TripStatus;
  days: TripDay[];
  createdAt: string;
}

export interface WeatherSummary {
  placeId: string;
  forecast: string;
  temperatureC: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  city: string;
  rating?: number;
  priceRange?: string;
  description?: string;
  amenities?: string[];
  distance?: string;
}
