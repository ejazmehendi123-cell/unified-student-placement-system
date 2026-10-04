"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferService = void 0;
const dataStore_1 = require("../repositories/dataStore");
const uuid_1 = require("uuid");
const auditService_1 = require("./auditService");
const notificationService_1 = require("./notificationService");
class OfferService {
    static async issueOffer(userId, data, req) {
        const app = dataStore_1.db.applications.get(data.applicationId);
        if (!app)
            throw { status: 404, message: 'Application not found.' };
        const drive = dataStore_1.db.drives.get(app.driveId);
        const recruiter = Array.from(dataStore_1.db.recruiters.values()).find(r => r.userId === userId);
        const profile = dataStore_1.db.profiles.get(userId);
        if (profile?.role !== 'tpo_admin' && drive?.recruiterId !== recruiter?.id) {
            throw { status: 403, message: 'Unauthorized to issue offer for this drive.' };
        }
        const offerId = (0, uuid_1.v4)();
        const offer = {
            id: offerId,
            applicationId: app.id,
            packageOffered: Number(data.packageOffered),
            currency: data.currency || 'INR (LPA)',
            offerDate: data.offerDate || new Date().toISOString().split('T')[0],
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        dataStore_1.db.offers.set(offerId, offer);
        // Update application status
        app.status = 'OFFERED';
        app.updatedAt = new Date().toISOString();
        const histories = dataStore_1.db.statusHistories.get(app.id) || [];
        histories.push({
            id: (0, uuid_1.v4)(),
            applicationId: app.id,
            oldStatus: 'INTERVIEW_SCHEDULED',
            newStatus: 'OFFERED',
            changedBy: userId,
            reason: `Offer extended: ${offer.packageOffered} ${offer.currency}`,
            createdAt: new Date().toISOString(),
        });
        await auditService_1.AuditService.logAction({
            actorUserId: userId,
            actorRole: profile?.role || 'recruiter',
            action: 'OFFER_ISSUED',
            entityType: 'offers',
            entityId: offerId,
            newData: { packageOffered: offer.packageOffered, currency: offer.currency },
            reason: 'Recruiter extended placement offer to candidate',
            req,
        });
        // Notify Student
        const student = dataStore_1.db.students.get(app.studentId);
        if (student) {
            await notificationService_1.NotificationService.send({
                userId: student.userId,
                type: 'OFFER_RECEIVED',
                title: `Congratulations! Offer Received from ${drive?.companyName}`,
                message: `You have been extended an offer for "${drive?.jobRole}" at ${offer.packageOffered} ${offer.currency}. Please review and respond in your Offers tab.`,
                data: { offerId, driveId: drive?.id, packageOffered: offer.packageOffered },
            });
        }
        return offer;
    }
    static async acceptOffer(offerId, userId, req) {
        const offer = dataStore_1.db.offers.get(offerId);
        if (!offer)
            throw { status: 404, message: 'Offer record not found.' };
        if (offer.status !== 'PENDING') {
            throw { status: 400, message: `Offer cannot be accepted because it is already ${offer.status}.` };
        }
        const app = dataStore_1.db.applications.get(offer.applicationId);
        if (!app)
            throw { status: 404, message: 'Application not found.' };
        const student = dataStore_1.db.students.get(app.studentId);
        if (!student || student.userId !== userId) {
            throw { status: 403, message: 'Unauthorized: You can only accept offers issued to yourself.' };
        }
        // Check Single Offer Policy
        const policyOverrideKey = `${student.id}_SINGLE_OFFER_POLICY`;
        const hasOverride = dataStore_1.db.policyOverrides.has(policyOverrideKey);
        if (student.isPlaced && !hasOverride) {
            throw {
                status: 400,
                message: 'University Single-Offer Policy Violation: You have already accepted another placement offer.',
            };
        }
        const drive = dataStore_1.db.drives.get(app.driveId);
        // 1. Mark this offer as ACCEPTED
        offer.status = 'ACCEPTED';
        offer.acceptedAt = new Date().toISOString();
        offer.updatedAt = new Date().toISOString();
        // 2. Mark this application as ACCEPTED / PLACED
        app.status = 'ACCEPTED';
        app.updatedAt = new Date().toISOString();
        // 3. Mark student as PLACED
        student.isPlaced = true;
        student.placementStatus = 'PLACED';
        student.updatedAt = new Date().toISOString();
        // 4. Create Placement Record
        const placementId = (0, uuid_1.v4)();
        const placement = {
            id: placementId,
            studentId: student.id,
            applicationId: app.id,
            offerId: offer.id,
            companyId: drive?.companyId || 'c0000001-0000-0000-0000-000000000001',
            jobRole: drive?.jobRole || 'Engineer',
            package: offer.packageOffered,
            placementDate: new Date().toISOString().split('T')[0],
            status: 'PLACED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        dataStore_1.db.placements.set(placementId, placement);
        // 5. Auto-withdraw any other pending offers for this student
        const allStudentApps = Array.from(dataStore_1.db.applications.values()).filter(a => a.studentId === student.id);
        for (const otherApp of allStudentApps) {
            const otherOffer = Array.from(dataStore_1.db.offers.values()).find(o => o.applicationId === otherApp.id && o.id !== offer.id && o.status === 'PENDING');
            if (otherOffer) {
                otherOffer.status = 'WITHDRAWN';
                otherOffer.declineReason = `Auto-withdrawn due to acceptance of offer from ${drive?.companyName}`;
                otherOffer.updatedAt = new Date().toISOString();
            }
        }
        // Status History
        const histories = dataStore_1.db.statusHistories.get(app.id) || [];
        histories.push({
            id: (0, uuid_1.v4)(),
            applicationId: app.id,
            oldStatus: 'OFFERED',
            newStatus: 'ACCEPTED',
            changedBy: userId,
            reason: 'Offer accepted by student. Placed status confirmed.',
            createdAt: new Date().toISOString(),
        });
        // Audit Log
        await auditService_1.AuditService.logAction({
            actorUserId: userId,
            actorRole: 'student',
            action: 'OFFER_ACCEPTED',
            entityType: 'offers',
            entityId: offer.id,
            newData: { package: offer.packageOffered, company: drive?.companyName, jobRole: drive?.jobRole },
            reason: 'Student accepted offer. Placement record generated.',
            req,
        });
        // Notify Recruiter
        if (drive) {
            const recruiter = dataStore_1.db.recruiters.get(drive.recruiterId);
            if (recruiter) {
                const studentProfile = dataStore_1.db.profiles.get(student.userId);
                await notificationService_1.NotificationService.send({
                    userId: recruiter.userId,
                    type: 'OFFER_ACCEPTED',
                    title: `Offer Accepted: ${studentProfile?.fullName}`,
                    message: `${studentProfile?.fullName} (${student.rollNumber}) has officially ACCEPTED your offer for "${drive.jobRole}".`,
                    data: { offerId, driveId: drive.id, studentId: student.id },
                });
            }
        }
        return { offer, placement };
    }
    static async declineOffer(offerId, userId, reason, req) {
        const offer = dataStore_1.db.offers.get(offerId);
        if (!offer)
            throw { status: 404, message: 'Offer record not found.' };
        if (offer.status !== 'PENDING') {
            throw { status: 400, message: `Offer cannot be declined because status is ${offer.status}.` };
        }
        const app = dataStore_1.db.applications.get(offer.applicationId);
        const student = app ? dataStore_1.db.students.get(app.studentId) : undefined;
        if (!student || student.userId !== userId) {
            throw { status: 403, message: 'Unauthorized: You can only decline offers issued to yourself.' };
        }
        offer.status = 'DECLINED';
        offer.declinedAt = new Date().toISOString();
        offer.declineReason = reason || 'Declined by candidate';
        offer.updatedAt = new Date().toISOString();
        if (app) {
            app.status = 'DECLINED';
            app.updatedAt = new Date().toISOString();
        }
        await auditService_1.AuditService.logAction({
            actorUserId: userId,
            actorRole: 'student',
            action: 'OFFER_DECLINED',
            entityType: 'offers',
            entityId: offer.id,
            reason: reason || 'Student declined offer',
            req,
        });
        return offer;
    }
    static async getStudentOffers(userId) {
        const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === userId);
        if (!student)
            throw { status: 404, message: 'Student record not found.' };
        const studentAppIds = Array.from(dataStore_1.db.applications.values())
            .filter(a => a.studentId === student.id)
            .map(a => a.id);
        const offers = Array.from(dataStore_1.db.offers.values())
            .filter(o => studentAppIds.includes(o.applicationId))
            .map(o => {
            const app = dataStore_1.db.applications.get(o.applicationId);
            const drive = app ? dataStore_1.db.drives.get(app.driveId) : undefined;
            const company = drive ? dataStore_1.db.companies.get(drive.companyId) : undefined;
            return {
                ...o,
                drive: drive ? { ...drive, company } : undefined,
            };
        });
        return offers;
    }
}
exports.OfferService = OfferService;
