"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfExportController = void 0;
class PdfExportController {
    pdfService;
    constructor(pdfService) {
        this.pdfService = pdfService;
    }
    export = async (req, res) => {
        const { tripId } = req.params;
        if (!tripId) {
            return res.status(400).json({ message: 'tripId required' });
        }
        const buffer = await this.pdfService.exportTrip(tripId);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(buffer);
    };
}
exports.PdfExportController = PdfExportController;
