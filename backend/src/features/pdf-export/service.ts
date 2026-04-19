import { IPdfAdapter } from '../../domain/interfaces/adapters';
import { ITripService } from '../../domain/interfaces/services';
import { IPdfExportService } from '../../domain/interfaces/services';

export class PdfExportService implements IPdfExportService {
  constructor(
    private readonly pdfAdapter: IPdfAdapter,
    private readonly tripService: ITripService
  ) { }

  async exportTrip(tripId: string): Promise<Buffer> {
    const trip = await this.tripService.getTripById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }
    return this.pdfAdapter.render(trip);
  }
}

