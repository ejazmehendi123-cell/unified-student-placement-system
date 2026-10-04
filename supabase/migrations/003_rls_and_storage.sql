-- USPS - 003_rls_and_storage.sql
-- Row Level Security (RLS) and Storage Access Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_academics ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_eligible_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_policy_overrides ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR is_tpo_admin() OR is_leadership());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "TPO can manage profiles" ON profiles;
CREATE POLICY "TPO can manage profiles" ON profiles
    FOR ALL USING (is_tpo_admin());

-- 2. STUDENTS POLICIES
DROP POLICY IF EXISTS "Students view own record" ON students;
CREATE POLICY "Students view own record" ON students
    FOR SELECT USING (user_id = auth.uid() OR is_tpo_admin() OR is_leadership());

DROP POLICY IF EXISTS "Students update own record" ON students;
CREATE POLICY "Students update own record" ON students
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Recruiters view applicants" ON students;
CREATE POLICY "Recruiters view applicants" ON students
    FOR SELECT USING (
        is_recruiter() AND id IN (
            SELECT a.student_id FROM applications a
            JOIN placement_drives pd ON a.drive_id = pd.id
            JOIN recruiters r ON pd.recruiter_id = r.id
            WHERE r.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "TPO full access to students" ON students;
CREATE POLICY "TPO full access to students" ON students
    FOR ALL USING (is_tpo_admin());

-- 3. STUDENT SUB-TABLES (Academics, Skills, Projects, Certifications)
-- Academics
DROP POLICY IF EXISTS "Student academics select" ON student_academics;
CREATE POLICY "Student academics select" ON student_academics
    FOR SELECT USING (
        student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) 
        OR is_tpo_admin() OR is_leadership()
    );

DROP POLICY IF EXISTS "Student academics modify" ON student_academics;
CREATE POLICY "Student academics modify" ON student_academics
    FOR ALL USING (
        student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
        OR is_tpo_admin()
    );

-- Skills
DROP POLICY IF EXISTS "Student skills select" ON student_skills;
CREATE POLICY "Student skills select" ON student_skills
    FOR SELECT USING (true); -- Skills viewable by authenticated users

DROP POLICY IF EXISTS "Student skills modify" ON student_skills;
CREATE POLICY "Student skills modify" ON student_skills
    FOR ALL USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) OR is_tpo_admin());

-- Projects
DROP POLICY IF EXISTS "Student projects select" ON student_projects;
CREATE POLICY "Student projects select" ON student_projects
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Student projects modify" ON student_projects;
CREATE POLICY "Student projects modify" ON student_projects
    FOR ALL USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) OR is_tpo_admin());

-- Certifications
DROP POLICY IF EXISTS "Student certs select" ON student_certifications;
CREATE POLICY "Student certs select" ON student_certifications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Student certs modify" ON student_certifications;
CREATE POLICY "Student certs modify" ON student_certifications
    FOR ALL USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) OR is_tpo_admin());

-- 4. COMPANIES & RECRUITERS
DROP POLICY IF EXISTS "Companies viewable by all auth users" ON companies;
CREATE POLICY "Companies viewable by all auth users" ON companies
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "TPO can manage companies" ON companies;
CREATE POLICY "TPO can manage companies" ON companies
    FOR ALL USING (is_tpo_admin());

DROP POLICY IF EXISTS "Recruiter can view/update own recruiter profile" ON recruiters;
CREATE POLICY "Recruiter can view/update own recruiter profile" ON recruiters
    FOR ALL USING (user_id = auth.uid() OR is_tpo_admin());

-- 5. PLACEMENT DRIVES
DROP POLICY IF EXISTS "Students view open drives" ON placement_drives;
CREATE POLICY "Students view open drives" ON placement_drives
    FOR SELECT USING (
        (status = 'OPEN' AND is_student())
        OR is_tpo_admin() 
        OR is_leadership()
    );

DROP POLICY IF EXISTS "Recruiters manage own drives" ON placement_drives;
CREATE POLICY "Recruiters manage own drives" ON placement_drives
    FOR ALL USING (
        recruiter_id IN (SELECT id FROM recruiters WHERE user_id = auth.uid())
        OR is_tpo_admin()
    );

DROP POLICY IF EXISTS "Drive eligible branches readable" ON drive_eligible_branches;
CREATE POLICY "Drive eligible branches readable" ON drive_eligible_branches
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Drive branches manageable by drive owner or TPO" ON drive_eligible_branches;
CREATE POLICY "Drive branches manageable by drive owner or TPO" ON drive_eligible_branches
    FOR ALL USING (
        drive_id IN (
            SELECT pd.id FROM placement_drives pd
            JOIN recruiters r ON pd.recruiter_id = r.id
            WHERE r.user_id = auth.uid()
        ) OR is_tpo_admin()
    );

