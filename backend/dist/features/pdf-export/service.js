"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfExportService = void 0;
class PdfExportService {
    pdfAdapter;
    tripService;
    constructor(pdfAdapter, tripService) {
        this.pdfAdapter = pdfAdapter;
        this.tripService = tripService;
    }
    async exportTrip(tripId) {
        const trips = await this.tripService.listTrips();
        const trip = trips.find((t) => t.id === tripId);
        if (!trip) {
            throw new Error('Trip not found');
        }
        return this.pdfAdapter.render(trip);
    }
}
exports.PdfExportService = PdfExportService;
