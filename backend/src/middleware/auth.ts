import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { db } from '../repositories/dataStore';
import { AuthUser } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      requestId?: string;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies?.token;

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in to continue.',
          requestId: req.requestId,
        },
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    const profile = db.profiles.get(decoded.id);
    if (!profile || !profile.isActive) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_INACTIVE_OR_NOT_FOUND',
          message: 'Account is inactive or no longer exists.',
          requestId: req.requestId,
        },
      });
      return;
    }

    // Attach studentId or recruiterId if applicable
    let studentId: string | undefined;
    let recruiterId: string | undefined;

    if (profile.role === 'student') {
      const student = Array.from(db.students.values()).find(s => s.userId === profile.id);
      studentId = student?.id;
    } else if (profile.role === 'recruiter') {
      const recruiter = Array.from(db.recruiters.values()).find(r => r.userId === profile.id);
      recruiterId = recruiter?.id;
    }

    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      fullName: profile.fullName,
      studentId,
      recruiterId,
    };

    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_INVALID_OR_EXPIRED',
        message: 'Session has expired or token is invalid. Please log in again.',
        requestId: req.requestId,
      },
    });
  }
};
