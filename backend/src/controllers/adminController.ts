import { Request, Response, NextFunction } from 'express';
import { DriveService } from '../services/driveService';
import { AuditService } from '../services/auditService';
import { SISService } from '../services/sisService';
import { ReportService } from '../services/reportService';
import { NotificationService } from '../services/notificationService';
import { db } from '../repositories/dataStore';
import { v4 as uuidv4 } from 'uuid';

export class AdminController {
  public static async getAllDrives(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const drives = Array.from(db.drives.values()).map(d => {
        const company = db.companies.get(d.companyId);
        const recruiter = db.recruiters.get(d.recruiterId);
        const applicantCount = Array.from(db.applications.values()).filter(a => a.driveId === d.id).length;
        return {
          ...d,
          company,
          recruiter,
          applicantCount,
        };
      });
      res.status(200).json({ success: true, data: drives });
    } catch (err) {
      next(err);
    }
  }

  public static async approveDrive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const drive = await DriveService.approveDrive(req.params.id, req.user!.id, req);
      res.status(200).json({ success: true, data: drive });
    } catch (err) {
      next(err);
    }
  }

  public static async rejectDrive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const drive = await DriveService.rejectDrive(req.params.id, req.user!.id, req.body.reason, req);
      res.status(200).json({ success: true, data: drive });
    } catch (err) {
      next(err);
    }
  }

  public static async overrideEligibility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId, driveId, reason } = req.body;
      const key = `${studentId}_${driveId}`;

      db.eligibilityOverrides.set(key, {
        id: uuidv4(),
        studentId,
        driveId,
        approvedBy: req.user!.id,
        reason,
        createdAt: new Date().toISOString(),
      });

      await AuditService.logAction({
        actorUserId: req.user!.id,
        actorRole: 'tpo_admin',
        action: 'ELIGIBILITY_OVERRIDDEN',
        entityType: 'students',
        entityId: studentId,
        newData: { driveId, reason },
        reason: `TPO Administrative Eligibility Override: ${reason}`,
        req,
      });

      const student = db.students.get(studentId);
      if (student) {
        await NotificationService.send({
          userId: student.userId,
          type: 'SYSTEM',
          title: 'Special Eligibility Exception Granted',
          message: `The TPO has granted an administrative eligibility override for your application to drive. Reason: "${reason}".`,
          data: { driveId },
        });
      }

      res.status(200).json({ success: true, message: 'Eligibility override registered successfully.' });
    } catch (err) {
      next(err);
    }
  }

  public static async overridePolicy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId, policyName, reason } = req.body;
      const key = `${studentId}_${policyName || 'SINGLE_OFFER_POLICY'}`;

      db.policyOverrides.set(key, {
        id: uuidv4(),
        studentId,
        policyName: policyName || 'SINGLE_OFFER_POLICY',
        approvedBy: req.user!.id,
        reason,
        createdAt: new Date().toISOString(),
      });

      await AuditService.logAction({
        actorUserId: req.user!.id,
        actorRole: 'tpo_admin',
        action: 'POLICY_OVERRIDDEN',
        entityType: 'students',
        entityId: studentId,
        newData: { policyName, reason },
        reason: `TPO Policy Exception Override: ${reason}`,
        req,
      });

      res.status(200).json({ success: true, message: 'Placement policy override granted successfully.' });
    } catch (err) {
      next(err);
    }
  }

  public static async getAllStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const students = Array.from(db.students.values()).map(s => {
        const profile = db.profiles.get(s.userId);
        const placement = Array.from(db.placements.values()).find(p => p.studentId === s.id);
        const company = placement ? db.companies.get(placement.companyId) : undefined;
        return {
          ...s,
          fullName: profile?.fullName,
          email: profile?.email,
          phone: profile?.phone,
          isActive: profile?.isActive,
          placement: placement ? { ...placement, company } : undefined,
        };
      });

      res.status(200).json({ success: true, data: students });
    } catch (err) {
      next(err);
    }
  }

  public static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = Array.from(db.profiles.values()).map(p => {
        // Exclude passwords and internal hashes for privacy
        return {
          id: p.id,
          email: p.email,
          role: p.role,
          fullName: p.fullName,
          phone: p.phone,
          isActive: p.isActive,
          mfaEnabled: p.mfaEnabled,
          lastLoginAt: p.lastLoginAt,
          createdAt: p.createdAt,
        };
      });
      res.status(200).json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }

  public static async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isActive } = req.body;
      const user = db.profiles.get(req.params.id);
      if (!user) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
        return;
      }

      user.isActive = Boolean(isActive);
      user.updatedAt = new Date().toISOString();

      await AuditService.logAction({
        actorUserId: req.user!.id,
        actorRole: 'tpo_admin',
        action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        entityType: 'profiles',
        entityId: user.id,
        newData: { isActive: user.isActive },
        reason: `TPO changed user active state to ${user.isActive}`,
        req,
      });

      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  public static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = AuditService.getLogs(req.query);
      res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }

  public static async syncSIS(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = req.body.students || SISService.getSampleSISData();
      const result = await SISService.syncRecords(records, req.user!.id, req);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getSampleSIS(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: SISService.getSampleSISData(),
    });
  }
}
