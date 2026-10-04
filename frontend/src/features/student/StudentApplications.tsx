import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import { Application } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { ApplicationStepper } from '../../components/ui/Stepper';
import {
  FileText,
  Building2,
  Calendar,
  AlertTriangle,
  History,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export const StudentApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawTarget, setWithdrawTarget] = useState<Application | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getApplications();
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    setIsWithdrawing(true);
    try {
      await studentApi.withdrawApplication(withdrawTarget.id);
      setWithdrawTarget(null);
      await fetchApps();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to withdraw application.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-150">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">My Applications & Selection Pipeline</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Track your recruitment stages from submission to interview rounds and final offers
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="w-10 h-10 text-charcoal-muted mx-auto mb-2" />
          <h3 className="text-base font-bold text-navy font-heading">No Applications Yet</h3>
          <p className="text-xs text-charcoal-muted mt-1">Browse open campus placement drives to apply.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="p-5 border border-[#E5DFD5]">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EAE2D3]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-navy font-heading">{app.drive?.jobRole}</h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs font-medium text-charcoal-muted flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-brass" /> {app.drive?.company?.name || 'Recruiting Partner'} • ₹ {app.drive?.packageMin} - {app.drive?.packageMax} LPA
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-charcoal-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </span>

                  {app.status !== 'ACCEPTED' && app.status !== 'PLACED' && app.status !== 'WITHDRAWN' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-clay hover:bg-clay-50"
                      onClick={() => setWithdrawTarget(app)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>

              {/* 8-Stage Pipeline Stepper */}
              <div className="my-3 px-2">
                <ApplicationStepper status={app.status} />
              </div>

              {/* Status History Logs */}
              {app.history && app.history.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#EAE2D3] bg-paper-dark/50 p-3 rounded-sm">
                  <p className="text-[10px] font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1">
                    <History className="w-3 h-3 text-brass" /> Stage Transition History
                  </p>
                  <div className="space-y-1.5 text-xs">
                    {app.history.map((h) => (
                      <div key={h.id} className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-charcoal">
                          • {h.reason || `Transitioned to ${h.newStatus}`}
                        </span>
                        <span className="text-charcoal-muted">
                          {new Date(h.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawTarget && (
        <Modal
          isOpen={!!withdrawTarget}
          onClose={() => setWithdrawTarget(null)}
          title="Confirm Application Withdrawal"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setWithdrawTarget(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" isLoading={isWithdrawing} onClick={handleWithdraw}>
                Confirm Withdrawal
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <Alert type="warning">
              Are you sure you want to withdraw your application for <strong>{withdrawTarget.drive?.jobRole}</strong> with {withdrawTarget.drive?.company?.name}?
            </Alert>
            <p className="text-charcoal leading-relaxed">
              Withdrawing will remove your profile from the recruiter&apos;s active review pipeline.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
