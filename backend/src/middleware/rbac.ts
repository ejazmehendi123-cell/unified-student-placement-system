import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication is required for this action.',
          requestId: req.requestId,
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
          requestId: req.requestId,
        },
      });
      return;
    }

    next();
  };
};
