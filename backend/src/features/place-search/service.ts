import { IPlacesAdapter } from '../../domain/interfaces/adapters';
import { IPlaceService } from '../../domain/interfaces/services';
import { Place } from '../../domain/models';

export class PlaceService implements IPlaceService {
  constructor(private readonly placesAdapter: IPlacesAdapter) {}

  async search(keyword: string): Promise<Place[]> {
    return this.placesAdapter.search(keyword);
  }
}

