"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const dataStore_1 = require("../repositories/dataStore");
const uuid_1 = require("uuid");
class AuditService {
    static async logAction(params) {
        const ipAddress = params.req?.ip || params.req?.headers['x-forwarded-for'] || '127.0.0.1';
        const userAgent = params.req?.headers['user-agent'] || 'API Client';
        const log = {
            id: (0, uuid_1.v4)(),
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
        dataStore_1.db.auditLogs.unshift(log); // Prepend so latest is first
        return log;
    }
    static getLogs(filters) {
        let logs = dataStore_1.db.auditLogs;
        if (filters.actorRole) {
            logs = logs.filter(l => l.actorRole === filters.actorRole);
        }
        if (filters.action) {
            logs = logs.filter(l => l.action.toLowerCase().includes(filters.action.toLowerCase()));
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
            const actor = log.actorUserId ? dataStore_1.db.profiles.get(log.actorUserId) : undefined;
            return {
                ...log,
                actorName: actor?.fullName || (log.actorRole === 'system' ? 'System Service' : 'Unknown Actor'),
            };
        });
        return { total, logs: enriched };
    }
}
exports.AuditService = AuditService;
