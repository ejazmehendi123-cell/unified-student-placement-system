import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/studentService';
import { DriveService } from '../services/driveService';
import { ApplicationService } from '../services/applicationService';
import { InterviewService } from '../services/interviewService';
import { OfferService } from '../services/offerService';
import { EligibilityService } from '../services/eligibilityService';
import { PDFService } from '../services/pdfService';
import { db } from '../repositories/dataStore';

export class StudentController {
  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await StudentService.getFullProfile(req.user!.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await StudentService.updatePersonal(req.user!.id, req.body, req);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async addSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = Array.from(db.students.values()).find(s => s.userId === req.user!.id);
      if (!student) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
        return;
      }
      const data = await StudentService.addSkill(student.id, req.body.skillName, req.body.skillLevel);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async removeSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = Array.from(db.students.values()).find(s => s.userId === req.user!.id);
      if (!student) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
        return;
      }
      const data = await StudentService.removeSkill(student.id, req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async addProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = Array.from(db.students.values()).find(s => s.userId === req.user!.id);
      if (!student) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
        return;
      }
      const data = await StudentService.addProject(student.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async removeProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = Array.from(db.students.values()).find(s => s.userId === req.user!.id);
      if (!student) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
        return;
      }
      const data = await StudentService.removeProject(student.id, req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async addCertification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = Array.from(db.students.values()).find(s => s.userId === req.user!.id);
      if (!student) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
        return;
      }
      const data = await StudentService.addCertification(student.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async removeCertification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = Array.from(db.students.values()).find(s => s.userId === req.user!.id);
      if (!student) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
        return;
      }
      const data = await StudentService.removeCertification(student.id, req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async uploadResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      const filename = file?.originalname || req.body.filename || 'Resume_2026.pdf';
      const size = file?.size || 240000;
      const path = file?.path || `resumes/${filename}`;

      const result = await StudentService.uploadResumeMetadata(req.user!.id, filename, size, path);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getEligibleDrives(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = Array.from(db.students.values()).find(s => s.userId === req.user!.id);
      if (!student) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found' } });
        return;
      }

      const allDrives = Array.from(db.drives.values()).filter(d => d.status === 'OPEN' || d.status === 'CLOSED');
      const studentApps = Array.from(db.applications.values()).filter(a => a.studentId === student.id);

      const drivesWithEligibility = allDrives.map(drive => {
        const eligibility = EligibilityService.evaluateStudent(student, drive);
        const existingApp = studentApps.find(a => a.driveId === drive.id && a.status !== 'WITHDRAWN');
        const company = db.companies.get(drive.companyId);

        return {
          ...drive,
          company,
          eligibility,
          applied: !!existingApp,
          applicationStatus: existingApp?.status,
        };
      });

      res.status(200).json({ success: true, data: drivesWithEligibility });
    } catch (err) {
      next(err);
    }
  }

  public static async getDriveEligibility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = Array.from(db.students.values()).find(s => s.userId === req.user!.id);
      const drive = db.drives.get(req.params.id);

      if (!student || !drive) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
        return;
      }

      const eligibility = EligibilityService.evaluateStudent(student, drive);
      res.status(200).json({ success: true, data: eligibility });
    } catch (err) {
      next(err);
    }
  }

  public static async getApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const apps = await ApplicationService.getStudentApplications(req.user!.id);
      res.status(200).json({ success: true, data: apps });
    } catch (err) {
      next(err);
    }
  }

  public static async applyDrive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { driveId } = req.body;
      const app = await ApplicationService.apply(req.user!.id, driveId, req);
      res.status(201).json({ success: true, data: app });
    } catch (err) {
      next(err);
    }
  }

  public static async withdrawApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const app = await ApplicationService.withdraw(req.user!.id, req.params.id, req);
      res.status(200).json({ success: true, data: app });
    } catch (err) {
      next(err);
    }
  }

  public static async getInterviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const interviews = await InterviewService.getStudentInterviews(req.user!.id);
      res.status(200).json({ success: true, data: interviews });
    } catch (err) {
      next(err);
    }
  }

  public static async getOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const offers = await OfferService.getStudentOffers(req.user!.id);
      res.status(200).json({ success: true, data: offers });
    } catch (err) {
      next(err);
    }
  }

  public static async acceptOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await OfferService.acceptOffer(req.params.id, req.user!.id, req);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async declineOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await OfferService.declineOffer(req.params.id, req.user!.id, req.body.reason, req);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getClearanceCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = Array.from(db.students.values()).find(s => s.userId === req.user!.id);
      if (!student) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
        return;
      }
      const pdfBuffer = await PDFService.generateClearanceCertificate(student.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="USPS_Clearance_${student.rollNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
}
