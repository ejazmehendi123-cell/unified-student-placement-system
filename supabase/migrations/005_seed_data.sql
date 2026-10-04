-- USPS - 005_seed_data.sql
-- Fictional Indian Engineering University Placement Dataset
-- Password for all demo accounts: 'DemoPass@2026'

-- 1. Create Profiles for Demo Accounts (Fixed UUIDs for seed stability)
INSERT INTO profiles (id, email, role, full_name, phone, is_active, mfa_enabled)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', 'student@usps.demo', 'student', 'Aarav Sharma', '+91 98765 43210', true, false),
    ('b2222222-2222-2222-2222-222222222222', 'recruiter@usps.demo', 'recruiter', 'Priya Deshmukh', '+91 98123 45678', true, false),
    ('c3333333-3333-3333-3333-333333333333', 'admin@usps.demo', 'tpo_admin', 'Dr. Ramesh Sundaram (TPO Head)', '+91 94440 12345', true, true),
    ('d4444444-4444-4444-4444-444444444444', 'leadership@usps.demo', 'leadership', 'Prof. K. Venkatesh (Dean of Academics)', '+91 94440 98765', true, false)
ON CONFLICT (id) DO UPDATE 
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, email = EXCLUDED.email;

-- 2. Companies
INSERT INTO companies (id, name, industry, website, description, is_active)
VALUES
    ('c0000001-0000-0000-0000-000000000001', 'Bharat Tech Innovations', 'Enterprise Software & AI', 'https://bharattech.example.com', 'Leading Indian software solutions provider specializing in cloud computing and scalable enterprise architectures.', true),
    ('c0000002-0000-0000-0000-000000000002', 'Indus Cyber Systems', 'Cybersecurity & FinTech', 'https://induscyber.example.com', 'Pioneers in fintech security, cryptographic protocols, and real-time transaction monitoring systems.', true),
    ('c0000003-0000-0000-0000-000000000003', 'Kaveri Semiconductor Labs', 'VLSI & Embedded Systems', 'https://kaverisemi.example.com', 'Advanced microelectronics research, silicon design, and embedded IoT firmware engineering.', true),
    ('c0000004-0000-0000-0000-000000000004', 'Garuda Dynamics Auto', 'Automotive & Robotics', 'https://garudadynamics.example.com', 'Next-gen electric vehicle powertrain systems, autonomous robotics, and precision manufacturing.', true),
    ('c0000005-0000-0000-0000-000000000005', 'Setu Infrastructure & Energy', 'Renewable Infrastructure & Civil', 'https://setuinfra.example.com', 'National smart grid, renewable solar farms, and resilient transportation infrastructure design.', true),
    ('c0000006-0000-0000-0000-000000000006', 'Vedic Health Analytics', 'HealthTech & Data Science', 'https://vedichealth.example.com', 'AI-driven diagnostic platforms and epidemiological predictive data modeling.', true)
ON CONFLICT (name) DO NOTHING;

-- 3. Recruiters
INSERT INTO recruiters (id, user_id, company_id, company_name, contact_person, phone, designation, is_verified, verification_status)
VALUES
    ('r0000001-0000-0000-0000-000000000001', 'b2222222-2222-2222-2222-222222222222', 'c0000001-0000-0000-0000-000000000001', 'Bharat Tech Innovations', 'Priya Deshmukh', '+91 98123 45678', 'Lead University Talent Acquisition', true, 'VERIFIED')
ON CONFLICT (id) DO UPDATE SET is_verified = true;

-- 4. Demo Student Profile
INSERT INTO students (id, user_id, roll_number, branch, department, cgpa, backlog_count, profile_status, is_placed, placement_status, gender, passing_year, address)
VALUES
    ('s0000001-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', '2022CSE014', 'CSE', 'Computer Science and Engineering', 8.75, 0, 'COMPLETE', false, 'UNPLACED', 'Male', 2026, 'Hostel 7, Room 302, University Campus')
ON CONFLICT (roll_number) DO NOTHING;

-- Additional Student Profiles for batch realism
DO $$
DECLARE
    branches text[] := ARRAY['CSE', 'IT', 'ECE', 'Mechanical', 'Civil'];
    dept_names text[] := ARRAY['Computer Science', 'Information Technology', 'Electronics & Comm', 'Mechanical Engg', 'Civil Engg'];
    i integer;
    stu_uid uuid;
    stu_id uuid;
    b_idx integer;
    c_cgpa numeric(4,2);
    b_logs integer;
    is_pl boolean;
    pl_stat placement_status;
