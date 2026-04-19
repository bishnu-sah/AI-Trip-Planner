import { Request, Response } from 'express';
import { IWeatherService } from '../../domain/interfaces/services';

export class WeatherController {
  constructor(private readonly weatherService: IWeatherService) {}

  get = async (req: Request, res: Response) => {
    const { placeId } = req.params;
    if (!placeId) {
      return res.status(400).json({ message: 'placeId required' });
    }
    const summary = await this.weatherService.getWeather(placeId);
    res.json(summary);
  };
}

