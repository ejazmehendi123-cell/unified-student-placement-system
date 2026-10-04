"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sisSyncBatchSchema = exports.sisSyncRecordSchema = exports.policyOverrideSchema = exports.eligibilityOverrideSchema = exports.declineOfferSchema = exports.createOfferSchema = exports.scheduleInterviewSchema = exports.updateApplicationStatusSchema = exports.applyDriveSchema = exports.rejectDriveSchema = exports.updateDriveSchema = exports.createDriveSchema = exports.addCertificationSchema = exports.addProjectSchema = exports.addSkillSchema = exports.updateStudentProfileSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Auth Validators
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Valid email address is required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Valid email is required'),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
// Student Profile Validators
exports.updateStudentProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name is required').optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    passingYear: zod_1.z.number().int().min(2020).max(2035).optional(),
    branch: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    cgpa: zod_1.z.number().min(0).max(10).optional(),
    backlogCount: zod_1.z.number().int().min(0).optional(),
});
exports.addSkillSchema = zod_1.z.object({
    skillName: zod_1.z.string().min(1, 'Skill name is required').max(100),
    skillLevel: zod_1.z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
});
exports.addProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Project title is required').max(255),
    description: zod_1.z.string().min(10, 'Project description must be at least 10 characters'),
    technologies: zod_1.z.array(zod_1.z.string()).default([]),
    projectUrl: zod_1.z.string().url('Invalid URL').optional().or(zod_1.z.literal('')),
    githubUrl: zod_1.z.string().url('Invalid GitHub URL').optional().or(zod_1.z.literal('')),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
});
exports.addCertificationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Certification name is required'),
    issuer: zod_1.z.string().min(2, 'Issuer name is required'),
    issueDate: zod_1.z.string().min(1, 'Issue date is required'),
    credentialUrl: zod_1.z.string().url('Invalid credential URL').optional().or(zod_1.z.literal('')),
});
// Placement Drive Wizard Validators
exports.createDriveSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(2, 'Company name is required'),
    jobRole: zod_1.z.string().min(2, 'Job role is required'),
    jobDescription: zod_1.z.string().min(20, 'Job description must be comprehensive (min 20 characters)'),
    packageMin: zod_1.z.number().min(0, 'Minimum package must be >= 0'),
    packageMax: zod_1.z.number().min(0.1, 'Maximum package must be > 0'),
    packageCurrency: zod_1.z.string().default('INR (LPA)'),
    minCgpa: zod_1.z.number().min(0).max(10, 'Min CGPA must be between 0 and 10'),
    maxBacklogs: zod_1.z.number().int().min(0, 'Max backlogs must be >= 0'),
    eligibleBranches: zod_1.z.array(zod_1.z.string()).min(1, 'Select at least one eligible branch'),
    applicationDeadline: zod_1.z.string().min(1, 'Application deadline is required'),
    driveDate: zod_1.z.string().optional(),
    isDraft: zod_1.z.boolean().default(false),
});
exports.updateDriveSchema = exports.createDriveSchema.partial();
exports.rejectDriveSchema = zod_1.z.object({
    reason: zod_1.z.string().min(5, 'Rejection reason must be provided (min 5 characters)'),
});
// Application Validators
exports.applyDriveSchema = zod_1.z.object({
    driveId: zod_1.z.string().min(1, 'Drive ID is required'),
});
exports.updateApplicationStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'SUBMITTED',
        'SHORTLISTED',
        'INTERVIEW_SCHEDULED',
        'OFFERED',
        'ACCEPTED',
        'DECLINED',
        'REJECTED',
        'WITHDRAWN',
        'PLACED'
    ]),
    reason: zod_1.z.string().optional(),
});
// Interview Validators
exports.scheduleInterviewSchema = zod_1.z.object({
    applicationId: zod_1.z.string().min(1, 'Application ID is required'),
    roundNumber: zod_1.z.number().int().min(1).default(1),
    roundType: zod_1.z.string().min(2, 'Round type is required (e.g. Technical Round 1)'),
    scheduledAt: zod_1.z.string().min(1, 'Interview date & time is required'),
    mode: zod_1.z.enum(['ONLINE', 'OFFLINE']),
    venue: zod_1.z.string().optional(),
    meetingUrl: zod_1.z.string().url('Invalid meeting URL').optional().or(zod_1.z.literal('')),
    notes: zod_1.z.string().optional(),
    studentInstructions: zod_1.z.string().optional(),
});
// Offer Validators
exports.createOfferSchema = zod_1.z.object({
    applicationId: zod_1.z.string().min(1, 'Application ID is required'),
    packageOffered: zod_1.z.number().min(0.1, 'Offered package must be positive'),
    currency: zod_1.z.string().default('INR (LPA)'),
    offerDate: zod_1.z.string().optional(),
});
exports.declineOfferSchema = zod_1.z.object({
    reason: zod_1.z.string().optional(),
});
// Admin Overrides & Policies
exports.eligibilityOverrideSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1, 'Student ID is required'),
    driveId: zod_1.z.string().min(1, 'Drive ID is required'),
    reason: zod_1.z.string().min(5, 'Administrative justification is mandatory for audit compliance'),
});
exports.policyOverrideSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1, 'Student ID is required'),
    policyName: zod_1.z.string().default('SINGLE_OFFER_POLICY'),
    reason: zod_1.z.string().min(5, 'Administrative justification is mandatory for policy exception'),
});
// SIS Sync Schema
exports.sisSyncRecordSchema = zod_1.z.object({
    rollNumber: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    branch: zod_1.z.string().min(1),
    cgpa: zod_1.z.number().min(0).max(10),
    backlogCount: zod_1.z.number().int().min(0),
});
exports.sisSyncBatchSchema = zod_1.z.object({
    students: zod_1.z.array(exports.sisSyncRecordSchema),
});