BEGIN
    FOR i IN 2..35 LOOP
        stu_uid := ('a1111111-1111-1111-1111-' || LPAD(i::text, 12, '0'))::uuid;
        stu_id := ('s0000001-0000-0000-0000-' || LPAD(i::text, 12, '0'))::uuid;
        b_idx := ((i - 1) % 5) + 1;
        c_cgpa := ROUND((6.50 + (i * 0.09) % 3.45)::numeric, 2);
        b_logs := CASE WHEN i % 7 = 0 THEN 1 WHEN i % 13 = 0 THEN 2 ELSE 0 END;
        is_pl := (i % 3 = 0);
        pl_stat := CASE WHEN is_pl THEN 'PLACED'::placement_status ELSE 'UNPLACED'::placement_status END;

        INSERT INTO profiles (id, email, role, full_name, phone, is_active)
        VALUES (stu_uid, 'student' || i || '@usps.edu.in', 'student', 'Student ' || i, '+91 98000 ' || LPAD(i::text, 5, '0'), true)
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO students (id, user_id, roll_number, branch, department, cgpa, backlog_count, profile_status, is_placed, placement_status, gender, passing_year)
        VALUES (stu_id, stu_uid, '2022' || branches[b_idx] || LPAD(i::text, 3, '0'), branches[b_idx], dept_names[b_idx], c_cgpa, b_logs, 'COMPLETE', is_pl, pl_stat, CASE WHEN i % 2 = 0 THEN 'Female' ELSE 'Male' END, 2026)
        ON CONFLICT (roll_number) DO NOTHING;
    END LOOP;
END $$;

-- 5. Student Skills, Projects, Academics for Demo Student
INSERT INTO student_skills (student_id, skill_name, skill_level)
VALUES
    ('s0000001-0000-0000-0000-000000000001', 'Data Structures & Algorithms', 'Advanced'),
    ('s0000001-0000-0000-0000-000000000001', 'TypeScript & React', 'Expert'),
    ('s0000001-0000-0000-0000-000000000001', 'Node.js & Express', 'Advanced'),
    ('s0000001-0000-0000-0000-000000000001', 'PostgreSQL & Database Design', 'Intermediate'),
    ('s0000001-0000-0000-0000-000000000001', 'Docker & CI/CD', 'Intermediate')
ON CONFLICT DO NOTHING;

INSERT INTO student_projects (student_id, title, description, technologies, github_url)
VALUES
    ('s0000001-0000-0000-0000-000000000001', 'Distributed Cache Protocol', 'Built a high-throughput peer-to-peer LRU memory cache with RAFT consensus in Go and TypeScript.', ARRAY['Go', 'TypeScript', 'Raft', 'gRPC'], 'https://github.com/aaravsharma/dist-cache'),
    ('s0000001-0000-0000-0000-000000000001', 'AI Resume Parser & Matcher', 'Developed an NLP-based parser that scores semantic similarity between student resumes and JD requirements.', ARRAY['Python', 'FastAPI', 'BERT', 'React'], 'https://github.com/aaravsharma/resume-ai')
ON CONFLICT DO NOTHING;

INSERT INTO student_certifications (student_id, name, issuer, issue_date, credential_url)
VALUES
    ('s0000001-0000-0000-0000-000000000001', 'AWS Certified Solutions Architect - Associate', 'Amazon Web Services', '2025-08-15', 'https://aws.amazon.com/verify/demo-1234'),
    ('s0000001-0000-0000-0000-000000000001', 'PostgreSQL Certified Professional', 'Postgres Guild', '2025-11-20', 'https://postgresguild.org/cert/aarav')
ON CONFLICT DO NOTHING;

