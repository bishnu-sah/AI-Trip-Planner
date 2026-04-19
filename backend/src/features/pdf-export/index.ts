import { Router } from 'express';
import { Container } from '../../core/container';
import { IPdfAdapter } from '../../domain/interfaces/adapters';
import { IPdfExportService, ITripService } from '../../domain/interfaces/services';
import { PdfBufferAdapter } from '../../infra/adapters/PdfBufferAdapter';
import { PdfExportController } from './controller';
import { PdfExportService } from './service';
import { createPdfRoutes } from './routes';

export const registerPdfModule = (router: Router, container: Container) => {
  const pdfAdapter = container.resolve<IPdfAdapter>('PdfAdapter') || new PdfBufferAdapter();
  const tripService = container.resolve<ITripService>('TripService');
  const pdfService: IPdfExportService = new PdfExportService(pdfAdapter, tripService);
  container.register<IPdfExportService>('PdfExportService', pdfService);
  const controller = new PdfExportController(pdfService);
  router.use('/pdf', createPdfRoutes(controller));
};

