-- USPS - 004_reporting_views.sql
-- Aggregated Reporting & Analytics Views for TPO and Leadership Dashboards

-- 1. High Level Placement Summary View
CREATE OR REPLACE VIEW placement_summary AS
SELECT 
    (SELECT COUNT(*) FROM students) AS total_students,
    (SELECT COUNT(*) FROM students WHERE profile_status = 'COMPLETE') AS registered_students,
    (SELECT COUNT(*) FROM students WHERE is_placed = true) AS placed_students,
    (SELECT COUNT(*) FROM students WHERE is_placed = false) AS unplaced_students,
    (SELECT COUNT(*) FROM placement_drives) AS total_drives,
    (SELECT COUNT(*) FROM placement_drives WHERE status = 'OPEN') AS open_drives,
    (SELECT COUNT(*) FROM applications) AS total_applications,
    (SELECT COUNT(*) FROM interview_rounds) AS total_interviews,
    (SELECT COUNT(*) FROM offers) AS total_offers,
    (SELECT COUNT(*) FROM offers WHERE status = 'ACCEPTED') AS accepted_offers,
    (SELECT COALESCE(AVG(package), 0) FROM placements WHERE status = 'PLACED') AS avg_package_lpa,
    (SELECT COALESCE(MAX(package), 0) FROM placements WHERE status = 'PLACED') AS highest_package_lpa,
    CASE 
        WHEN (SELECT COUNT(*) FROM students) > 0 THEN 
            ROUND(((SELECT COUNT(*)::numeric FROM students WHERE is_placed = true) / (SELECT COUNT(*) FROM students) * 100), 2)
        ELSE 0
    END AS placement_percentage;

-- 2. Department & Branch Placement Statistics View
CREATE OR REPLACE VIEW department_placement_stats AS
SELECT 
    s.branch,
    s.department,
    COUNT(s.id) AS total_students,
    COUNT(CASE WHEN s.is_placed = true THEN 1 END) AS placed_students,
    COUNT(CASE WHEN s.is_placed = false THEN 1 END) AS unplaced_students,
    ROUND(
        CASE WHEN COUNT(s.id) > 0 THEN 
            (COUNT(CASE WHEN s.is_placed = true THEN 1 END)::numeric / COUNT(s.id) * 100)
        ELSE 0 END, 2
    ) AS placement_rate,
    COALESCE(ROUND(AVG(p.package), 2), 0) AS avg_package,
    COALESCE(MAX(p.package), 0) AS max_package,
    COUNT(DISTINCT a.id) AS total_applications
FROM students s
LEFT JOIN placements p ON s.id = p.student_id AND p.status = 'PLACED'
LEFT JOIN applications a ON s.id = a.student_id
GROUP BY s.branch, s.department
ORDER BY placement_rate DESC;

-- 3. Company Recruitment & Offers Statistics View
CREATE OR REPLACE VIEW company_placement_stats AS
SELECT 
    c.id AS company_id,
    c.name AS company_name,
    c.industry,
    COUNT(DISTINCT pd.id) AS total_drives,
    COUNT(DISTINCT a.id) AS total_applicants,
    COUNT(DISTINCT CASE WHEN a.status = 'SHORTLISTED' OR a.status = 'INTERVIEW_SCHEDULED' OR a.status = 'OFFERED' OR a.status = 'ACCEPTED' THEN a.id END) AS shortlisted_candidates,
    COUNT(DISTINCT o.id) AS total_offers_made,
    COUNT(DISTINCT CASE WHEN o.status = 'ACCEPTED' THEN o.id END) AS offers_accepted,
    COALESCE(ROUND(AVG(o.package_offered), 2), 0) AS avg_package_offered,
    COALESCE(MAX(o.package_offered), 0) AS max_package_offered
FROM companies c
LEFT JOIN placement_drives pd ON c.id = pd.company_id
LEFT JOIN applications a ON pd.id = a.drive_id
LEFT JOIN offers o ON a.id = o.application_id
GROUP BY c.id, c.name, c.industry
ORDER BY total_offers_made DESC;

-- 4. Monthly Placement Progress View
CREATE OR REPLACE VIEW monthly_placement_stats AS
SELECT 
    TO_CHAR(p.placement_date, 'YYYY-MM') AS month_year,
    TO_CHAR(p.placement_date, 'Mon YYYY') AS formatted_month,
    COUNT(p.id) AS students_placed,
    ROUND(AVG(p.package), 2) AS avg_package_lpa,
    MAX(p.package) AS max_package_lpa
FROM placements p
WHERE p.status = 'PLACED'
GROUP BY TO_CHAR(p.placement_date, 'YYYY-MM'), TO_CHAR(p.placement_date, 'Mon YYYY')
ORDER BY month_year ASC;
