import PDFDocument from 'pdfkit';
import { db } from '../repositories/dataStore';

export class PDFService {
  public static async generateClearanceCertificate(studentId: string): Promise<Buffer> {
    const student = db.students.get(studentId);
    if (!student) throw new Error('Student not found');
    const profile = db.profiles.get(student.userId);
    const placement = Array.from(db.placements.values()).find(p => p.studentId === studentId);
    const company = placement ? db.companies.get(placement.companyId) : undefined;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fillColor('#1B2A4A')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('UNIFIED STUDENT PLACEMENT SYSTEM', { align: 'center' });

      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#B8863B')
         .text('TRAINING & PLACEMENT OFFICE (TPO) | OFFICIAL CERTIFICATE', { align: 'center' });

      doc.moveDown(2);
      doc.strokeColor('#E5DFD5').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(2);

      // Title
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#1B2A4A')
         .text('CAMPUS PLACEMENT & GRADUATION CLEARANCE', { align: 'center', underline: true });

      doc.moveDown(2);

      // Body text
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#23262B')
         .lineGap(6)
         .text(`This is to officially certify that the student detailed below has successfully completed the university placement procedures and is granted institutional clearance for campus recruitment credentials:`);

      doc.moveDown();

      // Student info table
      const startX = 60;
      let curY = doc.y;
      
      const drawRow = (label: string, value: string) => {
        doc.font('Helvetica-Bold').fillColor('#1B2A4A').text(label, startX, curY);
        doc.font('Helvetica').fillColor('#23262B').text(value, startX + 180, curY);
        curY += 22;
      };

      drawRow('Student Name:', profile?.fullName || 'N/A');
      drawRow('University Roll No:', student.rollNumber);
      drawRow('Department / Branch:', `${student.branch} (${student.department})`);
      drawRow('Cumulative CGPA:', `${student.cgpa.toFixed(2)} / 10.00`);
      drawRow('Placement Status:', student.isPlaced ? 'PLACED' : 'UNPLACED (OPTED OUT / HIGHER STUDIES)');
      
      if (placement) {
        drawRow('Recruiting Company:', company?.name || 'Partner Corporation');
        drawRow('Designation:', placement.jobRole);
        drawRow('Annual Package:', `${placement.package.toFixed(2)} LPA`);
        drawRow('Placement Date:', placement.placementDate);
      }

      doc.y = curY + 30;

      // Verification seal & signatures
      doc.fontSize(10)
         .font('Helvetica-Oblique')
         .fillColor('#5A606A')
         .text('Issued by the Office of Training & Placement under institutional accreditation governance.', { align: 'center' });

      doc.moveDown(3);

      const sigY = doc.y;
      doc.font('Helvetica-Bold').fillColor('#1B2A4A')
         .text('_____________________________', 60, sigY)
         .text('Dr. Ramesh Sundaram', 60, sigY + 15)
         .font('Helvetica').fontSize(9)
         .text('Head, Training & Placement Office', 60, sigY + 30);

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#1B2A4A')
         .text('_____________________________', 360, sigY)
         .text('Prof. K. Venkatesh', 360, sigY + 15)
         .font('Helvetica').fontSize(9)
         .text('Dean of Academic Affairs', 360, sigY + 30);

      doc.end();
    });
  }
}
