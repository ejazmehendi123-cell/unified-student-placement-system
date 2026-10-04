"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.requestIdMiddleware = void 0;
const uuid_1 = require("uuid");
const requestIdMiddleware = (req, res, next) => {
    const reqId = req.headers['x-request-id'] || (0, uuid_1.v4)();
    req.requestId = reqId;
    res.setHeader('X-Request-Id', reqId);
    next();
};
exports.requestIdMiddleware = requestIdMiddleware;
const errorHandler = (err, req, res, next) => {
    const requestId = req.requestId || (0, uuid_1.v4)();
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
exports.errorHandler = errorHandler;
