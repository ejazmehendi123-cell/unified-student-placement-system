export declare class ReportService {
    static getPlacementSummary(): {
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
    };
    static getDepartmentStats(): {
        branch: string;
        totalStudents: number;
        placedStudents: number;
        unplacedStudents: number;
        placementRate: number;
        avgPackage: number;
        maxPackage: number;
    }[];
    static getCompanyStats(): {
        companyId: string;
        companyName: string;
        industry: string;
        totalDrives: number;
        totalApplicants: number;
        offersIssued: number;
        offersAccepted: number;
        avgPackageOffered: number;
    }[];
    static getPackageDistribution(): {
        tier: string;
        count: number;
    }[];
    static generatePlacementCSV(): string;
}
