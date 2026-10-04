"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const studentService_1 = require("../services/studentService");
const applicationService_1 = require("../services/applicationService");
const interviewService_1 = require("../services/interviewService");
const offerService_1 = require("../services/offerService");
const eligibilityService_1 = require("../services/eligibilityService");
const pdfService_1 = require("../services/pdfService");
const dataStore_1 = require("../repositories/dataStore");
class StudentController {
    static async getProfile(req, res, next) {
        try {
            const data = await studentService_1.StudentService.getFullProfile(req.user.id);
            res.status(200).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const data = await studentService_1.StudentService.updatePersonal(req.user.id, req.body, req);
            res.status(200).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async addSkill(req, res, next) {
        try {
            const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === req.user.id);
            if (!student) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
                return;
            }
            const data = await studentService_1.StudentService.addSkill(student.id, req.body.skillName, req.body.skillLevel);
            res.status(201).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async removeSkill(req, res, next) {
        try {
            const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === req.user.id);
            if (!student) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
                return;
            }
            const data = await studentService_1.StudentService.removeSkill(student.id, req.params.id);
            res.status(200).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async addProject(req, res, next) {
        try {
            const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === req.user.id);
            if (!student) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
                return;
            }
            const data = await studentService_1.StudentService.addProject(student.id, req.body);
            res.status(201).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async removeProject(req, res, next) {
        try {
            const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === req.user.id);
            if (!student) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
                return;
            }
            const data = await studentService_1.StudentService.removeProject(student.id, req.params.id);
            res.status(200).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async addCertification(req, res, next) {
        try {
            const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === req.user.id);
            if (!student) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
                return;
            }
            const data = await studentService_1.StudentService.addCertification(student.id, req.body);
            res.status(201).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async removeCertification(req, res, next) {
        try {
            const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === req.user.id);
            if (!student) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
                return;
            }
            const data = await studentService_1.StudentService.removeCertification(student.id, req.params.id);
            res.status(200).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    static async uploadResume(req, res, next) {
        try {
            const file = req.file;
            const filename = file?.originalname || req.body.filename || 'Resume_2026.pdf';
            const size = file?.size || 240000;
            const path = file?.path || `resumes/${filename}`;
            const result = await studentService_1.StudentService.uploadResumeMetadata(req.user.id, filename, size, path);
            res.status(200).json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    static async getEligibleDrives(req, res, next) {
        try {
            const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === req.user.id);
            if (!student) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found' } });
                return;
            }
            const allDrives = Array.from(dataStore_1.db.drives.values()).filter(d => d.status === 'OPEN' || d.status === 'CLOSED');
            const studentApps = Array.from(dataStore_1.db.applications.values()).filter(a => a.studentId === student.id);
            const drivesWithEligibility = allDrives.map(drive => {
                const eligibility = eligibilityService_1.EligibilityService.evaluateStudent(student, drive);
                const existingApp = studentApps.find(a => a.driveId === drive.id && a.status !== 'WITHDRAWN');
                const company = dataStore_1.db.companies.get(drive.companyId);
                return {
                    ...drive,
                    company,
                    eligibility,
                    applied: !!existingApp,
                    applicationStatus: existingApp?.status,
                };
            });
            res.status(200).json({ success: true, data: drivesWithEligibility });
        }
        catch (err) {
            next(err);
        }
    }
    static async getDriveEligibility(req, res, next) {
        try {
            const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === req.user.id);
            const drive = dataStore_1.db.drives.get(req.params.id);
            if (!student || !drive) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
                return;
            }
            const eligibility = eligibilityService_1.EligibilityService.evaluateStudent(student, drive);
            res.status(200).json({ success: true, data: eligibility });
        }
        catch (err) {
            next(err);
        }
    }
    static async getApplications(req, res, next) {
        try {
            const apps = await applicationService_1.ApplicationService.getStudentApplications(req.user.id);
            res.status(200).json({ success: true, data: apps });
        }
        catch (err) {
            next(err);
        }
    }
    static async applyDrive(req, res, next) {
        try {
            const { driveId } = req.body;
            const app = await applicationService_1.ApplicationService.apply(req.user.id, driveId, req);
            res.status(201).json({ success: true, data: app });
        }
        catch (err) {
            next(err);
        }
    }
    static async withdrawApplication(req, res, next) {
        try {
            const app = await applicationService_1.ApplicationService.withdraw(req.user.id, req.params.id, req);
            res.status(200).json({ success: true, data: app });
        }
        catch (err) {
            next(err);
        }
    }
    static async getInterviews(req, res, next) {
        try {
            const interviews = await interviewService_1.InterviewService.getStudentInterviews(req.user.id);
            res.status(200).json({ success: true, data: interviews });
        }
        catch (err) {
            next(err);
        }
    }
    static async getOffers(req, res, next) {
        try {
            const offers = await offerService_1.OfferService.getStudentOffers(req.user.id);
            res.status(200).json({ success: true, data: offers });
        }
        catch (err) {
            next(err);
        }
    }
    static async acceptOffer(req, res, next) {
        try {
            const result = await offerService_1.OfferService.acceptOffer(req.params.id, req.user.id, req);
            res.status(200).json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    static async declineOffer(req, res, next) {
        try {
            const result = await offerService_1.OfferService.declineOffer(req.params.id, req.user.id, req.body.reason, req);
            res.status(200).json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    static async getClearanceCertificate(req, res, next) {
        try {
            const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === req.user.id);
            if (!student) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student record not found' } });
                return;
            }
            const pdfBuffer = await pdfService_1.PDFService.generateClearanceCertificate(student.id);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="USPS_Clearance_${student.rollNumber}.pdf"`);
            res.send(pdfBuffer);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.StudentController = StudentController;
