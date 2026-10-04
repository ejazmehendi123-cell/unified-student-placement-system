import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
export declare const requireRole: (allowedRoles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
