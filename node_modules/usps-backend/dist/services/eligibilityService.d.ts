import { EligibilityResult, Student, PlacementDrive } from '../types';
export declare class EligibilityService {
    static evaluateStudent(student: Student, drive: PlacementDrive): EligibilityResult;
    static runMassScreening(drive: PlacementDrive): {
        totalEvaluated: number;
        eligibleCount: number;
        ineligibleCount: number;
        results: {
            studentId: string;
            rollNumber: string;
            name: string;
            branch: string;
            cgpa: number;
            backlogs: number;
            evaluation: EligibilityResult;
        }[];
    };
}
