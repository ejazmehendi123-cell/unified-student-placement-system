import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
}, {
    token: string;
    newPassword: string;
}>;
export declare const updateStudentProfileSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodString>;
    passingYear: z.ZodOptional<z.ZodNumber>;
    branch: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    cgpa: z.ZodOptional<z.ZodNumber>;
    backlogCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    fullName?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    gender?: string | undefined;
    passingYear?: number | undefined;
    branch?: string | undefined;
    department?: string | undefined;
    cgpa?: number | undefined;
    backlogCount?: number | undefined;
}, {
    fullName?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    gender?: string | undefined;
    passingYear?: number | undefined;
    branch?: string | undefined;
    department?: string | undefined;
    cgpa?: number | undefined;
    backlogCount?: number | undefined;
}>;
export declare const addSkillSchema: z.ZodObject<{
    skillName: z.ZodString;
    skillLevel: z.ZodEnum<["Beginner", "Intermediate", "Advanced", "Expert"]>;
}, "strip", z.ZodTypeAny, {
    skillName: string;
    skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}, {
    skillName: string;
    skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}>;
export declare const addProjectSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    technologies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    projectUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    githubUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    technologies: string[];
    projectUrl?: string | undefined;
    githubUrl?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    title: string;
    description: string;
    technologies?: string[] | undefined;
    projectUrl?: string | undefined;
    githubUrl?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const addCertificationSchema: z.ZodObject<{
    name: z.ZodString;
    issuer: z.ZodString;
    issueDate: z.ZodString;
    credentialUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    issuer: string;
    issueDate: string;
    credentialUrl?: string | undefined;
}, {
    name: string;
    issuer: string;
    issueDate: string;
    credentialUrl?: string | undefined;
}>;
export declare const createDriveSchema: z.ZodObject<{
    companyName: z.ZodString;
    jobRole: z.ZodString;
    jobDescription: z.ZodString;
    packageMin: z.ZodNumber;
    packageMax: z.ZodNumber;
    packageCurrency: z.ZodDefault<z.ZodString>;
    minCgpa: z.ZodNumber;
    maxBacklogs: z.ZodNumber;
    eligibleBranches: z.ZodArray<z.ZodString, "many">;
    applicationDeadline: z.ZodString;
    driveDate: z.ZodOptional<z.ZodString>;
    isDraft: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    jobRole: string;
    companyName: string;
    jobDescription: string;
    packageMin: number;
    packageMax: number;
    packageCurrency: string;
    minCgpa: number;
    maxBacklogs: number;
    eligibleBranches: string[];
    applicationDeadline: string;
    isDraft: boolean;
    driveDate?: string | undefined;
}, {
    jobRole: string;
    companyName: string;
    jobDescription: string;
    packageMin: number;
    packageMax: number;
    minCgpa: number;
    maxBacklogs: number;
    eligibleBranches: string[];
    applicationDeadline: string;
    packageCurrency?: string | undefined;
    driveDate?: string | undefined;
    isDraft?: boolean | undefined;
}>;
export declare const updateDriveSchema: z.ZodObject<{
    companyName: z.ZodOptional<z.ZodString>;
    jobRole: z.ZodOptional<z.ZodString>;
    jobDescription: z.ZodOptional<z.ZodString>;
    packageMin: z.ZodOptional<z.ZodNumber>;
    packageMax: z.ZodOptional<z.ZodNumber>;
    packageCurrency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    minCgpa: z.ZodOptional<z.ZodNumber>;
    maxBacklogs: z.ZodOptional<z.ZodNumber>;
    eligibleBranches: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    applicationDeadline: z.ZodOptional<z.ZodString>;
    driveDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isDraft: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    jobRole?: string | undefined;
    companyName?: string | undefined;
    jobDescription?: string | undefined;
    packageMin?: number | undefined;
    packageMax?: number | undefined;
    packageCurrency?: string | undefined;
    minCgpa?: number | undefined;
    maxBacklogs?: number | undefined;
    eligibleBranches?: string[] | undefined;
    applicationDeadline?: string | undefined;
    driveDate?: string | undefined;
    isDraft?: boolean | undefined;
}, {
    jobRole?: string | undefined;
    companyName?: string | undefined;
    jobDescription?: string | undefined;
    packageMin?: number | undefined;
    packageMax?: number | undefined;
    packageCurrency?: string | undefined;
    minCgpa?: number | undefined;
    maxBacklogs?: number | undefined;
    eligibleBranches?: string[] | undefined;
    applicationDeadline?: string | undefined;
    driveDate?: string | undefined;
    isDraft?: boolean | undefined;
}>;
export declare const rejectDriveSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
export declare const applyDriveSchema: z.ZodObject<{
    driveId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    driveId: string;
}, {
    driveId: string;
}>;
export declare const updateApplicationStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["SUBMITTED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "OFFERED", "ACCEPTED", "DECLINED", "REJECTED", "WITHDRAWN", "PLACED"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "REJECTED" | "SUBMITTED" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "OFFERED" | "ACCEPTED" | "DECLINED" | "WITHDRAWN" | "PLACED";
    reason?: string | undefined;
}, {
    status: "REJECTED" | "SUBMITTED" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "OFFERED" | "ACCEPTED" | "DECLINED" | "WITHDRAWN" | "PLACED";
    reason?: string | undefined;
}>;
export declare const scheduleInterviewSchema: z.ZodObject<{
    applicationId: z.ZodString;
    roundNumber: z.ZodDefault<z.ZodNumber>;
    roundType: z.ZodString;
    scheduledAt: z.ZodString;
    mode: z.ZodEnum<["ONLINE", "OFFLINE"]>;
    venue: z.ZodOptional<z.ZodString>;
    meetingUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    notes: z.ZodOptional<z.ZodString>;
    studentInstructions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    roundNumber: number;
    applicationId: string;
    roundType: string;
    scheduledAt: string;
    mode: "ONLINE" | "OFFLINE";
    venue?: string | undefined;
    meetingUrl?: string | undefined;
    notes?: string | undefined;
    studentInstructions?: string | undefined;
}, {
    applicationId: string;
    roundType: string;
    scheduledAt: string;
    mode: "ONLINE" | "OFFLINE";
    roundNumber?: number | undefined;
    venue?: string | undefined;
    meetingUrl?: string | undefined;
    notes?: string | undefined;
    studentInstructions?: string | undefined;
}>;
export declare const createOfferSchema: z.ZodObject<{
    applicationId: z.ZodString;
    packageOffered: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    offerDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    applicationId: string;
    packageOffered: number;
    currency: string;
    offerDate?: string | undefined;
}, {
    applicationId: string;
    packageOffered: number;
    currency?: string | undefined;
    offerDate?: string | undefined;
}>;
export declare const declineOfferSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
export declare const eligibilityOverrideSchema: z.ZodObject<{
    studentId: z.ZodString;
    driveId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    driveId: string;
    studentId: string;
    reason: string;
}, {
    driveId: string;
    studentId: string;
    reason: string;
}>;
export declare const policyOverrideSchema: z.ZodObject<{
    studentId: z.ZodString;
    policyName: z.ZodDefault<z.ZodString>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    studentId: string;
    reason: string;
    policyName: string;
}, {
    studentId: string;
    reason: string;
    policyName?: string | undefined;
}>;
export declare const sisSyncRecordSchema: z.ZodObject<{
    rollNumber: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    branch: z.ZodString;
    cgpa: z.ZodNumber;
    backlogCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    email: string;
    branch: string;
    cgpa: number;
    backlogCount: number;
    name: string;
    rollNumber: string;
}, {
    email: string;
    branch: string;
    cgpa: number;
    backlogCount: number;
    name: string;
    rollNumber: string;
}>;
export declare const sisSyncBatchSchema: z.ZodObject<{
    students: z.ZodArray<z.ZodObject<{
        rollNumber: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        branch: z.ZodString;
        cgpa: z.ZodNumber;
        backlogCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        email: string;
        branch: string;
        cgpa: number;
        backlogCount: number;
        name: string;
        rollNumber: string;
    }, {
        email: string;
        branch: string;
        cgpa: number;
        backlogCount: number;
        name: string;
        rollNumber: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    students: {
        email: string;
        branch: string;
        cgpa: number;
        backlogCount: number;
        name: string;
        rollNumber: string;
    }[];
}, {
    students: {
        email: string;
        branch: string;
        cgpa: number;
        backlogCount: number;
        name: string;
        rollNumber: string;
    }[];
}>;
