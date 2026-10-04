import { Request, Response, NextFunction } from 'express';
export declare class RecruiterController {
    static createDrive(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateDrive(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getMyDrives(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getDriveById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getDriveApplications(req: Request, res: Response, next: NextFunction): Promise<void>;
    static shortlistCandidate(req: Request, res: Response, next: NextFunction): Promise<void>;
    static rejectCandidate(req: Request, res: Response, next: NextFunction): Promise<void>;
    static scheduleInterview(req: Request, res: Response, next: NextFunction): Promise<void>;
    static issueOffer(req: Request, res: Response, next: NextFunction): Promise<void>;
    static exportShortlistCSV(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getInterviews(req: Request, res: Response, next: NextFunction): Promise<void>;
}
