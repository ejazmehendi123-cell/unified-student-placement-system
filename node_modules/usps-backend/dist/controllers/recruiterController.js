"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecruiterController = void 0;
const driveService_1 = require("../services/driveService");
const applicationService_1 = require("../services/applicationService");
const interviewService_1 = require("../services/interviewService");
const offerService_1 = require("../services/offerService");
const dataStore_1 = require("../repositories/dataStore");
class RecruiterController {
    static async createDrive(req, res, next) {
        try {
            const drive = await driveService_1.DriveService.createDrive(req.user.id, req.body, req);
            res.status(201).json({ success: true, data: drive });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateDrive(req, res, next) {
        try {
            const drive = await driveService_1.DriveService.updateDrive(req.params.id, req.user.id, req.body, req);
            res.status(200).json({ success: true, data: drive });
        }
        catch (err) {
            next(err);
        }
    }
    static async getMyDrives(req, res, next) {
        try {
            const recruiter = Array.from(dataStore_1.db.recruiters.values()).find(r => r.userId === req.user.id);
            if (!recruiter) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recruiter profile not found' } });
                return;
            }
            const drives = Array.from(dataStore_1.db.drives.values())
                .filter(d => d.recruiterId === recruiter.id)
                .map(d => {
                const applicantCount = Array.from(dataStore_1.db.applications.values()).filter(a => a.driveId === d.id).length;
                const shortlistedCount = Array.from(dataStore_1.db.applications.values()).filter(a => a.driveId === d.id && (a.status === 'SHORTLISTED' || a.status === 'INTERVIEW_SCHEDULED' || a.status === 'OFFERED' || a.status === 'ACCEPTED')).length;
                return {
                    ...d,
                    applicantCount,
                    shortlistedCount,
                };
            });
            res.status(200).json({ success: true, data: drives });
        }
        catch (err) {
            next(err);
        }
    }
    static async getDriveById(req, res, next) {
        try {
            const data = await driveService_1.DriveService.getDriveById(req.params.id);
            res.status(200).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async getDriveApplications(req, res, next) {
        try {
            const data = await applicationService_1.ApplicationService.getDriveApplicants(req.params.id, req.user.id, req.query);
            res.status(200).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async shortlistCandidate(req, res, next) {
        try {
            const app = await applicationService_1.ApplicationService.updateStatus(req.params.appId, 'SHORTLISTED', req.user.id, req.body.reason || 'Candidate shortlisted for interview rounds', req);
            res.status(200).json({ success: true, data: app });
        }
        catch (err) {
            next(err);
        }
    }
    static async rejectCandidate(req, res, next) {
        try {
            const app = await applicationService_1.ApplicationService.updateStatus(req.params.appId, 'REJECTED', req.user.id, req.body.reason || 'Candidate not selected for this role', req);
            res.status(200).json({ success: true, data: app });
        }
        catch (err) {
            next(err);
        }
    }
    static async scheduleInterview(req, res, next) {
        try {
            const interview = await interviewService_1.InterviewService.schedule(req.user.id, req.body, req);
            res.status(201).json({ success: true, data: interview });
        }
        catch (err) {
            next(err);
        }
    }
    static async issueOffer(req, res, next) {
        try {
            const offer = await offerService_1.OfferService.issueOffer(req.user.id, req.body, req);
            res.status(201).json({ success: true, data: offer });
        }
        catch (err) {
            next(err);
        }
    }
    static async exportShortlistCSV(req, res, next) {
        try {
            const { applicants } = await applicationService_1.ApplicationService.getDriveApplicants(req.params.id, req.user.id);
            const drive = dataStore_1.db.drives.get(req.params.id);
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
        }
        catch (err) {
            next(err);
        }
    }
    static async getInterviews(req, res, next) {
        try {
            const interviews = await interviewService_1.InterviewService.getRecruiterInterviews(req.user.id);
            res.status(200).json({ success: true, data: interviews });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.RecruiterController = RecruiterController;
