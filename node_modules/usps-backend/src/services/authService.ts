import { db } from '../repositories/dataStore';
import { UserProfile, UserRole } from '../types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuditService } from './auditService';
import { Request } from 'express';

export class AuthService {
  public static async login(email: string, pass: string, req?: Request) {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find profile
    const profile = Array.from(db.profiles.values()).find(
      p => p.email.toLowerCase() === normalizedEmail
    );

    if (!profile) {
      await AuditService.logAction({
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
    const hashedPassword = db.userPasswords.get(normalizedEmail);
    const isMatch = hashedPassword ? bcrypt.compareSync(pass, hashedPassword) : false;

    if (!isMatch) {
      await AuditService.logAction({
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
    const token = jwt.sign(
      {
        id: profile.id,
        email: profile.email,
        role: profile.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    // Update last login
    profile.lastLoginAt = new Date().toISOString();

    // Get specific role identifiers
    let studentId: string | undefined;
    let recruiterId: string | undefined;
    if (profile.role === 'student') {
      const stu = Array.from(db.students.values()).find(s => s.userId === profile.id);
      studentId = stu?.id;
    } else if (profile.role === 'recruiter') {
      const rec = Array.from(db.recruiters.values()).find(r => r.userId === profile.id);
      recruiterId = rec?.id;
    }

    await AuditService.logAction({
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

  public static async changePassword(userId: string, currentPass: string, newPass: string, req?: Request) {
    const profile = db.profiles.get(userId);
    if (!profile) throw { status: 404, message: 'User profile not found.' };

    const currentHash = db.userPasswords.get(profile.email.toLowerCase());
    if (!currentHash || !bcrypt.compareSync(currentPass, currentHash)) {
      throw { status: 400, message: 'Current password does not match.' };
    }

    const newHash = bcrypt.hashSync(newPass, 10);
    db.userPasswords.set(profile.email.toLowerCase(), newHash);

    await AuditService.logAction({
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

  public static async forgotPassword(email: string, req?: Request) {
    // Return generic message regardless of email existence for privacy & account enumeration prevention
    const normalizedEmail = email.toLowerCase().trim();
    const profile = Array.from(db.profiles.values()).find(p => p.email.toLowerCase() === normalizedEmail);

    if (profile) {
      await AuditService.logAction({
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

  public static async getProfile(userId: string) {
    const profile = db.profiles.get(userId);
    if (!profile) throw { status: 404, message: 'Profile not found.' };

    let extra: any = {};
    if (profile.role === 'student') {
      const student = Array.from(db.students.values()).find(s => s.userId === userId);
      extra = { student };
    } else if (profile.role === 'recruiter') {
      const recruiter = Array.from(db.recruiters.values()).find(r => r.userId === userId);
      extra = { recruiter };
    }

    return {
      profile,
      ...extra,
    };
  }
}
