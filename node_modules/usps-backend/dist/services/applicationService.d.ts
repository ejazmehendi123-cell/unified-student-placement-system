import { Application, ApplicationStatus } from '../types';
import { Request } from 'express';
export declare class ApplicationService {
    static apply(userId: string, driveId: string, req?: Request): Promise<Application>;
    static withdraw(userId: string, applicationId: string, req?: Request): Promise<Application>;
    static updateStatus(applicationId: string, newStatus: ApplicationStatus, actorUserId: string, reason?: string, req?: Request): Promise<Application>;
    static getStudentApplications(userId: string): Promise<{
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
        history: import("../types").ApplicationStatusHistory[];
        interview: import("../types").InterviewRound | undefined;
        offer: import("../types").Offer | undefined;
        id: string;
        studentId: string;
        driveId: string;
        status: ApplicationStatus;
        appliedAt: string;
        withdrawnAt?: string;
        createdAt: string;
        updatedAt: string;
        student?: import("../types").Student & {
            profile?: import("../types").UserProfile;
        };
    }[]>;
    static getDriveApplicants(driveId: string, actorUserId: string, filters?: any): Promise<{
        total: number;
        applicants: {
            student: {
                id: string;
                rollNumber: string;
                branch: string;
                department: string;
                cgpa: number;
                backlogCount: number;
                isPlaced: boolean;
                resumeUrl: string | undefined;
                fullName: string;
                email: string | undefined;
                phone: string | undefined;
                skills: import("../types").StudentSkill[];
            } | undefined;
            interview: import("../types").InterviewRound | undefined;
            offer: import("../types").Offer | undefined;
            id: string;
            studentId: string;
            driveId: string;
            status: ApplicationStatus;
            appliedAt: string;
            withdrawnAt?: string;
            createdAt: string;
            updatedAt: string;
            drive?: import("../types").PlacementDrive & {
                company?: import("../types").Company;
            };
        }[];
    }>;
}
