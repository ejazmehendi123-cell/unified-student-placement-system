import { UserProfile, Student, StudentAcademic, StudentSkill, StudentProject, StudentCertification, Company, Recruiter, PlacementDrive, Application, ApplicationStatusHistory, InterviewRound, Offer, Placement, Notification, AuditLog, DocumentType } from '../types';
export interface DocumentRecord {
    id: string;
    ownerUserId: string;
    documentType: DocumentType;
    storagePath: string;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    isPrivate: boolean;
    createdAt: string;
}
export interface EligibilityOverride {
    id: string;
    studentId: string;
    driveId: string;
    approvedBy: string;
    reason: string;
    createdAt: string;
}
export interface PolicyOverride {
    id: string;
    studentId: string;
    policyName: string;
    approvedBy: string;
    reason: string;
    createdAt: string;
}
declare class DataStore {
    profiles: Map<string, UserProfile>;
    userPasswords: Map<string, string>;
    students: Map<string, Student>;
    academics: Map<string, StudentAcademic[]>;
    skills: Map<string, StudentSkill[]>;
    projects: Map<string, StudentProject[]>;
    certifications: Map<string, StudentCertification[]>;
    companies: Map<string, Company>;
    recruiters: Map<string, Recruiter>;
    drives: Map<string, PlacementDrive>;
    applications: Map<string, Application>;
    statusHistories: Map<string, ApplicationStatusHistory[]>;
    interviewRounds: Map<string, InterviewRound>;
    offers: Map<string, Offer>;
    placements: Map<string, Placement>;
    notifications: Map<string, Notification>;
    auditLogs: AuditLog[];
    documents: Map<string, DocumentRecord>;
    eligibilityOverrides: Map<string, EligibilityOverride>;
    policyOverrides: Map<string, PolicyOverride>;
    constructor();
    seedInitialData(): void;
}
export declare const db: DataStore;
export {};
