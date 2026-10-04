"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService_1.AuthService.login(email, password, req);
            // Set HttpOnly cookie for session security
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async me(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
                return;
            }
            const data = await authService_1.AuthService.getProfile(req.user.id);
            res.status(200).json({
                success: true,
                data,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async logout(req, res) {
        res.clearCookie('token');
        res.status(200).json({
            success: true,
            message: 'Logged out successfully.',
        });
    }
    static async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            const result = await authService_1.AuthService.changePassword(req.user.id, currentPassword, newPassword, req);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await authService_1.AuthService.forgotPassword(email, req);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async enrollMfa(req, res) {
        res.status(200).json({
            success: true,
            data: {
                qrCodeUrl: 'otpauth://totp/USPS:admin@usps.demo?secret=JBSWY3DPEHPK3PXP&issuer=USPS%20University',
                manualSecret: 'JBSWY3DPEHPK3PXP',
                backupCodes: ['8392-1029', '4920-5819', '3849-0192', '7491-3829'],
            },
        });
    }
    static async verifyMfa(req, res) {
        res.status(200).json({
            success: true,
            data: { verified: true, message: 'TOTP Multi-Factor Authentication enabled successfully.' },
        });
    }
}
exports.AuthController = AuthController;
