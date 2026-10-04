import { Request, Response, NextFunction } from 'express';
import { AuthUser } from '../types';
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
            requestId?: string;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
