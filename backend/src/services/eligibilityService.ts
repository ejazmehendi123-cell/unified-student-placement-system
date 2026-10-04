import { db } from '../repositories/dataStore';
import { EligibilityResult, Student, PlacementDrive } from '../types';

export class EligibilityService {
  public static evaluateStudent(student: Student, drive: PlacementDrive): EligibilityResult {
    // 1. Check if an official TPO administrative override exists for this specific student & drive
    const overrideKey = `${student.id}_${drive.id}`;
    const manualOverride = db.eligibilityOverrides.get(overrideKey);
    if (manualOverride) {
      return {
        eligible: true,
        cgpaCheck: true,
        backlogCheck: true,
        branchCheck: true,
        profileCheck: true,
        placementPolicyCheck: true,
        deadlineCheck: true,
        statusCheck: true,
        isOverridden: true,
        reason: `Eligibility granted via authorized TPO Administrative Override: "${manualOverride.reason}".`,
      };
    }

    let isEligible = true;
    const reasons: string[] = [];

    // 2. Drive Status Check
    const statusCheck = drive.status === 'OPEN';
    if (!statusCheck) {
      isEligible = false;
      reasons.push(`Drive is not currently open for applications (Status: ${drive.status}).`);
    }

    // 3. Deadline Check
    const deadlinePassed = new Date(drive.applicationDeadline).getTime() < Date.now();
    const deadlineCheck = !deadlinePassed;
    if (deadlinePassed) {
      isEligible = false;
      reasons.push(`The application deadline (${new Date(drive.applicationDeadline).toLocaleDateString()}) has passed.`);
    }

    // 4. Student Profile & Resume Check
    const profileCheck = student.profileStatus === 'COMPLETE' || !!student.resumeDocumentId;
    if (!profileCheck) {
      isEligible = false;
      reasons.push('Your student profile is incomplete or your resume has not been uploaded.');
    }

    // 5. Single-Offer University Placement Policy Check
    const policyOverrideKey = `${student.id}_SINGLE_OFFER_POLICY`;
    const hasPolicyOverride = db.policyOverrides.has(policyOverrideKey);
    const placementPolicyCheck = !student.isPlaced || hasPolicyOverride;
    if (!placementPolicyCheck) {
      isEligible = false;
      reasons.push('Under the University Single-Offer Policy, students with an accepted placement offer cannot apply to standard drives.');
    }

    // 6. CGPA Check
    const cgpaCheck = student.cgpa >= drive.minCgpa;
    if (!cgpaCheck) {
      isEligible = false;
      reasons.push(`Your CGPA (${student.cgpa.toFixed(2)}) is below the required minimum of ${drive.minCgpa.toFixed(2)}.`);
    }

    // 7. Backlog Count Check
    const backlogCheck = student.backlogCount <= drive.maxBacklogs;
    if (!backlogCheck) {
      isEligible = false;
      reasons.push(`You have ${student.backlogCount} active backlogs, but this drive permits a maximum of ${drive.maxBacklogs}.`);
    }

    // 8. Branch Check
    const branchCheck = drive.eligibleBranches.some(
      b => b.toLowerCase().trim() === student.branch.toLowerCase().trim()
    );
    if (!branchCheck) {
      isEligible = false;
      reasons.push(`Branch '${student.branch}' is not listed in the eligible branches for this role (${drive.eligibleBranches.join(', ')}).`);
    }

    return {
      eligible: isEligible,
      cgpaCheck,
      backlogCheck,
      branchCheck,
      profileCheck,
      placementPolicyCheck,
      deadlineCheck,
      statusCheck,
      isOverridden: false,
      reason: isEligible
        ? 'You meet all academic and policy eligibility criteria for this placement drive.'
        : reasons.join(' '),
    };
  }

  public static runMassScreening(drive: PlacementDrive) {
    const allStudents = Array.from(db.students.values());
    const results = allStudents.map(student => {
      const evaluation = this.evaluateStudent(student, drive);
      return {
        studentId: student.id,
        rollNumber: student.rollNumber,
        name: db.profiles.get(student.userId)?.fullName || 'Student',
        branch: student.branch,
        cgpa: student.cgpa,
        backlogs: student.backlogCount,
        evaluation,
      };
    });

    const eligibleCount = results.filter(r => r.evaluation.eligible).length;
    return {
      totalEvaluated: results.length,
      eligibleCount,
      ineligibleCount: results.length - eligibleCount,
      results,
    };
  }
}
