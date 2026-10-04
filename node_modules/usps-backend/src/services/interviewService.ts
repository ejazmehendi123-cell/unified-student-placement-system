import { db } from '../repositories/dataStore';
import { InterviewRound } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';
import { Request } from 'express';

export class InterviewService {
  public static async schedule(userId: string, data: any, req?: Request) {
    const app = db.applications.get(data.applicationId);
    if (!app) throw { status: 404, message: 'Application record not found.' };

    const drive = db.drives.get(app.driveId);
    const recruiter = Array.from(db.recruiters.values()).find(r => r.userId === userId);
    const profile = db.profiles.get(userId);

    if (profile?.role !== 'tpo_admin' && drive?.recruiterId !== recruiter?.id) {
      throw { status: 403, message: 'Unauthorized to schedule interview for this application.' };
    }

    const interviewId = uuidv4();
    const interview: InterviewRound = {
      id: interviewId,
      applicationId: app.id,
      roundNumber: Number(data.roundNumber) || 1,
      roundType: data.roundType || 'Technical Interview',
      scheduledAt: data.scheduledAt,
      mode: data.mode || 'ONLINE',
      venue: data.venue,
      meetingUrl: data.meetingUrl,
      status: 'SCHEDULED',
      notes: data.notes,
      studentInstructions: data.studentInstructions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.interviewRounds.set(interviewId, interview);

    // Update application status to INTERVIEW_SCHEDULED
    app.status = 'INTERVIEW_SCHEDULED';
    app.updatedAt = new Date().toISOString();

    const histories = db.statusHistories.get(app.id) || [];
    histories.push({
      id: uuidv4(),
      applicationId: app.id,
      oldStatus: 'SHORTLISTED',
      newStatus: 'INTERVIEW_SCHEDULED',
      changedBy: userId,
      reason: `Scheduled ${interview.roundType}`,
      createdAt: new Date().toISOString(),
    });

    await AuditService.logAction({
      actorUserId: userId,
      actorRole: profile?.role || 'recruiter',
      action: 'INTERVIEW_SCHEDULED',
      entityType: 'interview_rounds',
      entityId: interviewId,
      newData: { roundType: interview.roundType, scheduledAt: interview.scheduledAt, mode: interview.mode },
      reason: 'Recruiter scheduled candidate interview round',
      req,
    });

    // Notify Student
    const student = db.students.get(app.studentId);
    if (student) {
      await NotificationService.send({
        userId: student.userId,
        type: 'INTERVIEW_SCHEDULED',
        title: `Interview Scheduled: ${drive?.jobRole}`,
        message: `${interview.roundType} has been scheduled for ${new Date(interview.scheduledAt).toLocaleString()}. Mode: ${interview.mode}.`,
        data: { interviewId, driveId: drive?.id, meetingUrl: interview.meetingUrl, venue: interview.venue },
      });
    }

    return interview;
  }

  public static async getStudentInterviews(userId: string) {
    const student = Array.from(db.students.values()).find(s => s.userId === userId);
    if (!student) throw { status: 404, message: 'Student record not found.' };

    const studentAppIds = Array.from(db.applications.values())
      .filter(a => a.studentId === student.id)
      .map(a => a.id);

    const rounds = Array.from(db.interviewRounds.values())
      .filter(ir => studentAppIds.includes(ir.applicationId))
      .map(ir => {
        const app = db.applications.get(ir.applicationId);
        const drive = app ? db.drives.get(app.driveId) : undefined;
        const company = drive ? db.companies.get(drive.companyId) : undefined;

        // Hide private recruiter notes from student response for data minimization & privacy
        const { notes, ...studentSafeInterview } = ir;
        return {
          ...studentSafeInterview,
          drive: drive ? { ...drive, company } : undefined,
        };
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    return rounds;
  }

  public static async getRecruiterInterviews(userId: string) {
    const recruiter = Array.from(db.recruiters.values()).find(r => r.userId === userId);
    if (!recruiter) throw { status: 404, message: 'Recruiter record not found.' };

    const recruiterDriveIds = Array.from(db.drives.values())
      .filter(d => d.recruiterId === recruiter.id)
      .map(d => d.id);

    const recruiterAppIds = Array.from(db.applications.values())
      .filter(a => recruiterDriveIds.includes(a.driveId))
      .map(a => a.id);

    const rounds = Array.from(db.interviewRounds.values())
      .filter(ir => recruiterAppIds.includes(ir.applicationId))
      .map(ir => {
        const app = db.applications.get(ir.applicationId);
        const drive = app ? db.drives.get(app.driveId) : undefined;
        const student = app ? db.students.get(app.studentId) : undefined;
        const studentProfile = student ? db.profiles.get(student.userId) : undefined;

        return {
          ...ir,
          drive,
          student: student
            ? {
                rollNumber: student.rollNumber,
                branch: student.branch,
                cgpa: student.cgpa,
                fullName: studentProfile?.fullName,
                email: studentProfile?.email,
              }
            : undefined,
        };
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    return rounds;
  }
}
