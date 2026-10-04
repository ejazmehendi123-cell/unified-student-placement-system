import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static me(req: Request, res: Response, next: NextFunction): Promise<void>;
    static logout(req: Request, res: Response): Promise<void>;
    static changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    static forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    static enrollMfa(req: Request, res: Response): Promise<void>;
    static verifyMfa(req: Request, res: Response): Promise<void>;
}
