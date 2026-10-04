import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/reportService';
import { NotificationService } from '../services/notificationService';
import { db } from '../repositories/dataStore';

export class ReportController {
  public static async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = ReportService.getPlacementSummary();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async getDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = ReportService.getDepartmentStats();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async getCompanies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = ReportService.getCompanyStats();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async getPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = ReportService.getPackageDistribution();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async exportCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const csvData = ReportService.generatePlacementCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="USPS_Placements_Report_2026.csv"');
      res.send(csvData);
    } catch (err) {
      next(err);
    }
  }
}

export class NotificationController {
  public static async getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = NotificationService.getUserNotifications(req.user!.id);
      const unreadCount = NotificationService.getUnreadCount(req.user!.id);
      res.status(200).json({ success: true, data: { notifications: data, unreadCount } });
    } catch (err) {
      next(err);
    }
  }

  public static async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const success = NotificationService.markAsRead(req.params.id, req.user!.id);
      res.status(200).json({ success, message: success ? 'Marked as read' : 'Notification not found' });
    } catch (err) {
      next(err);
    }
  }

  public static async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = NotificationService.markAllAsRead(req.user!.id);
      res.status(200).json({ success: true, data: { markedCount: count } });
    } catch (err) {
      next(err);
    }
  }
}

export class DocumentController {
  public static async getDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = db.documents.get(req.params.id);
      if (!doc) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
        return;
      }

      // Security & Authorization Check
      const user = req.user!;
      const isOwner = doc.ownerUserId === user.id;
      const isAdmin = user.role === 'tpo_admin' || user.role === 'leadership';

      let isRecruiterApplicantDoc = false;
      if (user.role === 'recruiter') {
        const student = Array.from(db.students.values()).find(s => s.userId === doc.ownerUserId);
        if (student) {
          const recruiterDrives = Array.from(db.drives.values()).filter(d => d.recruiterId === user.recruiterId);
          const driveIds = new Set(recruiterDrives.map(d => d.id));
          isRecruiterApplicantDoc = Array.from(db.applications.values()).some(
            a => a.studentId === student.id && driveIds.has(a.driveId)
          );
        }
      }

      if (!isOwner && !isAdmin && !isRecruiterApplicantDoc) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Unauthorized: You do not have permission to view this private document.' },
        });
        return;
      }

      // Serve / stream sample PDF content for demo/development
      res.setHeader('Content-Type', doc.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${doc.originalFilename}"`);
      
      // Send a valid sample PDF header + metadata stream
      const samplePdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 55 >> stream
BT /F1 18 Tf 50 700 Td (USPS Verified Document: ${doc.originalFilename}) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000213 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
318
%%EOF`;

      res.send(Buffer.from(samplePdfContent, 'utf-8'));
    } catch (err) {
      next(err);
    }
  }
}
