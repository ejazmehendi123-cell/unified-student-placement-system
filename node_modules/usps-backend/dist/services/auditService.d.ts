import { AuditLog } from '../types';
import { Request } from 'express';
export declare class AuditService {
    static logAction(params: {
        actorUserId?: string;
        actorRole: string;
        action: string;
        entityType: string;
        entityId?: string;
        oldData?: Record<string, any>;
        newData?: Record<string, any>;
        reason?: string;
        req?: Request;
    }): Promise<AuditLog>;
    static getLogs(filters: {
        actorRole?: string;
        action?: string;
        entityType?: string;
        limit?: number;
        offset?: number;
    }): {
        total: number;
        logs: {
            actorName: string;
            id: string;
            actorUserId?: string;
            actorRole: string;
            action: string;
            entityType: string;
            entityId?: string;
            oldData?: Record<string, any>;
            newData?: Record<string, any>;
            reason?: string;
            ipAddress?: string;
            userAgent?: string;
            createdAt: string;
        }[];
    };
}
