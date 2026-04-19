import { Request, Response } from 'express';
import { IPdfExportService } from '../../domain/interfaces/services';

export class PdfExportController {
  constructor(private readonly pdfService: IPdfExportService) {}

  export = async (req: Request, res: Response) => {
    const { tripId } = req.params;
    if (!tripId) {
      return res.status(400).json({ message: 'tripId required' });
    }
    const buffer = await this.pdfService.exportTrip(tripId);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(buffer);
  };
}

