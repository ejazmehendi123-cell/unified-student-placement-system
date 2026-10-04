import { db } from '../repositories/dataStore';
import { Offer, Placement } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';
import { Request } from 'express';

export class OfferService {
  public static async issueOffer(userId: string, data: any, req?: Request) {
    const app = db.applications.get(data.applicationId);
    if (!app) throw { status: 404, message: 'Application not found.' };

    const drive = db.drives.get(app.driveId);
    const recruiter = Array.from(db.recruiters.values()).find(r => r.userId === userId);
    const profile = db.profiles.get(userId);

    if (profile?.role !== 'tpo_admin' && drive?.recruiterId !== recruiter?.id) {
      throw { status: 403, message: 'Unauthorized to issue offer for this drive.' };
    }

    const offerId = uuidv4();
    const offer: Offer = {
      id: offerId,
      applicationId: app.id,
      packageOffered: Number(data.packageOffered),
      currency: data.currency || 'INR (LPA)',
      offerDate: data.offerDate || new Date().toISOString().split('T')[0],
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.offers.set(offerId, offer);

    // Update application status
    app.status = 'OFFERED';
    app.updatedAt = new Date().toISOString();

    const histories = db.statusHistories.get(app.id) || [];
    histories.push({
      id: uuidv4(),
      applicationId: app.id,
      oldStatus: 'INTERVIEW_SCHEDULED',
      newStatus: 'OFFERED',
      changedBy: userId,
      reason: `Offer extended: ${offer.packageOffered} ${offer.currency}`,
      createdAt: new Date().toISOString(),
    });

    await AuditService.logAction({
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
    const student = db.students.get(app.studentId);
    if (student) {
      await NotificationService.send({
        userId: student.userId,
        type: 'OFFER_RECEIVED',
        title: `Congratulations! Offer Received from ${drive?.companyName}`,
        message: `You have been extended an offer for "${drive?.jobRole}" at ${offer.packageOffered} ${offer.currency}. Please review and respond in your Offers tab.`,
        data: { offerId, driveId: drive?.id, packageOffered: offer.packageOffered },
      });
    }

    return offer;
  }

  public static async acceptOffer(offerId: string, userId: string, req?: Request) {
    const offer = db.offers.get(offerId);
    if (!offer) throw { status: 404, message: 'Offer record not found.' };

    if (offer.status !== 'PENDING') {
      throw { status: 400, message: `Offer cannot be accepted because it is already ${offer.status}.` };
    }

    const app = db.applications.get(offer.applicationId);
    if (!app) throw { status: 404, message: 'Application not found.' };

    const student = db.students.get(app.studentId);
    if (!student || student.userId !== userId) {
      throw { status: 403, message: 'Unauthorized: You can only accept offers issued to yourself.' };
    }

    // Check Single Offer Policy
    const policyOverrideKey = `${student.id}_SINGLE_OFFER_POLICY`;
    const hasOverride = db.policyOverrides.has(policyOverrideKey);
    if (student.isPlaced && !hasOverride) {
      throw {
        status: 400,
        message: 'University Single-Offer Policy Violation: You have already accepted another placement offer.',
      };
    }

    const drive = db.drives.get(app.driveId);

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
    const placementId = uuidv4();
    const placement: Placement = {
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
    db.placements.set(placementId, placement);

    // 5. Auto-withdraw any other pending offers for this student
    const allStudentApps = Array.from(db.applications.values()).filter(a => a.studentId === student.id);
    for (const otherApp of allStudentApps) {
      const otherOffer = Array.from(db.offers.values()).find(
        o => o.applicationId === otherApp.id && o.id !== offer.id && o.status === 'PENDING'
      );
      if (otherOffer) {
        otherOffer.status = 'WITHDRAWN';
        otherOffer.declineReason = `Auto-withdrawn due to acceptance of offer from ${drive?.companyName}`;
        otherOffer.updatedAt = new Date().toISOString();
      }
    }

    // Status History
    const histories = db.statusHistories.get(app.id) || [];
    histories.push({
      id: uuidv4(),
      applicationId: app.id,
      oldStatus: 'OFFERED',
      newStatus: 'ACCEPTED',
      changedBy: userId,
      reason: 'Offer accepted by student. Placed status confirmed.',
      createdAt: new Date().toISOString(),
    });

    // Audit Log
    await AuditService.logAction({
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
      const recruiter = db.recruiters.get(drive.recruiterId);
      if (recruiter) {
        const studentProfile = db.profiles.get(student.userId);
        await NotificationService.send({
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

  public static async declineOffer(offerId: string, userId: string, reason?: string, req?: Request) {
    const offer = db.offers.get(offerId);
    if (!offer) throw { status: 404, message: 'Offer record not found.' };

    if (offer.status !== 'PENDING') {
      throw { status: 400, message: `Offer cannot be declined because status is ${offer.status}.` };
    }

    const app = db.applications.get(offer.applicationId);
    const student = app ? db.students.get(app.studentId) : undefined;

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

    await AuditService.logAction({
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

  public static async getStudentOffers(userId: string) {
    const student = Array.from(db.students.values()).find(s => s.userId === userId);
    if (!student) throw { status: 404, message: 'Student record not found.' };

    const studentAppIds = Array.from(db.applications.values())
      .filter(a => a.studentId === student.id)
      .map(a => a.id);

    const offers = Array.from(db.offers.values())
      .filter(o => studentAppIds.includes(o.applicationId))
      .map(o => {
        const app = db.applications.get(o.applicationId);
        const drive = app ? db.drives.get(app.driveId) : undefined;
        const company = drive ? db.companies.get(drive.companyId) : undefined;
        return {
          ...o,
          drive: drive ? { ...drive, company } : undefined,
        };
      });

    return offers;
  }
}
