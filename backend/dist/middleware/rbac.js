"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
