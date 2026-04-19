import { IWeatherAdapter } from '../../domain/interfaces/adapters';
import { WeatherSummary } from '../../domain/models';

export class MockWeatherAdapter implements IWeatherAdapter {
  async getForecast(placeId: string): Promise<WeatherSummary> {
    return {
      placeId,
      forecast: 'Sunny with light breeze',
      temperatureC: 22
    };
  }
}

