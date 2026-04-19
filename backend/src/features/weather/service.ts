import { IWeatherAdapter } from '../../domain/interfaces/adapters';
import { IWeatherService } from '../../domain/interfaces/services';
import { WeatherSummary } from '../../domain/models';

export class WeatherService implements IWeatherService {
  constructor(private readonly weatherAdapter: IWeatherAdapter) {}

  async getWeather(placeId: string): Promise<WeatherSummary> {
    return this.weatherAdapter.getForecast(placeId);
  }
}

