import { Request, Response } from 'express';
import { IHotelService } from '../../domain/interfaces/services';

export class HotelController {
  constructor(private readonly hotelService: IHotelService) {}

  sample = async (_req: Request, res: Response) => {
    try {
      const results = await this.hotelService.recommendHotels('Delhi', 'Near Taj Mahal');
      res.json(results);
    } catch (error: any) {
      console.error('[HotelController] Error in sample:', error);
      res.status(500).json({ message: 'Failed to get hotel recommendations', error: error?.message });
    }
  };

  recommend = async (req: Request, res: Response) => {
    try {
      const { city, location } = req.query;
      if (!city) {
        return res.status(400).json({ message: 'city query parameter required' });
      }
      const results = await this.hotelService.recommendHotels(String(city), location ? String(location) : undefined);
      res.json(results);
    } catch (error: any) {
      console.error('[HotelController] Error in recommend:', error);
      res.status(500).json({ message: 'Failed to get hotel recommendations', error: error?.message });
    }
  };
}

