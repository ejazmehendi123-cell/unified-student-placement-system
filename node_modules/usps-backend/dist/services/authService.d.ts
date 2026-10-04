import { UserRole } from '../types';
import { Request } from 'express';
export declare class AuthService {
    static login(email: string, pass: string, req?: Request): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: UserRole;
            fullName: string;
            phone: string | undefined;
            mfaEnabled: boolean | undefined;
            studentId: string | undefined;
            recruiterId: string | undefined;
        };
    }>;
    static changePassword(userId: string, currentPass: string, newPass: string, req?: Request): Promise<{
        success: boolean;
        message: string;
    }>;
    static forgotPassword(email: string, req?: Request): Promise<{
        success: boolean;
        message: string;
    }>;
    static getProfile(userId: string): Promise<any>;
}
