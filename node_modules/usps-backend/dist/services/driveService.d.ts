import { PlacementDrive, DriveStatus } from '../types';
import { Request } from 'express';
export declare class DriveService {
    static createDrive(userId: string, data: any, req?: Request): Promise<PlacementDrive>;
    static updateDrive(driveId: string, userId: string, data: any, req?: Request): Promise<PlacementDrive>;
    static approveDrive(driveId: string, adminUserId: string, req?: Request): Promise<PlacementDrive>;
    static rejectDrive(driveId: string, adminUserId: string, reason: string, req?: Request): Promise<PlacementDrive>;
    static listDrives(filters: {
        status?: string;
        branch?: string;
        search?: string;
        minCgpa?: number;
        recruiterId?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        total: number;
        drives: PlacementDrive[];
    }>;
    static getDriveById(driveId: string): Promise<{
        company: import("../types").Company | undefined;
        applicantCount: number;
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
        status: DriveStatus;
        rejectionReason?: string;
        approvedBy?: string;
        approvedAt?: string;
        createdBy?: string;
        updatedBy?: string;
        createdAt: string;
        updatedAt: string;
    }>;
}
