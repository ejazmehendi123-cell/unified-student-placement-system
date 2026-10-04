import { Offer, Placement } from '../types';
import { Request } from 'express';
export declare class OfferService {
    static issueOffer(userId: string, data: any, req?: Request): Promise<Offer>;
    static acceptOffer(offerId: string, userId: string, req?: Request): Promise<{
        offer: Offer;
        placement: Placement;
    }>;
    static declineOffer(offerId: string, userId: string, reason?: string, req?: Request): Promise<Offer>;
    static getStudentOffers(userId: string): Promise<{
        drive: {
            company: import("../types").Company | undefined;
            id: string;
            companyId: string;
            companyName?: string;
            recruiterId: string;
            jobRole: string;
            jobDescription: string;
            packageMin: number;
            packageMax: number;
            packageCurrency: string;
            minCgpa: number;
            maxBacklogs: number;
            eligibleBranches: string[];
            applicationDeadline: string;
            driveDate?: string;
            status: import("../types").DriveStatus;
            rejectionReason?: string;
            approvedBy?: string;
            approvedAt?: string;
            createdBy?: string;
            updatedBy?: string;
            createdAt: string;
            updatedAt: string;
        } | undefined;
        id: string;
        applicationId: string;
        packageOffered: number;
        currency: string;
        offerDate: string;
        offerDocumentId?: string;
        status: import("../types").OfferStatus;
        acceptedAt?: string;
        declinedAt?: string;
        declineReason?: string;
        createdAt: string;
        updatedAt: string;
        application?: import("../types").Application;
    }[]>;
}
