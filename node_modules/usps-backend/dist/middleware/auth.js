"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const dataStore_1 = require("../repositories/dataStore");
const authenticate = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        const profile = dataStore_1.db.profiles.get(decoded.id);
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
        let studentId;
        let recruiterId;
        if (profile.role === 'student') {
            const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === profile.id);
            studentId = student?.id;
        }
        else if (profile.role === 'recruiter') {
            const recruiter = Array.from(dataStore_1.db.recruiters.values()).find(r => r.userId === profile.id);
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
    }
    catch (err) {
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
exports.authenticate = authenticate;
