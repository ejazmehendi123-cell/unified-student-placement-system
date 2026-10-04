-- USPS - 002_functions_and_triggers.sql
-- Core PostgreSQL functions, business logic procedures, and security definer helpers

-- 1. Helper: get user role from profiles
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Role check predicates
CREATE OR REPLACE FUNCTION is_tpo_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'tpo_admin' FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_recruiter()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'recruiter' FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'student' FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_leadership()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'leadership' FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Timestamp update trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to relevant tables
DROP TRIGGER IF EXISTS set_timestamp_profiles ON profiles;
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_students ON students;
CREATE TRIGGER set_timestamp_students BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_drives ON placement_drives;
CREATE TRIGGER set_timestamp_drives BEFORE UPDATE ON placement_drives FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_applications ON applications;
CREATE TRIGGER set_timestamp_applications BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_offers ON offers;
CREATE TRIGGER set_timestamp_offers BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- 4. Status change history trigger
CREATE OR REPLACE FUNCTION trigger_log_application_status()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO application_status_history (
            application_id,
            old_status,
            new_status,
            changed_by,
            reason
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            auth.uid(),
            'Status transition from ' || OLD.status || ' to ' || NEW.status
        );
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO application_status_history (
            application_id,
            old_status,
            new_status,
            changed_by,
            reason
        ) VALUES (
            NEW.id,
            NULL,
            NEW.status,
            auth.uid(),
            'Application submitted'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_application_status_trigger ON applications;
CREATE TRIGGER log_application_status_trigger
AFTER INSERT OR UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION trigger_log_application_status();

-- 5. Structured Eligibility Evaluation Function
CREATE OR REPLACE FUNCTION get_student_drive_eligibility(
    p_student_id UUID,
    p_drive_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_student RECORD;
    v_drive RECORD;
    v_branch_matched BOOLEAN := false;
    v_override_exists BOOLEAN := false;
    v_policy_override_exists BOOLEAN := false;
    v_is_eligible BOOLEAN := true;
    v_reasons TEXT[] := '{}';
    v_cgpa_check BOOLEAN := true;
    v_backlog_check BOOLEAN := true;
    v_branch_check BOOLEAN := true;
    v_profile_check BOOLEAN := true;
    v_placement_policy_check BOOLEAN := true;
    v_deadline_check BOOLEAN := true;
    v_status_check BOOLEAN := true;
BEGIN
    -- Fetch student
    SELECT * INTO v_student FROM students WHERE id = p_student_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'eligible', false,
            'reason', 'Student profile not found.'
        );
    END IF;

    -- Fetch drive
    SELECT * INTO v_drive FROM placement_drives WHERE id = p_drive_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'eligible', false,
            'reason', 'Placement drive not found.'
        );
    END IF;

    -- Check if manual override exists by TPO
    SELECT EXISTS (
        SELECT 1 FROM eligibility_overrides 
        WHERE student_id = p_student_id AND drive_id = p_drive_id
    ) INTO v_override_exists;

    IF v_override_exists THEN
        RETURN jsonb_build_object(
            'eligible', true,
            'cgpa_check', true,
            'backlog_check', true,
            'branch_check', true,
            'profile_check', true,
            'placement_policy_check', true,
            'deadline_check', true,
            'status_check', true,
            'is_overridden', true,
            'reason', 'Eligibility granted via official TPO administrative override.'
        );
    END IF;

    -- 1. Drive Status Check
    IF v_drive.status != 'OPEN' THEN
        v_status_check := false;
        v_is_eligible := false;
        v_reasons := array_append(v_reasons, 'Drive is not currently open (Status: ' || v_drive.status || ').');
    END IF;

    -- 2. Deadline Check
    IF v_drive.application_deadline < NOW() THEN
        v_deadline_check := false;
        v_is_eligible := false;
        v_reasons := array_append(v_reasons, 'Application deadline has passed (' || to_char(v_drive.application_deadline, 'DD Mon YYYY HH24:MI') || ').');
    END IF;

    -- 3. Profile Completion Check
    IF v_student.profile_status != 'COMPLETE' AND v_student.resume_document_id IS NULL THEN
        v_profile_check := false;
        v_is_eligible := false;
        v_reasons := array_append(v_reasons, 'Your student profile is incomplete or resume is not uploaded.');
    END IF;

    -- 4. Single-Offer Placement Policy Check
    IF v_student.is_placed = true OR v_student.placement_status = 'PLACED' THEN
        -- Check if student has a single-offer policy override
        SELECT EXISTS (
            SELECT 1 FROM placement_policy_overrides 
            WHERE student_id = p_student_id AND policy_name = 'SINGLE_OFFER_POLICY'
        ) INTO v_policy_override_exists;

        IF NOT v_policy_override_exists THEN
            v_placement_policy_check := false;
            v_is_eligible := false;
            v_reasons := array_append(v_reasons, 'Under University Single-Offer Policy, placed students cannot apply to standard drives.');
        END IF;
    END IF;

    -- 5. CGPA Check
    IF v_student.cgpa < v_drive.min_cgpa THEN
        v_cgpa_check := false;
        v_is_eligible := false;
        v_reasons := array_append(v_reasons, 'Your CGPA (' || v_student.cgpa || ') is below the required minimum of ' || v_drive.min_cgpa || '.');
    END IF;

    -- 6. Backlog Check
    IF v_student.backlog_count > v_drive.max_backlogs THEN
        v_backlog_check := false;
        v_is_eligible := false;
        v_reasons := array_append(v_reasons, 'You have ' || v_student.backlog_count || ' active backlogs; maximum allowed is ' || v_drive.max_backlogs || '.');
    END IF;

    -- 7. Branch Check
    SELECT EXISTS (
        SELECT 1 FROM drive_eligible_branches 
        WHERE drive_id = p_drive_id AND branch = v_student.branch
    ) INTO v_branch_matched;

    IF NOT v_branch_matched THEN
        v_branch_check := false;
        v_is_eligible := false;
        v_reasons := array_append(v_reasons, 'Branch ' || v_student.branch || ' is not listed in eligible branches for this drive.');
    END IF;

    RETURN jsonb_build_object(
        'eligible', v_is_eligible,
        'cgpa_check', v_cgpa_check,
        'backlog_check', v_backlog_check,
        'branch_check', v_branch_check,
        'profile_check', v_profile_check,
        'placement_policy_check', v_placement_policy_check,
        'deadline_check', v_deadline_check,
        'status_check', v_status_check,
        'is_overridden', false,
        'reason', CASE 
            WHEN v_is_eligible THEN 'You meet all eligibility criteria for this placement drive.'
            ELSE array_to_string(v_reasons, ' ')
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Simple boolean wrapper
CREATE OR REPLACE FUNCTION is_student_eligible(
    p_student_id UUID,
    p_drive_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_res JSONB;
BEGIN
    v_res := get_student_drive_eligibility(p_student_id, p_drive_id);
    RETURN (v_res->>'eligible')::boolean;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. TPO Drive Approval Function
CREATE OR REPLACE FUNCTION approve_drive(
    p_drive_id UUID,
    p_actor_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_drive RECORD;
    v_recruiter_user_id UUID;
BEGIN
    -- Check role
    IF NOT is_tpo_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only TPO/Admin can approve placement drives.';
    END IF;

    SELECT * INTO v_drive FROM placement_drives WHERE id = p_drive_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Placement drive not found.';
    END IF;

    IF v_drive.status != 'PENDING_APPROVAL' AND v_drive.status != 'DRAFT' THEN
        RAISE EXCEPTION 'Drive cannot be approved from status: %', v_drive.status;
    END IF;

    UPDATE placement_drives
    SET status = 'OPEN',
        approved_by = p_actor_id,
        approved_at = NOW(),
        rejection_reason = NULL,
        updated_at = NOW()
    WHERE id = p_drive_id;

    -- Get recruiter's user_id for notification
    SELECT user_id INTO v_recruiter_user_id FROM recruiters WHERE id = v_drive.recruiter_id;

    IF v_recruiter_user_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
            v_recruiter_user_id,
            'DRIVE_APPROVED',
            'Placement Drive Approved',
            'Your placement drive for "' || v_drive.job_role || '" has been approved by the TPO and is now OPEN for student applications.',
            jsonb_build_object('drive_id', p_drive_id)
        );
    END IF;

    -- Log audit
    INSERT INTO audit_logs (
        actor_user_id,
        actor_role,
        action,
        entity_type,
        entity_id,
        old_data,
        new_data,
        reason
    ) VALUES (
        p_actor_id,
        'tpo_admin',
        'DRIVE_APPROVED',
        'placement_drives',
        p_drive_id,
        jsonb_build_object('status', v_drive.status),
        jsonb_build_object('status', 'OPEN'),
        'Drive approved and opened by TPO'
    );

    RETURN jsonb_build_object('success', true, 'message', 'Drive approved successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. TPO Drive Rejection Function
CREATE OR REPLACE FUNCTION reject_drive(
    p_drive_id UUID,
    p_actor_id UUID,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_drive RECORD;
    v_recruiter_user_id UUID;
BEGIN
    IF NOT is_tpo_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only TPO/Admin can reject placement drives.';
    END IF;

    IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
        RAISE EXCEPTION 'Rejection reason is mandatory.';
    END IF;

    SELECT * INTO v_drive FROM placement_drives WHERE id = p_drive_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Placement drive not found.';
    END IF;

    UPDATE placement_drives
    SET status = 'REJECTED',
        rejection_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_drive_id;

    SELECT user_id INTO v_recruiter_user_id FROM recruiters WHERE id = v_drive.recruiter_id;

    IF v_recruiter_user_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
            v_recruiter_user_id,
            'DRIVE_REJECTED',
            'Placement Drive Changes Requested / Rejected',
            'Your placement drive for "' || v_drive.job_role || '" was not approved. Reason: ' || p_reason,
            jsonb_build_object('drive_id', p_drive_id, 'reason', p_reason)
        );
    END IF;

    INSERT INTO audit_logs (
        actor_user_id,
        actor_role,
        action,
        entity_type,
        entity_id,
        old_data,
        new_data,
        reason
    ) VALUES (
        p_actor_id,
        'tpo_admin',
        'DRIVE_REJECTED',
        'placement_drives',
        p_drive_id,
        jsonb_build_object('status', v_drive.status),
        jsonb_build_object('status', 'REJECTED'),
        p_reason
    );

    RETURN jsonb_build_object('success', true, 'message', 'Drive rejected with reason logged.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Atomic Secure Offer Acceptance Function
CREATE OR REPLACE FUNCTION accept_offer_securely(
    p_offer_id UUID,
    p_student_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_offer RECORD;
    v_application RECORD;
    v_student RECORD;
    v_drive RECORD;
BEGIN
    -- Verify offer
    SELECT * INTO v_offer FROM offers WHERE id = p_offer_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Offer not found.';
    END IF;

    IF v_offer.status != 'PENDING' THEN
        RAISE EXCEPTION 'Offer is not pending (Current status: %)', v_offer.status;
    END IF;

    -- Verify application and ownership
    SELECT * INTO v_application FROM applications WHERE id = v_offer.application_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Associated application not found.';
    END IF;

    SELECT * INTO v_student FROM students WHERE id = v_application.student_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student profile not found.';
    END IF;

    IF v_student.user_id != p_student_user_id THEN
        RAISE EXCEPTION 'Unauthorized: You can only accept offers issued to yourself.';
    END IF;

    SELECT * INTO v_drive FROM placement_drives WHERE id = v_application.drive_id;

    -- Single Offer Policy Check
    IF v_student.is_placed = true THEN
        RAISE EXCEPTION 'Policy violation: You have already accepted an offer under the Single-Offer Placement Policy.';
    END IF;

    -- Update offer status
    UPDATE offers
    SET status = 'ACCEPTED',
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_offer_id;

    -- Update application status
    UPDATE applications
    SET status = 'ACCEPTED',
        updated_at = NOW()
    WHERE id = v_application.id;

    -- Update student placement status
    UPDATE students
    SET is_placed = true,
        placement_status = 'PLACED',
        updated_at = NOW()
    WHERE id = v_student.id;

    -- Create placement record
    INSERT INTO placements (
        student_id,
        application_id,
        offer_id,
        company_id,
        job_role,
        package,
        placement_date,
        status
    ) VALUES (
        v_student.id,
        v_application.id,
        v_offer.id,
        v_drive.company_id,
        v_drive.job_role,
        v_offer.package_offered,
        CURRENT_DATE,
        'PLACED'
    );

    -- Decline any other pending offers for this student automatically
    UPDATE offers
    SET status = 'WITHDRAWN',
        decline_reason = 'Auto-withdrawn due to acceptance of offer from ' || v_drive.job_role,
        updated_at = NOW()
    WHERE id != p_offer_id 
      AND status = 'PENDING'
      AND application_id IN (SELECT id FROM applications WHERE student_id = v_student.id);

    -- Log audit
    INSERT INTO audit_logs (
        actor_user_id,
        actor_role,
        action,
        entity_type,
        entity_id,
        new_data,
        reason
    ) VALUES (
        p_student_user_id,
        'student',
        'OFFER_ACCEPTED',
        'offers',
        p_offer_id,
        jsonb_build_object('package', v_offer.package_offered, 'drive_id', v_drive.id),
        'Student accepted offer. Placed status updated and single-offer policy activated.'
    );

    RETURN jsonb_build_object('success', true, 'message', 'Offer accepted. Congratulations on your placement!');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Secure Offer Decline Function
CREATE OR REPLACE FUNCTION decline_offer_securely(
    p_offer_id UUID,
    p_student_user_id UUID,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_offer RECORD;
    v_application RECORD;
    v_student RECORD;
BEGIN
    SELECT * INTO v_offer FROM offers WHERE id = p_offer_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Offer not found.';
    END IF;

    IF v_offer.status != 'PENDING' THEN
        RAISE EXCEPTION 'Offer is not in PENDING state.';
    END IF;

    SELECT * INTO v_application FROM applications WHERE id = v_offer.application_id;
    SELECT * INTO v_student FROM students WHERE id = v_application.student_id;

    IF v_student.user_id != p_student_user_id THEN
        RAISE EXCEPTION 'Unauthorized: You can only decline offers issued to yourself.';
    END IF;

    UPDATE offers
    SET status = 'DECLINED',
        declined_at = NOW(),
        decline_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_offer_id;

    UPDATE applications
    SET status = 'DECLINED',
        updated_at = NOW()
    WHERE id = v_application.id;

    INSERT INTO audit_logs (
        actor_user_id,
        actor_role,
        action,
        entity_type,
        entity_id,
        reason
    ) VALUES (
        p_student_user_id,
        'student',
        'OFFER_DECLINED',
        'offers',
        p_offer_id,
        COALESCE(p_reason, 'Student declined offer.')
    );

    RETURN jsonb_build_object('success', true, 'message', 'Offer declined successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
