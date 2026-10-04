-- USPS (Unified Student Placement System) - 001_initial_schema.sql
-- Extensions & Enums & Table Definitions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'recruiter', 'tpo_admin', 'leadership');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE drive_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'OPEN', 'REJECTED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM (
        'SUBMITTED', 
        'SHORTLISTED', 
        'INTERVIEW_SCHEDULED', 
        'OFFERED', 
        'ACCEPTED', 
        'DECLINED', 
        'REJECTED', 
        'WITHDRAWN', 
        'PLACED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE interview_mode AS ENUM ('ONLINE', 'OFFLINE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE interview_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE offer_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE placement_status AS ENUM ('UNPLACED', 'PLACED', 'OPTED_OUT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('RESUME', 'OFFER_LETTER', 'NOC', 'CLEARANCE_CERTIFICATE', 'COMPANY_LOGO', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'APPLICATION_SUBMITTED',
        'APPLICATION_SHORTLISTED',
        'APPLICATION_REJECTED',
        'INTERVIEW_SCHEDULED',
        'INTERVIEW_UPDATED',
        'OFFER_RECEIVED',
        'OFFER_ACCEPTED',
        'OFFER_DECLINED',
        'DRIVE_APPROVED',
        'DRIVE_REJECTED',
        'SYSTEM'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. PROFILES (Linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- references auth.users(id)
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'student',
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT true,
    mfa_enabled BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. STUDENTS
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    branch VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    cgpa NUMERIC(4,2) NOT NULL CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
    backlog_count INTEGER NOT NULL DEFAULT 0 CHECK (backlog_count >= 0),
    profile_status VARCHAR(30) NOT NULL DEFAULT 'INCOMPLETE', -- 'INCOMPLETE', 'COMPLETE'
    is_placed BOOLEAN NOT NULL DEFAULT false,
    placement_status placement_status NOT NULL DEFAULT 'UNPLACED',
    resume_document_id UUID,
    gender VARCHAR(20),
    passing_year INTEGER NOT NULL DEFAULT 2026,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. STUDENT ACADEMICS
CREATE TABLE IF NOT EXISTS student_academics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    degree VARCHAR(50) NOT NULL DEFAULT 'B.Tech',
    department VARCHAR(100) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 10),
    sgpa NUMERIC(4,2) NOT NULL CHECK (sgpa >= 0.00 AND sgpa <= 10.00),
    backlog_count INTEGER NOT NULL DEFAULT 0,
    academic_year VARCHAR(20) NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'STUDENT_PORTAL', -- 'STUDENT_PORTAL' or 'SIS_IMPORT'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, semester)
);

-- 4. STUDENT SKILLS
CREATE TABLE IF NOT EXISTS student_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    skill_level VARCHAR(30) NOT NULL DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced', 'Expert'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, skill_name)
);

-- 5. STUDENT PROJECTS
CREATE TABLE IF NOT EXISTS student_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    technologies TEXT[] DEFAULT '{}',
    project_url VARCHAR(500),
    github_url VARCHAR(500),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. STUDENT CERTIFICATIONS
CREATE TABLE IF NOT EXISTS student_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    credential_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    industry VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    description TEXT,
    logo_document_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. RECRUITERS
CREATE TABLE IF NOT EXISTS recruiters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    designation VARCHAR(100),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PLACEMENT DRIVES
CREATE TABLE IF NOT EXISTS placement_drives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE RESTRICT,
    job_role VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    package_min NUMERIC(10,2) NOT NULL DEFAULT 0,
    package_max NUMERIC(10,2) NOT NULL,
    package_currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    min_cgpa NUMERIC(4,2) NOT NULL DEFAULT 0.00 CHECK (min_cgpa >= 0.00 AND min_cgpa <= 10.00),
    max_backlogs INTEGER NOT NULL DEFAULT 0 CHECK (max_backlogs >= 0),
    application_deadline TIMESTAMPTZ NOT NULL,
    drive_date TIMESTAMPTZ,
    status drive_status NOT NULL DEFAULT 'DRAFT',
    rejection_reason TEXT,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. DRIVE ELIGIBLE BRANCHES
CREATE TABLE IF NOT EXISTS drive_eligible_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drive_id UUID NOT NULL REFERENCES placement_drives(id) ON DELETE CASCADE,
    branch VARCHAR(50) NOT NULL,
    UNIQUE(drive_id, branch)
);

-- 11. APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    drive_id UUID NOT NULL REFERENCES placement_drives(id) ON DELETE RESTRICT,
    status application_status NOT NULL DEFAULT 'SUBMITTED',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    withdrawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, drive_id)
);

-- 12. APPLICATION STATUS HISTORY
CREATE TABLE IF NOT EXISTS application_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    old_status application_status,
    new_status application_status NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. INTERVIEW ROUNDS
CREATE TABLE IF NOT EXISTS interview_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL DEFAULT 1 CHECK (round_number >= 1),
    round_type VARCHAR(100) NOT NULL DEFAULT 'Technical Interview',
    scheduled_at TIMESTAMPTZ NOT NULL,
    mode interview_mode NOT NULL DEFAULT 'ONLINE',
    venue TEXT,
    meeting_url VARCHAR(500),
    status interview_status NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT, -- Private recruiter notes
    student_instructions TEXT, -- Public candidate instructions
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. OFFERS
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE RESTRICT,
    package_offered NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    offer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    offer_document_id UUID,
    status offer_status NOT NULL DEFAULT 'PENDING',
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    decline_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. PLACEMENTS
CREATE TABLE IF NOT EXISTS placements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE RESTRICT,
    offer_id UUID NOT NULL UNIQUE REFERENCES offers(id) ON DELETE RESTRICT,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    job_role VARCHAR(255) NOT NULL,
    package NUMERIC(10,2) NOT NULL,
    placement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'PLACED', -- 'PLACED', 'REVOKED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL DEFAULT 'SYSTEM',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. DOCUMENTS METADATA
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_type document_type NOT NULL DEFAULT 'RESUME',
    bucket_name VARCHAR(100) NOT NULL DEFAULT 'usps-private-documents',
    storage_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    file_size INTEGER NOT NULL,
    checksum VARCHAR(64),
    is_private BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. AUDIT LOGS (Immutable, append-only)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. ELIGIBILITY OVERRIDES
CREATE TABLE IF NOT EXISTS eligibility_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    drive_id UUID NOT NULL REFERENCES placement_drives(id) ON DELETE CASCADE,
    approved_by UUID NOT NULL REFERENCES profiles(id),
    reason TEXT NOT NULL,
    previous_result JSONB,
    new_result JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. PLACEMENT POLICY OVERRIDES
CREATE TABLE IF NOT EXISTS placement_policy_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    policy_name VARCHAR(100) NOT NULL DEFAULT 'SINGLE_OFFER_POLICY',
    approved_by UUID NOT NULL REFERENCES profiles(id),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
