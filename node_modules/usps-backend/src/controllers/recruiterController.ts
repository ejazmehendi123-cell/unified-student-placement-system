import { Request, Response, NextFunction } from 'express';
import { DriveService } from '../services/driveService';
import { ApplicationService } from '../services/applicationService';
import { InterviewService } from '../services/interviewService';
import { OfferService } from '../services/offerService';
import { db } from '../repositories/dataStore';

export class RecruiterController {
  public static async createDrive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const drive = await DriveService.createDrive(req.user!.id, req.body, req);
      res.status(201).json({ success: true, data: drive });
    } catch (err) {
      next(err);
    }
  }

  public static async updateDrive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const drive = await DriveService.updateDrive(req.params.id, req.user!.id, req.body, req);
      res.status(200).json({ success: true, data: drive });
    } catch (err) {
      next(err);
    }
  }

  public static async getMyDrives(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recruiter = Array.from(db.recruiters.values()).find(r => r.userId === req.user!.id);
      if (!recruiter) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recruiter profile not found' } });
        return;
      }
      const drives = Array.from(db.drives.values())
        .filter(d => d.recruiterId === recruiter.id)
        .map(d => {
          const applicantCount = Array.from(db.applications.values()).filter(a => a.driveId === d.id).length;
          const shortlistedCount = Array.from(db.applications.values()).filter(
            a => a.driveId === d.id && (a.status === 'SHORTLISTED' || a.status === 'INTERVIEW_SCHEDULED' || a.status === 'OFFERED' || a.status === 'ACCEPTED')
          ).length;
          return {
            ...d,
            applicantCount,
            shortlistedCount,
          };
        });

      res.status(200).json({ success: true, data: drives });
    } catch (err) {
      next(err);
    }
  }

  public static async getDriveById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await DriveService.getDriveById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async getDriveApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ApplicationService.getDriveApplicants(req.params.id, req.user!.id, req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async shortlistCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const app = await ApplicationService.updateStatus(
        req.params.appId,
        'SHORTLISTED',
        req.user!.id,
        req.body.reason || 'Candidate shortlisted for interview rounds',
        req
      );
      res.status(200).json({ success: true, data: app });
    } catch (err) {
      next(err);
    }
  }

  public static async rejectCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const app = await ApplicationService.updateStatus(
        req.params.appId,
        'REJECTED',
        req.user!.id,
        req.body.reason || 'Candidate not selected for this role',
        req
      );
      res.status(200).json({ success: true, data: app });
    } catch (err) {
      next(err);
    }
  }

  public static async scheduleInterview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const interview = await InterviewService.schedule(req.user!.id, req.body, req);
      res.status(201).json({ success: true, data: interview });
    } catch (err) {
      next(err);
    }
  }

  public static async issueOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const offer = await OfferService.issueOffer(req.user!.id, req.body, req);
      res.status(201).json({ success: true, data: offer });
    } catch (err) {
      next(err);
    }
  }

  public static async exportShortlistCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { applicants } = await ApplicationService.getDriveApplicants(req.params.id, req.user!.id);
      const drive = db.drives.get(req.params.id);

      const header = 'Roll Number,Candidate Name,Email,Phone,Branch,CGPA,Backlogs,Application Status,Applied Date\n';
      const rows = applicants
        .filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW_SCHEDULED' || a.status === 'OFFERED' || a.status === 'ACCEPTED')
        .map(a => [
          a.student?.rollNumber || '',
          `"${a.student?.fullName || ''}"`,
          a.student?.email || '',
          a.student?.phone || '',
          a.student?.branch || '',
          a.student?.cgpa || '',
          a.student?.backlogCount || '',
          a.status,
          a.appliedAt,
        ].join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="Shortlist_${drive?.jobRole.replace(/\s+/g, '_')}.csv"`);
      res.send(header + rows);
    } catch (err) {
      next(err);
    }
  }

  public static async getInterviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const interviews = await InterviewService.getRecruiterInterviews(req.user!.id);
      res.status(200).json({ success: true, data: interviews });
    } catch (err) {
      next(err);
    }
  }
}
