"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateBody = void 0;
const zod_1 = require("zod");
const validateBody = (schema) => {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const details = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input parameters. Please check the highlighted fields.',
                        details,
                        requestId: req.requestId,
                    },
                });
                return;
            }
            next(error);
        }
    };
};
exports.validateBody = validateBody;
const validateQuery = (schema) => {
    return async (req, res, next) => {
        try {
            req.query = await schema.parseAsync(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'QUERY_VALIDATION_ERROR',
                        message: 'Invalid query string parameters.',
                        details: error.errors,
                        requestId: req.requestId,
                    },
                });
                return;
            }
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
