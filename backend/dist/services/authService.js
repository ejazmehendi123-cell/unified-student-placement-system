"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const dataStore_1 = require("../repositories/dataStore");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const auditService_1 = require("./auditService");
class AuthService {
    static async login(email, pass, req) {
        const normalizedEmail = email.toLowerCase().trim();
        // Find profile
        const profile = Array.from(dataStore_1.db.profiles.values()).find(p => p.email.toLowerCase() === normalizedEmail);
        if (!profile) {
            await auditService_1.AuditService.logAction({
                actorRole: 'anonymous',
                action: 'FAILED_LOGIN_ATTEMPT',
                entityType: 'auth',
                reason: `Login failed for non-existent email: ${normalizedEmail}`,
                req,
            });
            throw { status: 401, message: 'Invalid email or password credentials.' };
        }
        if (!profile.isActive) {
            throw { status: 403, message: 'Your account has been deactivated by the TPO Administration.' };
        }
        // Verify password
        const hashedPassword = dataStore_1.db.userPasswords.get(normalizedEmail);
        const isMatch = hashedPassword ? bcryptjs_1.default.compareSync(pass, hashedPassword) : false;
        if (!isMatch) {
            await auditService_1.AuditService.logAction({
                actorUserId: profile.id,
                actorRole: profile.role,
                action: 'FAILED_LOGIN_ATTEMPT',
                entityType: 'auth',
                reason: 'Incorrect password entered',
                req,
            });
            throw { status: 401, message: 'Invalid email or password credentials.' };
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({
            id: profile.id,
            email: profile.email,
            role: profile.role,
        }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
        // Update last login
        profile.lastLoginAt = new Date().toISOString();
        // Get specific role identifiers
        let studentId;
        let recruiterId;
        if (profile.role === 'student') {
            const stu = Array.from(dataStore_1.db.students.values()).find(s => s.userId === profile.id);
            studentId = stu?.id;
        }
        else if (profile.role === 'recruiter') {
            const rec = Array.from(dataStore_1.db.recruiters.values()).find(r => r.userId === profile.id);
            recruiterId = rec?.id;
        }
        await auditService_1.AuditService.logAction({
            actorUserId: profile.id,
            actorRole: profile.role,
            action: 'USER_LOGIN',
            entityType: 'auth',
            entityId: profile.id,
            reason: 'Successful user authentication',
            req,
        });
        return {
            token,
            user: {
                id: profile.id,
                email: profile.email,
                role: profile.role,
                fullName: profile.fullName,
                phone: profile.phone,
                mfaEnabled: profile.mfaEnabled,
                studentId,
                recruiterId,
            },
        };
    }
    static async changePassword(userId, currentPass, newPass, req) {
        const profile = dataStore_1.db.profiles.get(userId);
        if (!profile)
            throw { status: 404, message: 'User profile not found.' };
        const currentHash = dataStore_1.db.userPasswords.get(profile.email.toLowerCase());
        if (!currentHash || !bcryptjs_1.default.compareSync(currentPass, currentHash)) {
            throw { status: 400, message: 'Current password does not match.' };
        }
        const newHash = bcryptjs_1.default.hashSync(newPass, 10);
        dataStore_1.db.userPasswords.set(profile.email.toLowerCase(), newHash);
        await auditService_1.AuditService.logAction({
            actorUserId: profile.id,
            actorRole: profile.role,
            action: 'PASSWORD_CHANGED',
            entityType: 'auth',
            entityId: profile.id,
            reason: 'User successfully updated account password',
            req,
        });
        return { success: true, message: 'Password updated successfully.' };
    }
    static async forgotPassword(email, req) {
        // Return generic message regardless of email existence for privacy & account enumeration prevention
        const normalizedEmail = email.toLowerCase().trim();
        const profile = Array.from(dataStore_1.db.profiles.values()).find(p => p.email.toLowerCase() === normalizedEmail);
        if (profile) {
            await auditService_1.AuditService.logAction({
                actorUserId: profile.id,
                actorRole: profile.role,
                action: 'PASSWORD_RESET_REQUESTED',
                entityType: 'auth',
                reason: 'Password reset link requested',
                req,
            });
        }
        return {
            success: true,
            message: 'If an account exists with this email, password reset instructions have been sent.',
        };
    }
    static async getProfile(userId) {
        const profile = dataStore_1.db.profiles.get(userId);
        if (!profile)
            throw { status: 404, message: 'Profile not found.' };
        let extra = {};
        if (profile.role === 'student') {
            const student = Array.from(dataStore_1.db.students.values()).find(s => s.userId === userId);
            extra = { student };
        }
        else if (profile.role === 'recruiter') {
            const recruiter = Array.from(dataStore_1.db.recruiters.values()).find(r => r.userId === userId);
            extra = { recruiter };
        }
        return {
            profile,
            ...extra,
        };
    }
}
exports.AuthService = AuthService;
