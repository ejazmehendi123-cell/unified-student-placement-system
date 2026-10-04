import { Request, Response, NextFunction } from 'express';
export declare class ReportController {
    static getSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getDepartments(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getCompanies(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getPackages(req: Request, res: Response, next: NextFunction): Promise<void>;
    static exportCSV(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare class NotificationController {
    static getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    static markRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    static markAllRead(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare class DocumentController {
    static getDocument(req: Request, res: Response, next: NextFunction): Promise<void>;
}
