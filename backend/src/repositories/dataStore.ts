import { 
  UserProfile, Student, StudentAcademic, StudentSkill, StudentProject, 
  StudentCertification, Company, Recruiter, PlacementDrive, Application, 
  ApplicationStatusHistory, InterviewRound, Offer, Placement, Notification, 
  AuditLog, DocumentType, ApplicationStatus
} from '../types';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

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

class DataStore {
  public profiles: Map<string, UserProfile> = new Map();
  public userPasswords: Map<string, string> = new Map(); // Secure hashed passwords
  public students: Map<string, Student> = new Map();
  public academics: Map<string, StudentAcademic[]> = new Map(); // studentId -> records
  public skills: Map<string, StudentSkill[]> = new Map(); // studentId -> records
  public projects: Map<string, StudentProject[]> = new Map(); // studentId -> records
  public certifications: Map<string, StudentCertification[]> = new Map(); // studentId -> records
  public companies: Map<string, Company> = new Map();
  public recruiters: Map<string, Recruiter> = new Map();
  public drives: Map<string, PlacementDrive> = new Map();
  public applications: Map<string, Application> = new Map();
  public statusHistories: Map<string, ApplicationStatusHistory[]> = new Map(); // applicationId -> records
  public interviewRounds: Map<string, InterviewRound> = new Map();
  public offers: Map<string, Offer> = new Map();
  public placements: Map<string, Placement> = new Map();
  public notifications: Map<string, Notification> = new Map();
  public auditLogs: AuditLog[] = [];
  public documents: Map<string, DocumentRecord> = new Map();
  public eligibilityOverrides: Map<string, EligibilityOverride> = new Map(); // key: studentId_driveId
  public policyOverrides: Map<string, PolicyOverride> = new Map(); // key: studentId_policyName

  constructor() {
    this.seedInitialData();
  }

