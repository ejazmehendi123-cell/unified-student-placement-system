import { z } from 'zod';

// Auth Validators
export const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// Student Profile Validators
export const updateStudentProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
  passingYear: z.number().int().min(2020).max(2035).optional(),
  branch: z.string().optional(),
  department: z.string().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  backlogCount: z.number().int().min(0).optional(),
});

export const addSkillSchema = z.object({
  skillName: z.string().min(1, 'Skill name is required').max(100),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
});

export const addProjectSchema = z.object({
  title: z.string().min(2, 'Project title is required').max(255),
  description: z.string().min(10, 'Project description must be at least 10 characters'),
  technologies: z.array(z.string()).default([]),
  projectUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const addCertificationSchema = z.object({
  name: z.string().min(2, 'Certification name is required'),
  issuer: z.string().min(2, 'Issuer name is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  credentialUrl: z.string().url('Invalid credential URL').optional().or(z.literal('')),
});

// Placement Drive Wizard Validators
export const createDriveSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  jobRole: z.string().min(2, 'Job role is required'),
  jobDescription: z.string().min(20, 'Job description must be comprehensive (min 20 characters)'),
  packageMin: z.number().min(0, 'Minimum package must be >= 0'),
  packageMax: z.number().min(0.1, 'Maximum package must be > 0'),
  packageCurrency: z.string().default('INR (LPA)'),
  minCgpa: z.number().min(0).max(10, 'Min CGPA must be between 0 and 10'),
  maxBacklogs: z.number().int().min(0, 'Max backlogs must be >= 0'),
  eligibleBranches: z.array(z.string()).min(1, 'Select at least one eligible branch'),
  applicationDeadline: z.string().min(1, 'Application deadline is required'),
  driveDate: z.string().optional(),
  isDraft: z.boolean().default(false),
});

export const updateDriveSchema = createDriveSchema.partial();

export const rejectDriveSchema = z.object({
  reason: z.string().min(5, 'Rejection reason must be provided (min 5 characters)'),
});

// Application Validators
export const applyDriveSchema = z.object({
  driveId: z.string().min(1, 'Drive ID is required'),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
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
  reason: z.string().optional(),
});

// Interview Validators
export const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  roundNumber: z.number().int().min(1).default(1),
  roundType: z.string().min(2, 'Round type is required (e.g. Technical Round 1)'),
  scheduledAt: z.string().min(1, 'Interview date & time is required'),
  mode: z.enum(['ONLINE', 'OFFLINE']),
  venue: z.string().optional(),
  meetingUrl: z.string().url('Invalid meeting URL').optional().or(z.literal('')),
  notes: z.string().optional(),
  studentInstructions: z.string().optional(),
});

// Offer Validators
export const createOfferSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  packageOffered: z.number().min(0.1, 'Offered package must be positive'),
  currency: z.string().default('INR (LPA)'),
  offerDate: z.string().optional(),
});

export const declineOfferSchema = z.object({
  reason: z.string().optional(),
});

// Admin Overrides & Policies
export const eligibilityOverrideSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  driveId: z.string().min(1, 'Drive ID is required'),
  reason: z.string().min(5, 'Administrative justification is mandatory for audit compliance'),
});

export const policyOverrideSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  policyName: z.string().default('SINGLE_OFFER_POLICY'),
  reason: z.string().min(5, 'Administrative justification is mandatory for policy exception'),
});

// SIS Sync Schema
export const sisSyncRecordSchema = z.object({
  rollNumber: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  branch: z.string().min(1),
  cgpa: z.number().min(0).max(10),
  backlogCount: z.number().int().min(0),
});

export const sisSyncBatchSchema = z.object({
  students: z.array(sisSyncRecordSchema),
});
