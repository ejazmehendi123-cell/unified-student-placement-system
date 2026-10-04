import { db } from '../repositories/dataStore';
import { AuditLog } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

export class AuditService {
  public static async logAction(params: {
    actorUserId?: string;
    actorRole: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldData?: Record<string, any>;
    newData?: Record<string, any>;
    reason?: string;
    req?: Request;
  }): Promise<AuditLog> {
    const ipAddress = params.req?.ip || (params.req?.headers['x-forwarded-for'] as string) || '127.0.0.1';
    const userAgent = params.req?.headers['user-agent'] || 'API Client';

    const log: AuditLog = {
      id: uuidv4(),
      actorUserId: params.actorUserId,
      actorRole: params.actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldData: params.oldData,
      newData: params.newData,
      reason: params.reason,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
    };

    db.auditLogs.unshift(log); // Prepend so latest is first
    return log;
  }

  public static getLogs(filters: {
    actorRole?: string;
    action?: string;
    entityType?: string;
    limit?: number;
    offset?: number;
  }) {
    let logs = db.auditLogs;

    if (filters.actorRole) {
      logs = logs.filter(l => l.actorRole === filters.actorRole);
    }
    if (filters.action) {
      logs = logs.filter(l => l.action.toLowerCase().includes(filters.action!.toLowerCase()));
    }
    if (filters.entityType) {
      logs = logs.filter(l => l.entityType === filters.entityType);
    }

    const total = logs.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    const paginated = logs.slice(offset, offset + limit);

    // Enrich with actor names
    const enriched = paginated.map(log => {
      const actor = log.actorUserId ? db.profiles.get(log.actorUserId) : undefined;
      return {
        ...log,
        actorName: actor?.fullName || (log.actorRole === 'system' ? 'System Service' : 'Unknown Actor'),
      };
    });

    return { total, logs: enriched };
  }
}
