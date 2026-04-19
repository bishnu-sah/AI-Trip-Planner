import { IPdfAdapter } from '../../domain/interfaces/adapters';
import { Trip } from '../../domain/models';
import PDFDocument from 'pdfkit';

export class PdfBufferAdapter implements IPdfAdapter {
  async render(trip: Trip): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk: any) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // --- PDF Content ---

        // Title
        doc.fontSize(25).font('Helvetica-Bold').text(this.clean(trip.title), { align: 'center' });
        doc.moveDown();

        // Basic Info
        doc.fontSize(12).font('Helvetica');
        doc.text(`Traveler: ${this.clean(trip.travelerName || 'Adventurer')}`);
        if (trip.budget) {
          doc.text(`Budget Tier: ${this.clean(trip.budget)}`);
        }
        if (trip.budgetEstimate) {
          doc.text(`Estimated Total Cost: ${this.clean(trip.budgetEstimate.total)} ${this.clean(trip.budgetEstimate.currency)}`);
        }
        doc.text(`Duration: ${trip.days.length} Days`);
        doc.moveDown();

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Budget Breakdown Table in PDF
        if (trip.budgetEstimate && trip.budgetEstimate.breakdown) {
          doc.fontSize(16).font('Helvetica-Bold').text('Budget Breakdown', { underline: true });
          doc.moveDown(0.5);

          const col1 = 50;
          const col2 = 150;
          const col3 = 250;

          // Header
          const headerY = doc.y;
          doc.fontSize(12).text('Category', col1, headerY);
          doc.text('Amount', col2, headerY);
          doc.text('Description', col3, headerY);
          doc.moveDown(1);
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown(0.5);

          trip.budgetEstimate.breakdown.forEach(item => {
            if (doc.y > 700) doc.addPage();

            const startY = doc.y;
            doc.fontSize(10).font('Helvetica')
              .text(this.clean(item.category), col1, startY, { width: 90 });

            // Amount and Description should start at the same Y
            doc.text(this.clean(item.amount), col2, startY);
            doc.text(this.clean(item.description), col3, startY, { width: 300 });

            // Move down based on the longest text block
            const categoryHeight = doc.heightOfString(this.clean(item.category), { width: 90 });
            const descriptionHeight = doc.heightOfString(this.clean(item.description), { width: 300 });
            const rowHeight = Math.max(categoryHeight, descriptionHeight, 15);

            doc.y = startY + rowHeight + 5;
          });

          doc.moveDown();
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown();
        }

        // Itinerary
        trip.days.forEach((day, index) => {
          // Check if we need a new page (roughly)
          if (doc.y > 650) {
            doc.addPage();
          }

          doc.fontSize(16).font('Helvetica-Bold').text(`Day ${index + 1} - ${new Date(day.date).toLocaleDateString()}`, { underline: true });
          doc.moveDown(0.5);

          // Places
          if (day.places && day.places.length > 0) {
            doc.fontSize(12).font('Helvetica-Bold').text('Places:');
            const placesList = day.places.map(p => this.clean(p.name)).join(', ');
            doc.fontSize(11).font('Helvetica').text(placesList);
            doc.moveDown(0.5);
          }

          // Notes
          if (day.notes) {
            doc.fontSize(12).font('Helvetica-Bold').text('Plan:');
            doc.fontSize(11).font('Helvetica').text(this.clean(day.notes), {
              align: 'justify',
              lineGap: 2
            });
          }

          doc.moveDown(1.5);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
  private clean(text: string): string {
    if (!text) return '';
    // Replace Rupee symbol with INR and remove common emojis/non-ASCII chars that break standard fonts
    return text
      .replace(/₹/g, 'INR ')
      .replace(/[^\x00-\x7F]/g, ''); // Simple way to strip non-ASCII including emojis
  }
}

