import { Router } from 'express';
import { PdfExportController } from './controller';

export const createPdfRoutes = (controller: PdfExportController): Router => {
  const router = Router();
  router.get('/:tripId', controller.export);
  return router;
};

