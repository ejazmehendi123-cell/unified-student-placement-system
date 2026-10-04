"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewService = void 0;
const dataStore_1 = require("../repositories/dataStore");
const uuid_1 = require("uuid");
const auditService_1 = require("./auditService");
const notificationService_1 = require("./notificationService");
class InterviewService {
    static async schedule(userId, data, req) {
        const app = dataStore_1.db.applications.get(data.applicationId);
        if (!app)
            throw { status: 404, message: 'Application record not found.' };
        const drive = dataStore_1.db.drives.get(app.driveId);
        const recruiter = Array.from(dataStore_1.db.recruiters.values()).find(r => r.userId === userId);
        const profile = dataStore_1.db.profiles.get(userId);
        if (profile?.role !== 'tpo_admin' && drive?.recruiterId !== recruiter?.id) {
            throw { status: 403, message: 'Unauthorized to schedule interview for this application.' };
        }
        const interviewId = (0, uuid_1.v4)();
        const interview = {
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
        dataStore_1.db.interviewRounds.set(interviewId, interview);
        // Update application status to INTERVIEW_SCHEDULED
        app.status = 'INTERVIEW_SCHEDULED';
        app.updatedAt = new Date().toISOString();
        const histories = dataStore_1.db.statusHistories.get(app.id) || [];
        histories.push({
            id: (0, uuid_1.v4)(),
            applicationId: app.id,
            oldStatus: 'SHORTLISTED',
            newStatus: 'INTERVIEW_SCHEDULED',
            changedBy: userId,
            reason: `Scheduled ${interview.roundType}`,
            createdAt: new Date().toISOString(),
        });
        await auditService_1.AuditService.logAction({
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
        const student = dataStore_1.db.students.get(app.studentId);
        if (student) {
            await notificationService_1.NotificationService.send({
                userId: student.userId,
                type: 'INTERVIEW_SCHEDULED',
                title: `Interview Scheduled: ${drive?.jobRole}`,
                message: `${interview.roundType} has been scheduled for ${new Date(interview.scheduledAt).toLocaleString()}. Mode: ${interview.mode}.`,
                data: { interviewId, driveId: drive?.id, meetingUrl: interview.meetingUrl, venue: interview.venue },
            });
        }
        return interview;
    }
    static async getStudentInterviews(userId) {
        const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === userId);
        if (!student)
            throw { status: 404, message: 'Student record not found.' };
        const studentAppIds = Array.from(dataStore_1.db.applications.values())
            .filter(a => a.studentId === student.id)
            .map(a => a.id);
        const rounds = Array.from(dataStore_1.db.interviewRounds.values())
            .filter(ir => studentAppIds.includes(ir.applicationId))
            .map(ir => {
            const app = dataStore_1.db.applications.get(ir.applicationId);
            const drive = app ? dataStore_1.db.drives.get(app.driveId) : undefined;
            const company = drive ? dataStore_1.db.companies.get(drive.companyId) : undefined;
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
    static async getRecruiterInterviews(userId) {
        const recruiter = Array.from(dataStore_1.db.recruiters.values()).find(r => r.userId === userId);
        if (!recruiter)
            throw { status: 404, message: 'Recruiter record not found.' };
        const recruiterDriveIds = Array.from(dataStore_1.db.drives.values())
            .filter(d => d.recruiterId === recruiter.id)
            .map(d => d.id);
        const recruiterAppIds = Array.from(dataStore_1.db.applications.values())
            .filter(a => recruiterDriveIds.includes(a.driveId))
            .map(a => a.id);
        const rounds = Array.from(dataStore_1.db.interviewRounds.values())
            .filter(ir => recruiterAppIds.includes(ir.applicationId))
            .map(ir => {
            const app = dataStore_1.db.applications.get(ir.applicationId);
            const drive = app ? dataStore_1.db.drives.get(app.driveId) : undefined;
            const student = app ? dataStore_1.db.students.get(app.studentId) : undefined;
            const studentProfile = student ? dataStore_1.db.profiles.get(student.userId) : undefined;
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
exports.InterviewService = InterviewService;
