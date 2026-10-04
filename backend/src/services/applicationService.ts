import { db } from '../repositories/dataStore';
import { Application, ApplicationStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { EligibilityService } from './eligibilityService';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';
import { Request } from 'express';

export class ApplicationService {
  public static async apply(userId: string, driveId: string, req?: Request) {
    const student = Array.from(db.students.values()).find(s => s.userId === userId);
    if (!student) throw { status: 404, message: 'Student profile not found.' };

    const drive = db.drives.get(driveId);
    if (!drive) throw { status: 404, message: 'Placement drive not found.' };

    // 1. Check if application already exists
    const existingApp = Array.from(db.applications.values()).find(
      a => a.studentId === student.id && a.driveId === driveId
    );

    if (existingApp && existingApp.status !== 'WITHDRAWN') {
      throw { status: 400, message: 'You have already applied for this placement drive.' };
    }

    // 2. Strict backend-authoritative eligibility check
    const evalResult = EligibilityService.evaluateStudent(student, drive);
    if (!evalResult.eligible) {
      throw {
        status: 400,
        message: `Eligibility criteria not met: ${evalResult.reason}`,
        details: evalResult,
      };
    }

    const applicationId = existingApp ? existingApp.id : uuidv4();
    const app: Application = {
      id: applicationId,
      studentId: student.id,
      driveId: drive.id,
      status: 'SUBMITTED',
      appliedAt: new Date().toISOString(),
      createdAt: existingApp?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.applications.set(applicationId, app);

    // Status History
    const histories = db.statusHistories.get(applicationId) || [];
    histories.push({
      id: uuidv4(),
      applicationId,
      oldStatus: existingApp?.status,
      newStatus: 'SUBMITTED',
      changedBy: userId,
      reason: 'Application submitted by student',
      createdAt: new Date().toISOString(),
    });
    db.statusHistories.set(applicationId, histories);

    // Audit log
    await AuditService.logAction({
      actorUserId: userId,
      actorRole: 'student',
      action: 'APPLICATION_SUBMITTED',
      entityType: 'applications',
      entityId: applicationId,
      newData: { driveId, jobRole: drive.jobRole },
      reason: 'Student submitted application for open placement drive',
      req,
    });

    // Notify Student
    await NotificationService.send({
      userId,
      type: 'APPLICATION_SUBMITTED',
      title: `Application Submitted: ${drive.companyName}`,
      message: `Your application for ${drive.jobRole} has been submitted successfully.`,
      data: { applicationId, driveId },
    });

    return app;
  }

  public static async withdraw(userId: string, applicationId: string, req?: Request) {
    const student = Array.from(db.students.values()).find(s => s.userId === userId);
    const app = db.applications.get(applicationId);

    if (!app || app.studentId !== student?.id) {
      throw { status: 404, message: 'Application not found or unauthorized.' };
    }

    if (app.status === 'ACCEPTED' || app.status === 'PLACED') {
      throw { status: 400, message: 'Cannot withdraw an accepted or placed application.' };
    }

    const oldStatus = app.status;
    app.status = 'WITHDRAWN';
    app.withdrawnAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();

    const histories = db.statusHistories.get(applicationId) || [];
    histories.push({
      id: uuidv4(),
      applicationId,
      oldStatus,
      newStatus: 'WITHDRAWN',
      changedBy: userId,
      reason: 'Application withdrawn by student',
      createdAt: new Date().toISOString(),
    });

    await AuditService.logAction({
      actorUserId: userId,
      actorRole: 'student',
      action: 'APPLICATION_WITHDRAWN',
      entityType: 'applications',
      entityId: applicationId,
      oldData: { status: oldStatus },
      newData: { status: 'WITHDRAWN' },
      reason: 'Candidate voluntarily withdrew application',
      req,
    });

    return app;
  }

  public static async updateStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    actorUserId: string,
    reason?: string,
    req?: Request
  ) {
    const app = db.applications.get(applicationId);
    if (!app) throw { status: 404, message: 'Application not found.' };

    const drive = db.drives.get(app.driveId);
    const actor = db.profiles.get(actorUserId);
    const recruiter = Array.from(db.recruiters.values()).find(r => r.userId === actorUserId);

    if (actor?.role !== 'tpo_admin' && drive?.recruiterId !== recruiter?.id) {
      throw { status: 403, message: 'Unauthorized to update status for this applicant.' };
    }

    const oldStatus = app.status;
    app.status = newStatus;
    app.updatedAt = new Date().toISOString();

    const histories = db.statusHistories.get(applicationId) || [];
    histories.push({
      id: uuidv4(),
      applicationId,
      oldStatus,
      newStatus,
      changedBy: actorUserId,
      reason: reason || `Status updated to ${newStatus}`,
      createdAt: new Date().toISOString(),
    });

    await AuditService.logAction({
      actorUserId,
      actorRole: actor?.role || 'recruiter',
      action: `APPLICATION_${newStatus}`,
      entityType: 'applications',
      entityId: applicationId,
      oldData: { status: oldStatus },
      newData: { status: newStatus },
      reason: reason || 'Recruiter updated candidate recruitment status',
      req,
    });

    // Notify Student
    const student = db.students.get(app.studentId);
    if (student) {
      const notifType = newStatus === 'SHORTLISTED' ? 'APPLICATION_SHORTLISTED' : newStatus === 'REJECTED' ? 'APPLICATION_REJECTED' : 'SYSTEM';
      await NotificationService.send({
        userId: student.userId,
        type: notifType,
        title: `Application Update: ${drive?.companyName}`,
        message: `Your application status for "${drive?.jobRole}" has been updated to: ${newStatus.replace('_', ' ')}.`,
        data: { applicationId, driveId: drive?.id, newStatus },
      });
    }

    return app;
  }

  public static async getStudentApplications(userId: string) {
    const student = Array.from(db.students.values()).find(s => s.userId === userId);
    if (!student) throw { status: 404, message: 'Student not found.' };

    const apps = Array.from(db.applications.values())
      .filter(a => a.studentId === student.id)
      .map(app => {
        const drive = db.drives.get(app.driveId);
        const company = drive ? db.companies.get(drive.companyId) : undefined;
        const histories = db.statusHistories.get(app.id) || [];
        const interview = Array.from(db.interviewRounds.values()).find(ir => ir.applicationId === app.id);
        const offer = Array.from(db.offers.values()).find(o => o.applicationId === app.id);

        return {
          ...app,
          drive: drive ? { ...drive, company } : undefined,
          history: histories.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
          interview,
          offer,
        };
      });

    return apps;
  }

  public static async getDriveApplicants(driveId: string, actorUserId: string, filters: any = {}) {
    const drive = db.drives.get(driveId);
    if (!drive) throw { status: 404, message: 'Drive not found.' };

    const actor = db.profiles.get(actorUserId);
    const recruiter = Array.from(db.recruiters.values()).find(r => r.userId === actorUserId);

    if (actor?.role !== 'tpo_admin' && drive.recruiterId !== recruiter?.id) {
      throw { status: 403, message: 'Unauthorized to view applicants for this drive.' };
    }

    let apps = Array.from(db.applications.values()).filter(a => a.driveId === driveId);

    if (filters.status) {
      apps = apps.filter(a => a.status === filters.status);
    }

    const enriched = apps.map(app => {
      const student = db.students.get(app.studentId);
      const studentProfile = student ? db.profiles.get(student.userId) : undefined;
      const skills = student ? db.skills.get(student.id) || [] : [];
      const interview = Array.from(db.interviewRounds.values()).find(ir => ir.applicationId === app.id);
      const offer = Array.from(db.offers.values()).find(o => o.applicationId === app.id);

      return {
        ...app,
        student: student
          ? {
              id: student.id,
              rollNumber: student.rollNumber,
              branch: student.branch,
              department: student.department,
              cgpa: student.cgpa,
              backlogCount: student.backlogCount,
              isPlaced: student.isPlaced,
              resumeUrl: student.resumeUrl,
              fullName: studentProfile?.fullName || 'Candidate',
              email: studentProfile?.email,
              phone: studentProfile?.phone,
              skills,
            }
          : undefined,
        interview,
        offer,
      };
    });

    let result = enriched;
    if (filters.branch) {
      result = result.filter(a => a.student?.branch === filters.branch);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        a =>
          a.student?.fullName?.toLowerCase().includes(q) ||
          a.student?.rollNumber?.toLowerCase().includes(q) ||
          a.student?.email?.toLowerCase().includes(q)
      );
    }

    return { total: result.length, applicants: result };
  }
}
