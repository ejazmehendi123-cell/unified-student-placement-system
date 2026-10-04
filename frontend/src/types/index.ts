export type UserRole = 'student' | 'recruiter' | 'tpo_admin' | 'leadership';

export type DriveStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'OPEN' | 'REJECTED' | 'CLOSED';

export type ApplicationStatus = 
  | 'SUBMITTED' 
  | 'SHORTLISTED' 
  | 'INTERVIEW_SCHEDULED' 
  | 'OFFERED' 
  | 'ACCEPTED' 
  | 'DECLINED' 
  | 'REJECTED' 
  | 'WITHDRAWN' 
  | 'PLACED';

export type InterviewMode = 'ONLINE' | 'OFFLINE';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';
export type PlacementStatus = 'UNPLACED' | 'PLACED' | 'OPTED_OUT';

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
}

export interface StudentSkill {
  id: string;
  studentId: string;
  skillName: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
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
}

export interface StudentCertification {
  id: string;
  studentId: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website?: string;
  description?: string;
  isActive: boolean;
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
  createdAt: string;
  company?: Company;
  applicantCount?: number;
  shortlistedCount?: number;
  // Student drive listing extras
  eligibility?: EligibilityResult;
  applied?: boolean;
  applicationStatus?: ApplicationStatus;
}

export interface Application {
  id: string;
  studentId: string;
  driveId: string;
  status: ApplicationStatus;
  appliedAt: string;
  withdrawnAt?: string;
  student?: Student & {
    fullName?: string;
    email?: string;
    phone?: string;
    skills?: StudentSkill[];
  };
  drive?: PlacementDrive;
  history?: Array<{
    id: string;
    oldStatus?: ApplicationStatus;
    newStatus: ApplicationStatus;
    reason?: string;
    createdAt: string;
  }>;
  interview?: InterviewRound;
  offer?: Offer;
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
  drive?: PlacementDrive;
  student?: {
    rollNumber: string;
    branch: string;
    cgpa: number;
    fullName?: string;
    email?: string;
  };
}

export interface Offer {
  id: string;
  applicationId: string;
  packageOffered: number;
  currency: string;
  offerDate: string;
  status: OfferStatus;
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  drive?: PlacementDrive;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId?: string;
  actorRole: string;
  actorName?: string;
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

export interface PlacementSummary {
  totalStudents: number;
  registeredStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  placementRate: number;
  avgPackage: number;
  highestPackage: number;
  totalDrives: number;
  openDrives: number;
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
  acceptedOffers: number;
}
