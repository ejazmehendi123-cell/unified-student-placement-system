import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export declare const validateBody: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const validateQuery: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
