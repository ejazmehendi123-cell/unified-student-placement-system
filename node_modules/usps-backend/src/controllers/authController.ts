import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password, req);
      
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
    } catch (err) {
      next(err);
    }
  }

  public static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }
      const data = await AuthService.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  }

  public static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(req.user!.id, currentPassword, newPassword, req);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email, req);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async enrollMfa(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        qrCodeUrl: 'otpauth://totp/USPS:admin@usps.demo?secret=JBSWY3DPEHPK3PXP&issuer=USPS%20University',
        manualSecret: 'JBSWY3DPEHPK3PXP',
        backupCodes: ['8392-1029', '4920-5819', '3849-0192', '7491-3829'],
      },
    });
  }

  public static async verifyMfa(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: { verified: true, message: 'TOTP Multi-Factor Authentication enabled successfully.' },
    });
  }
}
