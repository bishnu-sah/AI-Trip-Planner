import { ChatMessage, Place, Trip, WeatherSummary } from '../models';

export interface IPlacesAdapter {
  search(keyword: string): Promise<Place[]>;
}

export interface IAIAdapter {
  complete(prompt: string): Promise<string>;
  chat(messages: ChatMessage[]): Promise<ChatMessage>;
}

export interface IWeatherAdapter {
  getForecast(placeId: string): Promise<WeatherSummary>;
}

export interface IDistanceAdapter {
  estimateDays(count: number): Promise<number>;
}

export interface IPdfAdapter {
  render(trip: Trip): Promise<Buffer>;
}

