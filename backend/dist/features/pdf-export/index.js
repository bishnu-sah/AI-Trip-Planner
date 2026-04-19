"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPdfModule = void 0;
const PdfBufferAdapter_1 = require("../../infra/adapters/PdfBufferAdapter");
const controller_1 = require("./controller");
const service_1 = require("./service");
const routes_1 = require("./routes");
const registerPdfModule = (router, container) => {
    const pdfAdapter = container.resolve('PdfAdapter') || new PdfBufferAdapter_1.PdfBufferAdapter();
    const tripService = container.resolve('TripService');
    const pdfService = new service_1.PdfExportService(pdfAdapter, tripService);
    container.register('PdfExportService', pdfService);
    const controller = new controller_1.PdfExportController(pdfService);
    router.use('/pdf', (0, routes_1.createPdfRoutes)(controller));
};
exports.registerPdfModule = registerPdfModule;
