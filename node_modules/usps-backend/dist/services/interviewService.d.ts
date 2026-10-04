import { InterviewRound } from '../types';
import { Request } from 'express';
export declare class InterviewService {
    static schedule(userId: string, data: any, req?: Request): Promise<InterviewRound>;
    static getStudentInterviews(userId: string): Promise<{
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
        roundNumber: number;
        roundType: string;
        scheduledAt: string;
        mode: import("../types").InterviewMode;
        venue?: string;
        meetingUrl?: string;
        status: import("../types").InterviewStatus;
        studentInstructions?: string;
        createdAt: string;
        updatedAt: string;
        application?: import("../types").Application;
    }[]>;
    static getRecruiterInterviews(userId: string): Promise<{
        drive: import("../types").PlacementDrive | undefined;
        student: {
            rollNumber: string;
            branch: string;
            cgpa: number;
            fullName: string | undefined;
            email: string | undefined;
        } | undefined;
        id: string;
        applicationId: string;
        roundNumber: number;
        roundType: string;
        scheduledAt: string;
        mode: import("../types").InterviewMode;
        venue?: string;
        meetingUrl?: string;
        status: import("../types").InterviewStatus;
        notes?: string;
        studentInstructions?: string;
        createdAt: string;
        updatedAt: string;
        application?: import("../types").Application;
    }[]>;
}
