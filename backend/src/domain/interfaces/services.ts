import { ChatMessage, Place, Trip, WeatherSummary, User, Hotel } from '../models';

export interface ITripService {
  generateTrip(origin: string, destinations: Place[], days: number, userId?: string, budget?: string): Promise<Trip>;
  listTrips(userId?: string): Promise<Trip[]>;
  getTripById(id: string, userId?: string): Promise<Trip | null>;
  deleteTrip(id: string, userId?: string): Promise<boolean>;
  saveTrip(trip: Trip): Promise<Trip>;
  estimateTripBudget(id: string): Promise<Trip | null>;
}

export interface IPlaceService {
  search(keyword: string): Promise<Place[]>;
}

export interface IWeatherService {
  getWeather(placeId: string): Promise<WeatherSummary>;
}

export interface IPdfExportService {
  exportTrip(tripId: string): Promise<Buffer>;
}

export interface IChatService {
  converse(messages: ChatMessage[]): Promise<ChatMessage>;
}

export interface IHotelService {
  recommend(city: string): Promise<Place[]>;
  recommendHotels(city: string, location?: string): Promise<Hotel[]>;
}

export interface IAIService {
  complete(prompt: string): Promise<string>;
}

export interface IAuthService {
  register(username: string, email: string, password: string): Promise<User>;
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  getUserById(userId: string): Promise<User | null>;
  updateProfile(userId: string, data: Partial<User>): Promise<User>;
}
