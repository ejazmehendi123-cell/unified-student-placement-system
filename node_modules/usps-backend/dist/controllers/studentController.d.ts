import { Request, Response, NextFunction } from 'express';
export declare class StudentController {
    static getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    static addSkill(req: Request, res: Response, next: NextFunction): Promise<void>;
    static removeSkill(req: Request, res: Response, next: NextFunction): Promise<void>;
    static addProject(req: Request, res: Response, next: NextFunction): Promise<void>;
    static removeProject(req: Request, res: Response, next: NextFunction): Promise<void>;
    static addCertification(req: Request, res: Response, next: NextFunction): Promise<void>;
    static removeCertification(req: Request, res: Response, next: NextFunction): Promise<void>;
    static uploadResume(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getEligibleDrives(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getDriveEligibility(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getApplications(req: Request, res: Response, next: NextFunction): Promise<void>;
    static applyDrive(req: Request, res: Response, next: NextFunction): Promise<void>;
    static withdrawApplication(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getInterviews(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getOffers(req: Request, res: Response, next: NextFunction): Promise<void>;
    static acceptOffer(req: Request, res: Response, next: NextFunction): Promise<void>;
    static declineOffer(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getClearanceCertificate(req: Request, res: Response, next: NextFunction): Promise<void>;
}
