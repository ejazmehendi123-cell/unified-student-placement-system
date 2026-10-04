export type UserRole = 'student' | 'recruiter' | 'tpo_admin' | 'leadership';
export type DriveStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'OPEN' | 'REJECTED' | 'CLOSED';
export type ApplicationStatus = 'SUBMITTED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'ACCEPTED' | 'DECLINED' | 'REJECTED' | 'WITHDRAWN' | 'PLACED';
export type InterviewMode = 'ONLINE' | 'OFFLINE';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';
export type PlacementStatus = 'UNPLACED' | 'PLACED' | 'OPTED_OUT';
export type DocumentType = 'RESUME' | 'OFFER_LETTER' | 'NOC' | 'CLEARANCE_CERTIFICATE' | 'COMPANY_LOGO' | 'OTHER';
export type NotificationType = 'APPLICATION_SUBMITTED' | 'APPLICATION_SHORTLISTED' | 'APPLICATION_REJECTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW_UPDATED' | 'OFFER_RECEIVED' | 'OFFER_ACCEPTED' | 'OFFER_DECLINED' | 'DRIVE_APPROVED' | 'DRIVE_REJECTED' | 'SYSTEM';
export interface UserProfile {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
    phone?: string;
    isActive: boolean;
    mfaEnabled?: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Student {
    id: string;
    userId: string;
    rollNumber: string;
    branch: string;
    department: string;
    cgpa: number;
    backlogCount: number;
    profileStatus: 'INCOMPLETE' | 'COMPLETE';
    isPlaced: boolean;
    placementStatus: PlacementStatus;
    resumeDocumentId?: string;
    resumeUrl?: string;
    gender?: string;
    passingYear: number;
    address?: string;
    createdAt: string;
    updatedAt: string;
}
export interface StudentAcademic {
    id: string;
    studentId: string;
    degree: string;
    department: string;
    branch: string;
    semester: number;
    sgpa: number;
    backlogCount: number;
    academicYear: string;
    source: 'STUDENT_PORTAL' | 'SIS_IMPORT';
    createdAt: string;
    updatedAt: string;
}
export interface StudentSkill {
    id: string;
    studentId: string;
    skillName: string;
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    createdAt: string;
}
export interface StudentProject {
    id: string;
    studentId: string;
    title: string;
    description: string;
    technologies: string[];
    projectUrl?: string;
    githubUrl?: string;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
}
export interface StudentCertification {
    id: string;
    studentId: string;
    name: string;
    issuer: string;
    issueDate: string;
    credentialUrl?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Company {
    id: string;
    name: string;
    industry: string;
    website?: string;
    description?: string;
    logoDocumentId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface Recruiter {
    id: string;
    userId: string;
    companyId?: string;
    companyName: string;
    contactPerson: string;
    phone?: string;
    designation?: string;
    isVerified: boolean;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
    createdAt: string;
    updatedAt: string;
}
export interface PlacementDrive {
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
}
export interface Application {
    id: string;
    studentId: string;
    driveId: string;
    status: ApplicationStatus;
    appliedAt: string;
    withdrawnAt?: string;
    createdAt: string;
    updatedAt: string;
    student?: Student & {
        profile?: UserProfile;
    };
    drive?: PlacementDrive & {
        company?: Company;
    };
}
export interface ApplicationStatusHistory {
    id: string;
    applicationId: string;
    oldStatus?: ApplicationStatus;
    newStatus: ApplicationStatus;
    changedBy?: string;
    reason?: string;
    createdAt: string;
}
export interface InterviewRound {
    id: string;
    applicationId: string;
    roundNumber: number;
    roundType: string;
    scheduledAt: string;
    mode: InterviewMode;
    venue?: string;
    meetingUrl?: string;
    status: InterviewStatus;
    notes?: string;
    studentInstructions?: string;
    createdAt: string;
    updatedAt: string;
    application?: Application;
}
export interface Offer {
    id: string;
    applicationId: string;
    packageOffered: number;
    currency: string;
    offerDate: string;
    offerDocumentId?: string;
    status: OfferStatus;
    acceptedAt?: string;
    declinedAt?: string;
    declineReason?: string;
    createdAt: string;
    updatedAt: string;
    application?: Application;
}
export interface Placement {
    id: string;
    studentId: string;
    applicationId: string;
    offerId: string;
    companyId: string;
    jobRole: string;
    package: number;
    placementDate: string;
    status: 'PLACED' | 'REVOKED';
    createdAt: string;
    updatedAt: string;
    student?: Student;
    company?: Company;
}
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}
export interface AuditLog {
    id: string;
    actorUserId?: string;
    actorRole: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldData?: Record<string, any>;
    newData?: Record<string, any>;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}
export interface EligibilityResult {
    eligible: boolean;
    cgpaCheck: boolean;
    backlogCheck: boolean;
    branchCheck: boolean;
    profileCheck: boolean;
    placementPolicyCheck: boolean;
    deadlineCheck: boolean;
    statusCheck: boolean;
    isOverridden?: boolean;
    reason: string;
}
export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
    studentId?: string;
    recruiterId?: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
        requestId?: string;
    };
    error?: {
        code: string;
        message: string;
        requestId?: string;
        details?: any;
    };
}
