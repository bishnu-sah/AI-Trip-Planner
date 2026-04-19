"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfBufferAdapter = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
class PdfBufferAdapter {
    async render(trip) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default();
                const buffers = [];
                doc.on('data', (chunk) => buffers.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                // --- PDF Content ---
                // Title
                doc.fontSize(25).text(trip.title, { align: 'center' });
                doc.moveDown();
                // Basic Info
                doc.fontSize(12).text(`Traveler: ${trip.travelerName || 'Adventurer'}`);
                doc.text(`Duration: ${trip.days.length} Days`);
                doc.moveDown();
                // Itinerary
                trip.days.forEach((day, index) => {
                    doc.fontSize(16).text(`Day ${index + 1} - ${day.theme || 'Exploration'}`, { underline: true });
                    doc.moveDown(0.5);
                    if (day.activities && day.activities.length > 0) {
                        day.activities.forEach((activity) => {
                            // Time - Title
                            doc.fontSize(12).font('Helvetica-Bold').text(`${activity.time} - ${activity.title}`);
                            // Description
                            doc.font('Helvetica').text(activity.description);
                            doc.moveDown(0.5);
                        });
                    }
                    else {
                        doc.fontSize(12).text('No activities planned.');
                    }
                    doc.addPage(); // New page for each day (optional, but cleaner)
                });
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.PdfBufferAdapter = PdfBufferAdapter;
