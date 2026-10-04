import { Request, Response, NextFunction } from 'express';
export declare class AdminController {
    static getAllDrives(req: Request, res: Response, next: NextFunction): Promise<void>;
    static approveDrive(req: Request, res: Response, next: NextFunction): Promise<void>;
    static rejectDrive(req: Request, res: Response, next: NextFunction): Promise<void>;
    static overrideEligibility(req: Request, res: Response, next: NextFunction): Promise<void>;
    static overridePolicy(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAllStudents(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
    static syncSIS(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getSampleSIS(req: Request, res: Response): Promise<void>;
}
