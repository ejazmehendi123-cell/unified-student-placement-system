"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const driveService_1 = require("../services/driveService");
const auditService_1 = require("../services/auditService");
const sisService_1 = require("../services/sisService");
const notificationService_1 = require("../services/notificationService");
const dataStore_1 = require("../repositories/dataStore");
const uuid_1 = require("uuid");
class AdminController {
    static async getAllDrives(req, res, next) {
        try {
            const drives = Array.from(dataStore_1.db.drives.values()).map(d => {
                const company = dataStore_1.db.companies.get(d.companyId);
                const recruiter = dataStore_1.db.recruiters.get(d.recruiterId);
                const applicantCount = Array.from(dataStore_1.db.applications.values()).filter(a => a.driveId === d.id).length;
                return {
                    ...d,
                    company,
                    recruiter,
                    applicantCount,
                };
            });
            res.status(200).json({ success: true, data: drives });
        }
        catch (err) {
            next(err);
        }
    }
    static async approveDrive(req, res, next) {
        try {
            const drive = await driveService_1.DriveService.approveDrive(req.params.id, req.user.id, req);
            res.status(200).json({ success: true, data: drive });
        }
        catch (err) {
            next(err);
        }
    }
    static async rejectDrive(req, res, next) {
        try {
            const drive = await driveService_1.DriveService.rejectDrive(req.params.id, req.user.id, req.body.reason, req);
            res.status(200).json({ success: true, data: drive });
        }
        catch (err) {
            next(err);
        }
    }
    static async overrideEligibility(req, res, next) {
        try {
            const { studentId, driveId, reason } = req.body;
            const key = `${studentId}_${driveId}`;
            dataStore_1.db.eligibilityOverrides.set(key, {
                id: (0, uuid_1.v4)(),
                studentId,
                driveId,
                approvedBy: req.user.id,
                reason,
                createdAt: new Date().toISOString(),
            });
            await auditService_1.AuditService.logAction({
                actorUserId: req.user.id,
                actorRole: 'tpo_admin',
                action: 'ELIGIBILITY_OVERRIDDEN',
                entityType: 'students',
                entityId: studentId,
                newData: { driveId, reason },
                reason: `TPO Administrative Eligibility Override: ${reason}`,
                req,
            });
            const student = dataStore_1.db.students.get(studentId);
            if (student) {
                await notificationService_1.NotificationService.send({
                    userId: student.userId,
                    type: 'SYSTEM',
                    title: 'Special Eligibility Exception Granted',
                    message: `The TPO has granted an administrative eligibility override for your application to drive. Reason: "${reason}".`,
                    data: { driveId },
                });
            }
            res.status(200).json({ success: true, message: 'Eligibility override registered successfully.' });
        }
        catch (err) {
            next(err);
        }
    }
    static async overridePolicy(req, res, next) {
        try {
            const { studentId, policyName, reason } = req.body;
            const key = `${studentId}_${policyName || 'SINGLE_OFFER_POLICY'}`;
            dataStore_1.db.policyOverrides.set(key, {
                id: (0, uuid_1.v4)(),
                studentId,
                policyName: policyName || 'SINGLE_OFFER_POLICY',
                approvedBy: req.user.id,
                reason,
                createdAt: new Date().toISOString(),
            });
            await auditService_1.AuditService.logAction({
                actorUserId: req.user.id,
                actorRole: 'tpo_admin',
                action: 'POLICY_OVERRIDDEN',
                entityType: 'students',
                entityId: studentId,
                newData: { policyName, reason },
                reason: `TPO Policy Exception Override: ${reason}`,
                req,
            });
            res.status(200).json({ success: true, message: 'Placement policy override granted successfully.' });
        }
        catch (err) {
            next(err);
        }
    }
    static async getAllStudents(req, res, next) {
        try {
            const students = Array.from(dataStore_1.db.students.values()).map(s => {
                const profile = dataStore_1.db.profiles.get(s.userId);
                const placement = Array.from(dataStore_1.db.placements.values()).find(p => p.studentId === s.id);
                const company = placement ? dataStore_1.db.companies.get(placement.companyId) : undefined;
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
        }
        catch (err) {
            next(err);
        }
    }
    static async getUsers(req, res, next) {
        try {
            const users = Array.from(dataStore_1.db.profiles.values()).map(p => {
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
        }
        catch (err) {
            next(err);
        }
    }
    static async updateUserStatus(req, res, next) {
        try {
            const { isActive } = req.body;
            const user = dataStore_1.db.profiles.get(req.params.id);
            if (!user) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
                return;
            }
            user.isActive = Boolean(isActive);
            user.updatedAt = new Date().toISOString();
            await auditService_1.AuditService.logAction({
                actorUserId: req.user.id,
                actorRole: 'tpo_admin',
                action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
                entityType: 'profiles',
                entityId: user.id,
                newData: { isActive: user.isActive },
                reason: `TPO changed user active state to ${user.isActive}`,
                req,
            });
            res.status(200).json({ success: true, data: user });
        }
        catch (err) {
            next(err);
        }
    }
    static async getAuditLogs(req, res, next) {
        try {
            const logs = auditService_1.AuditService.getLogs(req.query);
            res.status(200).json({ success: true, data: logs });
        }
        catch (err) {
            next(err);
        }
    }
    static async syncSIS(req, res, next) {
        try {
            const records = req.body.students || sisService_1.SISService.getSampleSISData();
            const result = await sisService_1.SISService.syncRecords(records, req.user.id, req);
            res.status(200).json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    static async getSampleSIS(req, res) {
        res.status(200).json({
            success: true,
            data: sisService_1.SISService.getSampleSISData(),
        });
    }
}
exports.AdminController = AdminController;