-- 6. APPLICATIONS
DROP POLICY IF EXISTS "Students manage own applications" ON applications;
CREATE POLICY "Students manage own applications" ON applications
    FOR ALL USING (
        student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Recruiters view applications for own drives" ON applications;
CREATE POLICY "Recruiters view applications for own drives" ON applications
    FOR ALL USING (
        drive_id IN (
            SELECT pd.id FROM placement_drives pd
            JOIN recruiters r ON pd.recruiter_id = r.id
            WHERE r.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "TPO manage all applications" ON applications;
CREATE POLICY "TPO manage all applications" ON applications
    FOR ALL USING (is_tpo_admin());

DROP POLICY IF EXISTS "Leadership view applications" ON applications;
CREATE POLICY "Leadership view applications" ON applications
    FOR SELECT USING (is_leadership());

-- 7. APPLICATION STATUS HISTORY
DROP POLICY IF EXISTS "Status history viewable by participants" ON application_status_history;
CREATE POLICY "Status history viewable by participants" ON application_status_history
    FOR SELECT USING (
        application_id IN (
            SELECT id FROM applications WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
        )
        OR application_id IN (
            SELECT a.id FROM applications a
            JOIN placement_drives pd ON a.drive_id = pd.id
            JOIN recruiters r ON pd.recruiter_id = r.id
            WHERE r.user_id = auth.uid()
        )
        OR is_tpo_admin() OR is_leadership()
    );

-- 8. INTERVIEW ROUNDS
DROP POLICY IF EXISTS "Interviews viewable by student/recruiter/tpo" ON interview_rounds;
CREATE POLICY "Interviews viewable by student/recruiter/tpo" ON interview_rounds
    FOR SELECT USING (
        application_id IN (
            SELECT id FROM applications WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
        )
        OR application_id IN (
            SELECT a.id FROM applications a
            JOIN placement_drives pd ON a.drive_id = pd.id
            JOIN recruiters r ON pd.recruiter_id = r.id
            WHERE r.user_id = auth.uid()
        )
        OR is_tpo_admin()
    );

DROP POLICY IF EXISTS "Recruiters manage interviews for own drives" ON interview_rounds;
CREATE POLICY "Recruiters manage interviews for own drives" ON interview_rounds
    FOR ALL USING (
        application_id IN (
            SELECT a.id FROM applications a
            JOIN placement_drives pd ON a.drive_id = pd.id
            JOIN recruiters r ON pd.recruiter_id = r.id
            WHERE r.user_id = auth.uid()
        ) OR is_tpo_admin()
    );

-- 9. OFFERS & PLACEMENTS
DROP POLICY IF EXISTS "Offers accessible by student and drive recruiter" ON offers;
CREATE POLICY "Offers accessible by student and drive recruiter" ON offers
    FOR SELECT USING (
        application_id IN (
            SELECT id FROM applications WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
        )
        OR application_id IN (
            SELECT a.id FROM applications a
            JOIN placement_drives pd ON a.drive_id = pd.id
            JOIN recruiters r ON pd.recruiter_id = r.id
            WHERE r.user_id = auth.uid()
        )
        OR is_tpo_admin() OR is_leadership()
    );

DROP POLICY IF EXISTS "Recruiter issue offers" ON offers;
CREATE POLICY "Recruiter issue offers" ON offers
    FOR INSERT WITH CHECK (
        application_id IN (
            SELECT a.id FROM applications a
            JOIN placement_drives pd ON a.drive_id = pd.id
            JOIN recruiters r ON pd.recruiter_id = r.id
            WHERE r.user_id = auth.uid()
        ) OR is_tpo_admin()
    );

DROP POLICY IF EXISTS "Placements viewable" ON placements;
CREATE POLICY "Placements viewable" ON placements
    FOR SELECT USING (
        student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
        OR is_tpo_admin() OR is_leadership()
    );

-- 10. NOTIFICATIONS
DROP POLICY IF EXISTS "Users manage own notifications" ON notifications;
CREATE POLICY "Users manage own notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

-- 11. AUDIT LOGS (Read-only for TPO / Admin, no update or delete allowed)
DROP POLICY IF EXISTS "Audit logs viewable only by TPO Admin" ON audit_logs;
CREATE POLICY "Audit logs viewable only by TPO Admin" ON audit_logs
    FOR SELECT USING (is_tpo_admin());

DROP POLICY IF EXISTS "Audit logs insertable by system" ON audit_logs;
CREATE POLICY "Audit logs insertable by system" ON audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 12. DOCUMENTS
DROP POLICY IF EXISTS "Document owners and authorized recruiters view docs" ON documents;
CREATE POLICY "Document owners and authorized recruiters view docs" ON documents
    FOR SELECT USING (
        owner_user_id = auth.uid()
        OR is_tpo_admin()
        OR (
            is_recruiter() AND id IN (
                SELECT s.resume_document_id FROM students s
                JOIN applications a ON a.student_id = s.id
                JOIN placement_drives pd ON a.drive_id = pd.id
                JOIN recruiters r ON pd.recruiter_id = r.id
                WHERE r.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Document owners insert/delete own docs" ON documents;
CREATE POLICY "Document owners insert/delete own docs" ON documents
    FOR ALL USING (owner_user_id = auth.uid() OR is_tpo_admin());

-- 13. OVERRIDES
DROP POLICY IF EXISTS "Overrides managed by TPO" ON eligibility_overrides;
CREATE POLICY "Overrides managed by TPO" ON eligibility_overrides
    FOR ALL USING (is_tpo_admin());

DROP POLICY IF EXISTS "Policy overrides managed by TPO" ON placement_policy_overrides;
CREATE POLICY "Policy overrides managed by TPO" ON placement_policy_overrides
    FOR ALL USING (is_tpo_admin());
