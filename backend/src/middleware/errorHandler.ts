import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const reqId = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.requestId || uuidv4();
  const statusCode = err.status || err.statusCode || 500;
  
  // Safe sanitized logging
  console.error(`[ERROR] [ReqId: ${requestId}] [Route: ${req.method} ${req.originalUrl}]`, {
    message: err.message,
    code: err.code || 'INTERNAL_SERVER_ERROR',
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.isPublic ? err.message : (statusCode === 500 ? 'An unexpected internal error occurred. Please try again later.' : err.message),
      requestId,
    },
  });
};
