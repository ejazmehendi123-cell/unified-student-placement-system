import { Request } from 'express';
export interface SISRecord {
    rollNumber: string;
    name: string;
    email: string;
    branch: string;
    cgpa: number;
    backlogCount: number;
}
export declare class SISService {
    static syncRecords(records: SISRecord[], adminUserId: string, req?: Request): Promise<{
        totalProcessed: number;
        importedCount: number;
        updatedCount: number;
        skippedCount: number;
        errors: {
            rollNumber: string;
            error: string;
        }[];
    }>;
    static getSampleSISData(): SISRecord[];
}
