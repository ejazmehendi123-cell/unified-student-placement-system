"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveService = void 0;
const dataStore_1 = require("../repositories/dataStore");
const uuid_1 = require("uuid");
const auditService_1 = require("./auditService");
const notificationService_1 = require("./notificationService");
class DriveService {
    static async createDrive(userId, data, req) {
        const recruiter = Array.from(dataStore_1.db.recruiters.values()).find(r => r.userId === userId);
        if (!recruiter)
            throw { status: 403, message: 'Only registered recruiters can create placement drives.' };
        const driveId = (0, uuid_1.v4)();
        const isDraft = Boolean(data.isDraft);
        const status = isDraft ? 'DRAFT' : 'PENDING_APPROVAL';
        const drive = {
            id: driveId,
            companyId: recruiter.companyId || 'c0000001-0000-0000-0000-000000000001',
            companyName: data.companyName || recruiter.companyName,
            recruiterId: recruiter.id,
            jobRole: data.jobRole,
            jobDescription: data.jobDescription,
            packageMin: Number(data.packageMin),
            packageMax: Number(data.packageMax),
            packageCurrency: data.packageCurrency || 'INR (LPA)',
            minCgpa: Number(data.minCgpa),
            maxBacklogs: Number(data.maxBacklogs),
            eligibleBranches: data.eligibleBranches || ['CSE', 'IT'],
            applicationDeadline: data.applicationDeadline,
            driveDate: data.driveDate,
            status,
            createdBy: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        dataStore_1.db.drives.set(driveId, drive);
        await auditService_1.AuditService.logAction({
            actorUserId: userId,
            actorRole: 'recruiter',
            action: isDraft ? 'DRIVE_DRAFT_SAVED' : 'DRIVE_SUBMITTED_FOR_APPROVAL',
            entityType: 'placement_drives',
            entityId: driveId,
            newData: { jobRole: drive.jobRole, status },
            reason: isDraft ? 'Drive draft saved' : 'Drive submitted to TPO for approval',
            req,
        });
        if (!isDraft) {
            // Notify TPO admins
            const tpoAdmins = Array.from(dataStore_1.db.profiles.values()).filter(p => p.role === 'tpo_admin');
            for (const tpo of tpoAdmins) {
                await notificationService_1.NotificationService.send({
                    userId: tpo.id,
                    type: 'SYSTEM',
                    title: 'New Placement Drive Awaiting Approval',
                    message: `${recruiter.companyName} submitted a new drive for "${drive.jobRole}" requiring TPO authorization.`,
                    data: { driveId },
                });
            }
        }
        return drive;
    }
    static async updateDrive(driveId, userId, data, req) {
        const drive = dataStore_1.db.drives.get(driveId);
        if (!drive)
            throw { status: 404, message: 'Placement drive not found.' };
        const profile = dataStore_1.db.profiles.get(userId);
        const recruiter = Array.from(dataStore_1.db.recruiters.values()).find(r => r.userId === userId);
        if (profile?.role !== 'tpo_admin' && drive.recruiterId !== recruiter?.id) {
            throw { status: 403, message: 'Unauthorized to modify this placement drive.' };
        }
        if (profile?.role === 'recruiter' && drive.status !== 'DRAFT' && drive.status !== 'REJECTED') {
            throw { status: 400, message: 'Recruiters can only edit drives in DRAFT or REJECTED state.' };
        }
        const oldData = { ...drive };
        if (data.jobRole)
            drive.jobRole = data.jobRole;
        if (data.jobDescription)
            drive.jobDescription = data.jobDescription;
        if (data.packageMin !== undefined)
            drive.packageMin = Number(data.packageMin);
        if (data.packageMax !== undefined)
            drive.packageMax = Number(data.packageMax);
        if (data.minCgpa !== undefined)
            drive.minCgpa = Number(data.minCgpa);
        if (data.maxBacklogs !== undefined)
            drive.maxBacklogs = Number(data.maxBacklogs);
        if (data.eligibleBranches)
            drive.eligibleBranches = data.eligibleBranches;
        if (data.applicationDeadline)
            drive.applicationDeadline = data.applicationDeadline;
        if (data.driveDate)
            drive.driveDate = data.driveDate;
        if (data.isSubmitForApproval && (drive.status === 'DRAFT' || drive.status === 'REJECTED')) {
            drive.status = 'PENDING_APPROVAL';
        }
        drive.updatedAt = new Date().toISOString();
        drive.updatedBy = userId;
        await auditService_1.AuditService.logAction({
            actorUserId: userId,
            actorRole: profile?.role || 'user',
            action: 'DRIVE_UPDATED',
            entityType: 'placement_drives',
            entityId: driveId,
            oldData,
            newData: { jobRole: drive.jobRole, status: drive.status },
            reason: 'Drive details updated',
            req,
        });
        return drive;
    }
    static async approveDrive(driveId, adminUserId, req) {
        const drive = dataStore_1.db.drives.get(driveId);
        if (!drive)
            throw { status: 404, message: 'Placement drive not found.' };
        const oldStatus = drive.status;
        drive.status = 'OPEN';
        drive.approvedBy = adminUserId;
        drive.approvedAt = new Date().toISOString();
        drive.rejectionReason = undefined;
        drive.updatedAt = new Date().toISOString();
        // Log audit
        await auditService_1.AuditService.logAction({
            actorUserId: adminUserId,
            actorRole: 'tpo_admin',
            action: 'DRIVE_APPROVED',
            entityType: 'placement_drives',
            entityId: driveId,
            oldData: { status: oldStatus },
            newData: { status: 'OPEN' },
            reason: 'TPO verified eligibility and approved placement drive.',
            req,
        });
        // Notify Recruiter
        const recruiter = dataStore_1.db.recruiters.get(drive.recruiterId);
        if (recruiter) {
            await notificationService_1.NotificationService.send({
                userId: recruiter.userId,
                type: 'DRIVE_APPROVED',
                title: 'Placement Drive Approved & Published',
                message: `Your drive for "${drive.jobRole}" has been approved by the TPO and is now OPEN for student applications.`,
                data: { driveId },
            });
        }
        return drive;
    }
    static async rejectDrive(driveId, adminUserId, reason, req) {
        const drive = dataStore_1.db.drives.get(driveId);
        if (!drive)
            throw { status: 404, message: 'Placement drive not found.' };
        const oldStatus = drive.status;
        drive.status = 'REJECTED';
        drive.rejectionReason = reason;
        drive.updatedAt = new Date().toISOString();
        await auditService_1.AuditService.logAction({
            actorUserId: adminUserId,
            actorRole: 'tpo_admin',
            action: 'DRIVE_REJECTED',
            entityType: 'placement_drives',
            entityId: driveId,
            oldData: { status: oldStatus },
            newData: { status: 'REJECTED' },
            reason,
            req,
        });
        const recruiter = dataStore_1.db.recruiters.get(drive.recruiterId);
        if (recruiter) {
            await notificationService_1.NotificationService.send({
                userId: recruiter.userId,
                type: 'DRIVE_REJECTED',
                title: 'Placement Drive Revision Required',
                message: `Your placement drive for "${drive.jobRole}" was not approved. TPO feedback: "${reason}"`,
                data: { driveId, reason },
            });
        }
        return drive;
    }
    static async listDrives(filters) {
        let list = Array.from(dataStore_1.db.drives.values());
        if (filters.status) {
            list = list.filter(d => d.status === filters.status);
        }
        if (filters.branch) {
            list = list.filter(d => d.eligibleBranches.includes(filters.branch));
        }
        if (filters.recruiterId) {
            list = list.filter(d => d.recruiterId === filters.recruiterId);
        }
        if (filters.search) {
            const q = filters.search.toLowerCase();
            list = list.filter(d => d.jobRole.toLowerCase().includes(q) ||
                d.companyName?.toLowerCase().includes(q) ||
                d.jobDescription.toLowerCase().includes(q));
        }
        const total = list.length;
        const offset = filters.offset || 0;
        const limit = filters.limit || 50;
        const paginated = list.slice(offset, offset + limit);
        return { total, drives: paginated };
    }
    static async getDriveById(driveId) {
        const drive = dataStore_1.db.drives.get(driveId);
        if (!drive)
            throw { status: 404, message: 'Drive not found.' };
        const company = dataStore_1.db.companies.get(drive.companyId);
        const applicantCount = Array.from(dataStore_1.db.applications.values()).filter(a => a.driveId === driveId).length;
        return {
            ...drive,
            company,
            applicantCount,
        };
    }
}
exports.DriveService = DriveService;
