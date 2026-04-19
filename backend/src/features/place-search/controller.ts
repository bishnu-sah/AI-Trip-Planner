import { Request, Response } from 'express';
import { IPlaceService } from '../../domain/interfaces/services';

export class PlaceController {
  constructor(private readonly placeService: IPlaceService) {}

  search = async (req: Request, res: Response) => {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'q is required' });
    }
    const results = await this.placeService.search(String(q));
    res.json(results);
  };
}

