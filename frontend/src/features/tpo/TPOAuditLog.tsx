import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { AuditLog } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  ScrollText,
  Search,
  Filter,
  ShieldCheck,
  Eye,
  Lock,
} from 'lucide-react';

export const TPOAuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAuditLogs({
        actorRole: roleFilter || undefined,
        action: searchQuery || undefined,
      });
      if (res.success && res.data) {
        setLogs(res.data.logs || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [roleFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">System Audit Log Explorer</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Immutable, append-only security logs of administrative actions, authorizations, and policy overrides
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-navy bg-paper-dark px-3 py-1.5 border border-[#E5DFD5] rounded-sm">
          <Lock className="w-3.5 h-3.5 text-brass" />
          <span>Append-Only Compliance Ledger</span>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
              placeholder="Search by action (e.g. DRIVE_APPROVED)..."
              className="w-full pl-9 pr-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
            >
              <option value="">All Actor Roles</option>
              <option value="tpo_admin">TPO Administration</option>
              <option value="recruiter">Recruiter</option>
              <option value="student">Student</option>
              <option value="leadership">Leadership</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" onClick={fetchLogs}>
              Apply Filters
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setRoleFilter('');
                setSearchQuery('');
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="p-0 overflow-hidden border border-[#E5DFD5]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-paper-dark border-b border-[#E5DFD5] text-charcoal-muted uppercase font-bold text-[10px]">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity Type</th>
                <th className="p-3.5">Reason / Description</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5 text-right">Payload Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D3]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-charcoal-muted">
                    No audit records found matching filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-paper/60 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-charcoal-muted">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-semibold text-navy">{log.actorName || 'System'}</td>
                    <td className="p-3.5">
                      <Badge variant="neutral" size="sm">
                        {log.actorRole}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] font-bold text-navy">{log.action}</td>
                    <td className="p-3.5 font-mono text-[11px] text-charcoal-muted">{log.entityType}</td>
                    <td className="p-3.5 max-w-xs truncate text-charcoal">{log.reason || '—'}</td>
                    <td className="p-3.5 font-mono text-[11px] text-charcoal-muted">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedLog(log)}
                        title="View payload changes"
                      >
                        <Eye className="w-3.5 h-3.5 text-navy" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Payload JSON Diff Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Event: ${selectedLog.action}`}
          subtitle={`Logged at ${new Date(selectedLog.createdAt).toLocaleString()} by ${selectedLog.actorName} (${selectedLog.actorRole})`}
          maxWidth="lg"
          footer={
            <Button size="sm" variant="secondary" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-paper-dark border border-[#E5DFD5] rounded-sm grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <strong>Entity:</strong> {selectedLog.entityType}
              </div>
              <div>
                <strong>Entity ID:</strong> <span className="font-mono">{selectedLog.entityId || 'N/A'}</span>
              </div>
              <div>
                <strong>IP Address:</strong> {selectedLog.ipAddress || '127.0.0.1'}
              </div>
              <div>
                <strong>User Agent:</strong> <span className="truncate">{selectedLog.userAgent || 'API Client'}</span>
              </div>
            </div>

            {selectedLog.reason && (
              <div>
                <h4 className="font-bold text-navy uppercase text-[10px] mb-1">Administrative Justification</h4>
                <p className="p-2.5 bg-paper-dark border border-[#E5DFD5] rounded-sm text-charcoal">
                  {selectedLog.reason}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <h4 className="font-bold text-navy uppercase text-[10px] mb-1">Previous Data (Old)</h4>
                <pre className="p-2.5 bg-paper-dark border border-[#E5DFD5] rounded-sm font-mono text-[10px] overflow-x-auto max-h-40">
                  {JSON.stringify(selectedLog.oldData || null, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-navy uppercase text-[10px] mb-1">Updated Data (New)</h4>
                <pre className="p-2.5 bg-paper-dark border border-[#E5DFD5] rounded-sm font-mono text-[10px] overflow-x-auto max-h-40">
                  {JSON.stringify(selectedLog.newData || null, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