  public seedInitialData() {
    const defaultPasswordHash = bcrypt.hashSync('DemoPass@2026', 10);

    // 1. Profiles & Passwords for Demo Users
    const demoUsers: UserProfile[] = [
      {
        id: 'a1111111-1111-1111-1111-111111111111',
        email: 'student@usps.demo',
        role: 'student',
        fullName: 'Aarav Sharma',
        phone: '+91 98765 43210',
        isActive: true,
        mfaEnabled: false,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'b2222222-2222-2222-2222-222222222222',
        email: 'recruiter@usps.demo',
        role: 'recruiter',
        fullName: 'Priya Deshmukh',
        phone: '+91 98123 45678',
        isActive: true,
        mfaEnabled: false,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'c3333333-3333-3333-3333-333333333333',
        email: 'admin@usps.demo',
        role: 'tpo_admin',
        fullName: 'Dr. Ramesh Sundaram (TPO Head)',
        phone: '+91 94440 12345',
        isActive: true,
        mfaEnabled: true,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'd4444444-4444-4444-4444-444444444444',
        email: 'leadership@usps.demo',
        role: 'leadership',
        fullName: 'Prof. K. Venkatesh (Dean of Academics)',
        phone: '+91 94440 98765',
        isActive: true,
        mfaEnabled: false,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'e5555555-5555-5555-5555-555555555555',
        email: 'ejazmehendi123@gmail.com',
        role: 'tpo_admin',
        fullName: 'Ejaz Mehendi',
        phone: '+91 00000 00000',
        isActive: true,
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    demoUsers.forEach(u => {
      this.profiles.set(u.id, u);
      this.userPasswords.set(u.email.toLowerCase(), defaultPasswordHash);
    });

    // 2. Companies
    const initialCompanies: Company[] = [
      {
        id: 'c0000001-0000-0000-0000-000000000001',
        name: 'Bharat Tech Innovations',
        industry: 'Enterprise Cloud & AI',
        website: 'https://bharattech.example.com',
        description: 'Pioneer Indian enterprise software provider creating scalable distributed systems and cloud solutions.',
        isActive: true,
        createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'c0000002-0000-0000-0000-000000000002',
        name: 'Indus Cyber Systems',
        industry: 'Cybersecurity & FinTech',
        website: 'https://induscyber.example.com',
        description: 'Fintech security architecture, zero-trust infrastructure, and cryptographic fraud detection platform.',
        isActive: true,
        createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'c0000003-0000-0000-0000-000000000003',
        name: 'Kaveri Semiconductor Labs',
        industry: 'VLSI & Embedded Systems',
        website: 'https://kaverisemi.example.com',
        description: 'Microelectronics research, ARM RISC-V processor architecture, and embedded IoT firmware development.',
        isActive: true,
        createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'c0000004-0000-0000-0000-000000000004',
        name: 'Garuda Dynamics Auto',
        industry: 'Automotive & Robotics',
        website: 'https://garudadynamics.example.com',
        description: 'Next-generation electric vehicle powertrains, CAN telemetry, and autonomous industrial robotic arms.',
        isActive: true,
        createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'c0000005-0000-0000-0000-000000000005',
        name: 'Setu Infrastructure & Energy',
        industry: 'Renewable Energy & Civil Systems',
        website: 'https://setuinfra.example.com',
        description: 'Resilient high-speed rail corridors, renewable microgrids, and BIM smart city engineering.',
        isActive: true,
        createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'c0000006-0000-0000-0000-000000000006',
        name: 'Vedic Health Analytics',
        industry: 'HealthTech & AI Diagnostics',
        website: 'https://vedichealth.example.com',
        description: 'Federated deep learning models for medical pathology imaging and clinical trials data processing.',
        isActive: true,
        createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    initialCompanies.forEach(c => this.companies.set(c.id, c));

    // 3. Recruiters
    const demoRecruiter: Recruiter = {
      id: 'r0000001-0000-0000-0000-000000000001',
      userId: 'b2222222-2222-2222-2222-222222222222',
      companyId: 'c0000001-0000-0000-0000-000000000001',
      companyName: 'Bharat Tech Innovations',
      contactPerson: 'Priya Deshmukh',
      phone: '+91 98123 45678',
      designation: 'Lead University Talent Acquisition',
      isVerified: true,
      verificationStatus: 'VERIFIED',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.recruiters.set(demoRecruiter.id, demoRecruiter);

    // 4. Demo Student
    const demoStudent: Student = {
      id: 's0000001-0000-0000-0000-000000000001',
      userId: 'a1111111-1111-1111-1111-111111111111',
      rollNumber: '2022CSE014',
      branch: 'CSE',
      department: 'Computer Science and Engineering',
      cgpa: 8.75,
      backlogCount: 0,
      profileStatus: 'COMPLETE',
      isPlaced: false,
      placementStatus: 'UNPLACED',
      gender: 'Male',
      passingYear: 2026,
      address: 'Hostel 7, Room 302, University Campus',
      resumeDocumentId: 'doc-resume-001',
      resumeUrl: '/api/documents/doc-resume-001',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.students.set(demoStudent.id, demoStudent);

    // Demo Student Academics, Skills, Projects, Certifications
    this.academics.set(demoStudent.id, [
      { id: uuidv4(), studentId: demoStudent.id, degree: 'B.Tech', department: 'Computer Science', branch: 'CSE', semester: 1, sgpa: 8.40, backlogCount: 0, academicYear: '2022-23', source: 'SIS_IMPORT', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: uuidv4(), studentId: demoStudent.id, degree: 'B.Tech', department: 'Computer Science', branch: 'CSE', semester: 2, sgpa: 8.65, backlogCount: 0, academicYear: '2022-23', source: 'SIS_IMPORT', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: uuidv4(), studentId: demoStudent.id, degree: 'B.Tech', department: 'Computer Science', branch: 'CSE', semester: 3, sgpa: 8.90, backlogCount: 0, academicYear: '2023-24', source: 'SIS_IMPORT', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: uuidv4(), studentId: demoStudent.id, degree: 'B.Tech', department: 'Computer Science', branch: 'CSE', semester: 4, sgpa: 8.85, backlogCount: 0, academicYear: '2023-24', source: 'SIS_IMPORT', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: uuidv4(), studentId: demoStudent.id, degree: 'B.Tech', department: 'Computer Science', branch: 'CSE', semester: 5, sgpa: 8.95, backlogCount: 0, academicYear: '2024-25', source: 'STUDENT_PORTAL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]);

    this.skills.set(demoStudent.id, [
      { id: uuidv4(), studentId: demoStudent.id, skillName: 'Data Structures & Algorithms', skillLevel: 'Advanced', createdAt: new Date().toISOString() },
      { id: uuidv4(), studentId: demoStudent.id, skillName: 'TypeScript & React', skillLevel: 'Expert', createdAt: new Date().toISOString() },
      { id: uuidv4(), studentId: demoStudent.id, skillName: 'Node.js & Express', skillLevel: 'Advanced', createdAt: new Date().toISOString() },
      { id: uuidv4(), studentId: demoStudent.id, skillName: 'PostgreSQL & Database Design', skillLevel: 'Intermediate', createdAt: new Date().toISOString() },
      { id: uuidv4(), studentId: demoStudent.id, skillName: 'Docker & Kubernetes', skillLevel: 'Intermediate', createdAt: new Date().toISOString() },
    ]);

    this.projects.set(demoStudent.id, [
      {
        id: uuidv4(),
        studentId: demoStudent.id,
        title: 'Distributed In-Memory Cache with RAFT Consensus',
        description: 'Implemented a high-throughput peer-to-peer LRU cache in Go and TypeScript with cluster leader election and replication log verification.',
        technologies: ['Go', 'TypeScript', 'Raft', 'gRPC', 'PostgreSQL'],
        githubUrl: 'https://github.com/aaravsharma/dist-cache',
        startDate: '2025-01-10',
        endDate: '2025-04-20',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        studentId: demoStudent.id,
        title: 'AI Resume Parser & Job Match Scoring Engine',
        description: 'Engineered an NLP semantic scoring system that compares student resumes with JD competency requirements using vector embeddings.',
        technologies: ['Python', 'FastAPI', 'BERT', 'React', 'TailwindCSS'],
        githubUrl: 'https://github.com/aaravsharma/resume-ai-engine',
        startDate: '2025-05-01',
        endDate: '2025-08-15',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    this.certifications.set(demoStudent.id, [
      {
        id: uuidv4(),
        studentId: demoStudent.id,
        name: 'AWS Certified Solutions Architect - Associate',
        issuer: 'Amazon Web Services',
        issueDate: '2025-08-15',
        credentialUrl: 'https://aws.amazon.com/verify/demo-aarav-1234',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    // Sample Resume Document Record
    this.documents.set('doc-resume-001', {
      id: 'doc-resume-001',
      ownerUserId: demoStudent.userId,
      documentType: 'RESUME',
      storagePath: 'resumes/aarav_sharma_2026.pdf',
      originalFilename: 'Aarav_Sharma_Resume_2026.pdf',
      mimeType: 'application/pdf',
      fileSize: 245600,
      isPrivate: true,
      createdAt: new Date().toISOString(),
    });

    // 5. Generate 34 additional realistic students across Indian engineering disciplines
    const branches = ['CSE', 'IT', 'ECE', 'Mechanical', 'Civil'];
    const departments: Record<string, string> = {
      CSE: 'Computer Science and Engineering',
      IT: 'Information Technology',
      ECE: 'Electronics & Communication Engineering',
      Mechanical: 'Mechanical Engineering',
      Civil: 'Civil & Structural Engineering',
    };

    const firstNames = ['Rohan', 'Ananya', 'Vikram', 'Divya', 'Siddharth', 'Ishaan', 'Meera', 'Aditya', 'Sneha', 'Karan', 'Pooja', 'Rahul', 'Neha', 'Nikhil', 'Tanvi'];
    const lastNames = ['Patel', 'Reddy', 'Iyer', 'Gupta', 'Verma', 'Nair', 'Chopra', 'Mukherjee', 'Joshi', 'Kulkarni', 'Bose', 'Menon', 'Rao', 'Singh', 'Kapoor'];

    for (let i = 2; i <= 35; i++) {
      const branch = branches[(i - 1) % branches.length];
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[i % lastNames.length];
      const fullName = `${fn} ${ln}`;
      const uid = `a1111111-1111-1111-1111-${String(i).padStart(12, '0')}`;
      const sid = `s0000001-0000-0000-0000-${String(i).padStart(12, '0')}`;
      const email = `student${i}@usps.edu.in`;
      const cgpa = Number((6.80 + ((i * 0.11) % 3.0)).toFixed(2));
      const backlogs = i % 8 === 0 ? 1 : i % 17 === 0 ? 2 : 0;
      const isPlaced = i % 3 === 0;

      const prof: UserProfile = {
        id: uid,
        email,
        role: 'student',
        fullName,
        phone: `+91 98000 ${String(i).padStart(5, '0')}`,
        isActive: true,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.profiles.set(uid, prof);
      this.userPasswords.set(email.toLowerCase(), defaultPasswordHash);

      const stu: Student = {
        id: sid,
        userId: uid,
        rollNumber: `2022${branch}${String(i).padStart(3, '0')}`,
        branch,
        department: departments[branch],
        cgpa,
        backlogCount: backlogs,
        profileStatus: 'COMPLETE',
        isPlaced,
        placementStatus: isPlaced ? 'PLACED' : 'UNPLACED',
        gender: i % 2 === 0 ? 'Female' : 'Male',
        passingYear: 2026,
        resumeDocumentId: `doc-resume-${i}`,
        resumeUrl: `/api/documents/doc-resume-${i}`,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.students.set(sid, stu);

      this.skills.set(sid, [
        { id: uuidv4(), studentId: sid, skillName: branch === 'CSE' || branch === 'IT' ? 'Java & Spring Boot' : branch === 'ECE' ? 'Verilog HDL & RTL' : 'AutoCAD & SolidWorks', skillLevel: 'Advanced', createdAt: new Date().toISOString() },
        { id: uuidv4(), studentId: sid, skillName: 'SQL & Database Systems', skillLevel: 'Intermediate', createdAt: new Date().toISOString() },
      ]);
    }

    // 6. Placement Drives across various statuses
    const initialDrives: PlacementDrive[] = [
      {
        id: 'd0000001-0000-0000-0000-000000000001',
        companyId: 'c0000001-0000-0000-0000-000000000001',
        companyName: 'Bharat Tech Innovations',
        recruiterId: demoRecruiter.id,
        jobRole: 'Associate Software Development Engineer (SDE-1)',
        jobDescription: 'Design, develop, and test scalable distributed microservices, REST/GraphQL APIs, and high-throughput real-time data pipelines in AWS/GCP cloud environments. Strong problem solving in DSA and system design required.',
        packageMin: 14.0,
        packageMax: 18.5,
        packageCurrency: 'INR (LPA)',
        minCgpa: 7.5,
        maxBacklogs: 0,
        eligibleBranches: ['CSE', 'IT', 'ECE'],
        applicationDeadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        driveDate: new Date(Date.now() + 20 * 86400000).toISOString(),
        status: 'OPEN',
        approvedBy: 'c3333333-3333-3333-3333-333333333333',
        approvedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'd0000002-0000-0000-0000-000000000002',
        companyId: 'c0000002-0000-0000-0000-000000000002',
        companyName: 'Indus Cyber Systems',
        recruiterId: demoRecruiter.id,
        jobRole: 'Information Security & Cryptography Analyst',
        jobDescription: 'Perform vulnerability assessments, pen testing on banking/fintech payment APIs, and audit cryptographic key rotation protocols according to ISO 27001/SOC2 frameworks.',
        packageMin: 16.0,
        packageMax: 22.0,
        packageCurrency: 'INR (LPA)',
        minCgpa: 8.0,
        maxBacklogs: 0,
        eligibleBranches: ['CSE', 'IT'],
        applicationDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        driveDate: new Date(Date.now() + 12 * 86400000).toISOString(),
        status: 'OPEN',
        approvedBy: 'c3333333-3333-3333-3333-333333333333',
        approvedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'd0000003-0000-0000-0000-000000000003',
        companyId: 'c0000003-0000-0000-0000-000000000003',
        companyName: 'Kaveri Semiconductor Labs',
        recruiterId: demoRecruiter.id,
        jobRole: 'Embedded Systems & VLSI Firmware Engineer',
        jobDescription: 'Develop firmware for custom silicon SoCs, RTOS kernel device drivers, and write SystemVerilog verification benches for low-power IoT microcontrollers.',
        packageMin: 12.0,
        packageMax: 15.0,
        packageCurrency: 'INR (LPA)',
        minCgpa: 7.0,
        maxBacklogs: 1,
        eligibleBranches: ['ECE', 'CSE'],
        applicationDeadline: new Date(Date.now() + 21 * 86400000).toISOString(),
        driveDate: new Date(Date.now() + 28 * 86400000).toISOString(),
        status: 'OPEN',
        approvedBy: 'c3333333-3333-3333-3333-333333333333',
        approvedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'd0000004-0000-0000-0000-000000000004',
        companyId: 'c0000004-0000-0000-0000-000000000004',
        companyName: 'Garuda Dynamics Auto',
        recruiterId: demoRecruiter.id,
        jobRole: 'Robotics & EV Powertrain Controls Engineer',
        jobDescription: 'Control loop algorithms, MATLAB/Simulink modeling for battery thermal regulation, and ROS2 autonomous navigation for factory robotics.',
        packageMin: 10.5,
        packageMax: 14.0,
        packageCurrency: 'INR (LPA)',
        minCgpa: 7.0,
        maxBacklogs: 0,
        eligibleBranches: ['Mechanical', 'ECE'],
        applicationDeadline: new Date(Date.now() + 10 * 86400000).toISOString(),
        driveDate: new Date(Date.now() + 18 * 86400000).toISOString(),
        status: 'PENDING_APPROVAL',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'd0000005-0000-0000-0000-000000000005',
        companyId: 'c0000005-0000-0000-0000-000000000005',
        companyName: 'Setu Infrastructure & Energy',
        recruiterId: demoRecruiter.id,
        jobRole: 'Smart Grid & Civil Structural Engineer',
        jobDescription: 'Structural stress simulations, seismic resistance design, and project engineering for renewable solar/wind installations.',
        packageMin: 9.0,
        packageMax: 12.0,
        packageCurrency: 'INR (LPA)',
        minCgpa: 6.5,
        maxBacklogs: 2,
        eligibleBranches: ['Civil', 'Mechanical'],
        applicationDeadline: new Date(Date.now() - 5 * 86400000).toISOString(),
        driveDate: new Date(Date.now() - 1 * 86400000).toISOString(),
        status: 'CLOSED',
        approvedBy: 'c3333333-3333-3333-3333-333333333333',
        approvedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'd0000006-0000-0000-0000-000000000006',
        companyId: 'c0000006-0000-0000-0000-000000000006',
        companyName: 'Vedic Health Analytics',
        recruiterId: demoRecruiter.id,
        jobRole: 'Junior AI/ML Research Engineer',
        jobDescription: 'Train deep convolutional networks and transformers for biomedical image classification and health risk prediction.',
        packageMin: 15.0,
        packageMax: 20.0,
        packageCurrency: 'INR (LPA)',
        minCgpa: 8.5,
        maxBacklogs: 0,
        eligibleBranches: ['CSE', 'IT'],
        applicationDeadline: new Date(Date.now() + 18 * 86400000).toISOString(),
        driveDate: new Date(Date.now() + 25 * 86400000).toISOString(),
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    initialDrives.forEach(d => this.drives.set(d.id, d));

    // 7. Seed Applications
    const app1: Application = {
      id: 'app00001-0000-0000-0000-000000000001',
      studentId: demoStudent.id,
      driveId: 'd0000001-0000-0000-0000-000000000001',
      status: 'INTERVIEW_SCHEDULED',
      appliedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const app2: Application = {
      id: 'app00002-0000-0000-0000-000000000002',
      studentId: demoStudent.id,
      driveId: 'd0000002-0000-0000-0000-000000000002',
      status: 'SUBMITTED',
      appliedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.applications.set(app1.id, app1);
    this.applications.set(app2.id, app2);

    this.statusHistories.set(app1.id, [
      { id: uuidv4(), applicationId: app1.id, oldStatus: undefined, newStatus: 'SUBMITTED', reason: 'Application submitted', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
      { id: uuidv4(), applicationId: app1.id, oldStatus: 'SUBMITTED', newStatus: 'SHORTLISTED', reason: 'Resume and CGPA criteria shortlisted by recruiter', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: uuidv4(), applicationId: app1.id, oldStatus: 'SHORTLISTED', newStatus: 'INTERVIEW_SCHEDULED', reason: 'Round 2 Technical Interview scheduled', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    ]);

    this.statusHistories.set(app2.id, [
      { id: uuidv4(), applicationId: app2.id, oldStatus: undefined, newStatus: 'SUBMITTED', reason: 'Application submitted', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    ]);

    // Create applications for additional students to make recruiter dashboard lively
    Array.from(this.students.values()).slice(1, 15).forEach((stu, idx) => {
      const appId = `app-batch-${idx + 3}`;
      const statuses: ApplicationStatus[] = ['SUBMITTED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'ACCEPTED'];
      const st = statuses[idx % statuses.length];
      const a: Application = {
        id: appId,
        studentId: stu.id,
        driveId: 'd0000001-0000-0000-0000-000000000001',
        status: st,
        appliedAt: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
        createdAt: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.applications.set(appId, a);

      if (st === 'OFFERED' || st === 'ACCEPTED') {
        const offId = `offer-batch-${idx}`;
        const offer: Offer = {
          id: offId,
          applicationId: appId,
          packageOffered: 16.5,
          currency: 'INR (LPA)',
          offerDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
          status: st === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING',
          acceptedAt: st === 'ACCEPTED' ? new Date().toISOString() : undefined,
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.offers.set(offId, offer);

        if (st === 'ACCEPTED') {
          const plId = `plc-batch-${idx}`;
          this.placements.set(plId, {
            id: plId,
            studentId: stu.id,
            applicationId: appId,
            offerId: offId,
            companyId: 'c0000001-0000-0000-0000-000000000001',
            jobRole: 'Associate Software Development Engineer (SDE-1)',
            package: 16.5,
            placementDate: new Date().toISOString().split('T')[0],
            status: 'PLACED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          stu.isPlaced = true;
          stu.placementStatus = 'PLACED';
        }
      }
    });

    // 8. Interview Round for Demo Student
    const interview1: InterviewRound = {
      id: 'ir000001-0000-0000-0000-000000000001',
      applicationId: app1.id,
      roundNumber: 2,
      roundType: 'Technical Interview & Live Coding',
      scheduledAt: new Date(Date.now() + 2 * 86400000 + 3 * 3600000).toISOString(),
      mode: 'ONLINE',
      meetingUrl: 'https://meet.google.com/usps-tech-round2',
      status: 'SCHEDULED',
      studentInstructions: 'Please join 5 minutes early with screen sharing enabled. Bring your laptop setup with Node.js and TypeScript installed.',
      notes: 'Candidate has strong background in distributed systems and algorithms.',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.interviewRounds.set(interview1.id, interview1);

    // 9. Initial Notifications
    const demoNotifications: Notification[] = [
      {
        id: uuidv4(),
        userId: demoStudent.userId,
        type: 'INTERVIEW_SCHEDULED',
        title: 'Interview Scheduled: Bharat Tech SDE-1',
        message: 'Round 2 Technical Interview has been scheduled for your application. Please check your schedule and instructions.',
        data: { driveId: 'd0000001-0000-0000-0000-000000000001', roundNumber: 2 },
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
      {
        id: uuidv4(),
        userId: demoStudent.userId,
        type: 'APPLICATION_SUBMITTED',
        title: 'Application Received: Indus Cyber Systems',
        message: 'Your application for Information Security Analyst has been submitted successfully.',
        data: { driveId: 'd0000002-0000-0000-0000-000000000002' },
        isRead: true,
        readAt: new Date(Date.now() - 20 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
      {
        id: uuidv4(),
        userId: demoRecruiter.userId,
        type: 'DRIVE_APPROVED',
        title: 'Placement Drive Approved',
        message: 'Your placement drive for "Associate Software Development Engineer (SDE-1)" has been approved by TPO and is now OPEN.',
        data: { driveId: 'd0000001-0000-0000-0000-000000000001' },
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];

    demoNotifications.forEach(n => this.notifications.set(n.id, n));

    // 10. Audit Logs
    this.auditLogs.push(
      {
        id: uuidv4(),
        actorUserId: 'c3333333-3333-3333-3333-333333333333',
        actorRole: 'tpo_admin',
        action: 'DRIVE_APPROVED',
        entityType: 'placement_drives',
        entityId: 'd0000001-0000-0000-0000-000000000001',
        newData: { status: 'OPEN', jobRole: 'Associate Software Development Engineer (SDE-1)' },
        reason: 'Drive criteria and compensation structure verified and authorized.',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: uuidv4(),
        actorUserId: 'c3333333-3333-3333-3333-333333333333',
        actorRole: 'tpo_admin',
        action: 'DRIVE_APPROVED',
        entityType: 'placement_drives',
        entityId: 'd0000002-0000-0000-0000-000000000002',
        newData: { status: 'OPEN', jobRole: 'Information Security & Cryptography Analyst' },
        reason: 'Authorized for Cyber Security opening.',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      }
    );
  }
}

export const db = new DataStore();