-- 6. Placement Drives across various statuses
INSERT INTO placement_drives (
    id, company_id, recruiter_id, job_role, job_description, 
    package_min, package_max, package_currency, min_cgpa, max_backlogs, 
    application_deadline, drive_date, status, approved_by, approved_at
) VALUES
    (
        'd0000001-0000-0000-0000-000000000001', 
        'c0000001-0000-0000-0000-000000000001', 
        'r0000001-0000-0000-0000-000000000001',
        'Associate Software Development Engineer (SDE-1)', 
        'Design, build, and maintain high-performance microservices, REST/GraphQL APIs, and resilient data processing pipelines in an enterprise cloud environment.',
        14.00, 18.50, 'INR', 7.50, 0,
        NOW() + INTERVAL '14 days', NOW() + INTERVAL '20 days', 'OPEN',
        'c3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 days'
    ),
    (
        'd0000002-0000-0000-0000-000000000002', 
        'c0000002-0000-0000-0000-000000000002', 
        'r0000001-0000-0000-0000-000000000001',
        'Information Security & Cryptography Analyst', 
        'Perform vulnerability assessments, penetration testing of fintech payment gateways, and implement ISO 27001 zero-trust security controls.',
        16.00, 22.00, 'INR', 8.00, 0,
        NOW() + INTERVAL '7 days', NOW() + INTERVAL '12 days', 'OPEN',
        'c3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 day'
    ),
    (
        'd0000003-0000-0000-0000-000000000003', 
        'c0000003-0000-0000-0000-000000000003', 
        'r0000001-0000-0000-0000-000000000001',
        'Embedded Systems & VLSI Firmware Engineer', 
        'Develop real-time operating system (RTOS) firmware, board bring-up, and FPGA hardware verification testbenches.',
        12.00, 15.00, 'INR', 7.00, 1,
        NOW() + INTERVAL '21 days', NOW() + INTERVAL '28 days', 'OPEN',
        'c3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '4 days'
    ),
    (
        'd0000004-0000-0000-0000-000000000004', 
        'c0000004-0000-0000-0000-000000000004', 
        'r0000001-0000-0000-0000-000000000001',
        'Robotics & EV Controls Engineer', 
        'Design battery thermal management algorithms, CAN bus telemetry decoders, and autonomous robotic navigation pipelines.',
        10.50, 14.00, 'INR', 7.00, 0,
        NOW() + INTERVAL '10 days', NOW() + INTERVAL '18 days', 'PENDING_APPROVAL',
        NULL, NULL
    ),
    (
        'd0000005-0000-0000-0000-000000000005', 
        'c0000005-0000-0000-0000-000000000005', 
        'r0000001-0000-0000-0000-000000000001',
        'Smart Grid & Structural Design Engineer', 
        'Finite element structural analysis, BIM architectural modeling, and high-voltage substation automation engineering.',
        9.00, 12.00, 'INR', 6.50, 2,
        NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', 'CLOSED',
        'c3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '20 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 7. Eligible Branches per Drive
INSERT INTO drive_eligible_branches (drive_id, branch)
VALUES
    ('d0000001-0000-0000-0000-000000000001', 'CSE'),
    ('d0000001-0000-0000-0000-000000000001', 'IT'),
    ('d0000001-0000-0000-0000-000000000001', 'ECE'),
    ('d0000002-0000-0000-0000-000000000002', 'CSE'),
    ('d0000002-0000-0000-0000-000000000002', 'IT'),
    ('d0000003-0000-0000-0000-000000000003', 'ECE'),
    ('d0000003-0000-0000-0000-000000000003', 'CSE'),
    ('d0000004-0000-0000-0000-000000000004', 'Mechanical'),
    ('d0000004-0000-0000-0000-000000000004', 'ECE'),
    ('d0000005-0000-0000-0000-000000000005', 'Civil'),
    ('d0000005-0000-0000-0000-000000000005', 'Mechanical')
ON CONFLICT DO NOTHING;

-- 8. Seed Applications for Demo Student & Others
INSERT INTO applications (id, student_id, drive_id, status, applied_at)
VALUES
    ('app00001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'INTERVIEW_SCHEDULED', NOW() - INTERVAL '3 days'),
    ('app00002-0000-0000-0000-000000000002', 's0000001-0000-0000-0000-000000000001', 'd0000002-0000-0000-0000-000000000002', 'SUBMITTED', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- 9. Interview Round for Demo Student
INSERT INTO interview_rounds (
    id, application_id, round_number, round_type, scheduled_at, mode, venue, meeting_url, status, student_instructions
) VALUES (
    'ir000001-0000-0000-0000-000000000001',
    'app00001-0000-0000-0000-000000000001',
    2,
    'Technical Interview & Live Coding',
    NOW() + INTERVAL '2 days' + INTERVAL '3 hours',
    'ONLINE',
    NULL,
    'https://meet.google.com/usps-tech-round2',
    'SCHEDULED',
    'Please have your IDE ready with screen sharing enabled. The session will cover Distributed Systems and Database Concurrency.'
) ON CONFLICT DO NOTHING;

-- 10. Audit Logs
INSERT INTO audit_logs (actor_user_id, actor_role, action, entity_type, entity_id, new_data, reason)
VALUES
    ('c3333333-3333-3333-3333-333333333333', 'tpo_admin', 'DRIVE_APPROVED', 'placement_drives', 'd0000001-0000-0000-0000-000000000001', '{"status":"OPEN"}'::jsonb, 'Drive criteria verified and authorized.'),
    ('c3333333-3333-3333-3333-333333333333', 'tpo_admin', 'DRIVE_APPROVED', 'placement_drives', 'd0000002-0000-0000-0000-000000000002', '{"status":"OPEN"}'::jsonb, 'Drive opened for Cyber Security roles.')
ON CONFLICT DO NOTHING;

-- 11. Notifications
INSERT INTO notifications (user_id, type, title, message, data)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'INTERVIEW_SCHEDULED', 'Interview Scheduled: Bharat Tech SDE-1', 'Round 2 Technical Interview has been scheduled for your application. Please check your schedule.', '{"drive_id":"d0000001-0000-0000-0000-000000000001"}'::jsonb),
    ('a1111111-1111-1111-1111-111111111111', 'APPLICATION_SUBMITTED', 'Application Submitted', 'Your application for Indus Cyber Systems (Security Analyst) was successfully received.', '{"drive_id":"d0000002-0000-0000-0000-000000000002"}'::jsonb),
    ('b2222222-2222-2222-2222-222222222222', 'DRIVE_APPROVED', 'Placement Drive Approved', 'Your SDE-1 drive is now OPEN and accepting applications from CSE, IT, ECE.', '{"drive_id":"d0000001-0000-0000-0000-000000000001"}'::jsonb)
ON CONFLICT DO NOTHING;
