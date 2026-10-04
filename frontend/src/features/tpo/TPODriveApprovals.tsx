import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { PlacementDrive } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Coins,
  GraduationCap,
  Eye,
} from 'lucide-react';

export const TPODriveApprovals: React.FC = () => {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');

  // Reject Modal State
  const [rejectTarget, setRejectTarget] = useState<PlacementDrive | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Drive Review Drawer
  const [reviewTarget, setReviewTarget] = useState<PlacementDrive | null>(null);

  const fetchDrives = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAllDrives();
      if (res.success) {
        setDrives(res.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleApprove = async (driveId: string) => {
    try {
      await adminApi.approveDrive(driveId);
      await fetchDrives();
      setReviewTarget(null);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to approve drive.');
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) {
      alert('Rejection reason is mandatory.');
      return;
    }

    setIsProcessing(true);
    try {
      await adminApi.rejectDrive(rejectTarget.id, rejectReason);
      setRejectTarget(null);
      setRejectReason('');
      await fetchDrives();
      setReviewTarget(null);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to reject drive.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingDrives = drives.filter((d) => d.status === 'PENDING_APPROVAL');
  const displayedDrives = filter === 'PENDING' ? pendingDrives : drives;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Placement Drive Approvals Queue</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Audit recruitment terms, verify compensation criteria, and authorize student registration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
              filter === 'PENDING'
                ? 'bg-navy text-white border-navy'
                : 'bg-white text-charcoal border-[#E5DFD5]'
            }`}
          >
            Pending Approvals ({pendingDrives.length})
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
              filter === 'ALL'
                ? 'bg-navy text-white border-navy'
                : 'bg-white text-charcoal border-[#E5DFD5]'
            }`}
          >
            All Drives ({drives.length})
          </button>
        </div>
      </div>

      {/* Drives Queue */}
      {displayedDrives.length === 0 ? (
        <Card className="text-center py-12">
          <ShieldCheck className="w-10 h-10 text-sage mx-auto mb-2" />
          <h3 className="text-base font-bold text-navy font-heading">No Pending Drive Approvals</h3>
          <p className="text-xs text-charcoal-muted mt-1">All recruiter postings have been evaluated and authorized.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedDrives.map((drive) => (
            <Card key={drive.id} className="p-5 border border-[#E5DFD5]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#EAE2D3]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-navy font-heading">{drive.jobRole}</h3>
                    <StatusBadge status={drive.status} />
                  </div>
                  <p className="text-xs font-semibold text-charcoal-muted mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-brass" /> {drive.companyName || drive.company?.name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReviewTarget(drive)}
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Review Criteria
                  </Button>

                  {drive.status === 'PENDING_APPROVAL' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleApprove(drive.id)}
                        icon={<CheckCircle2 className="w-3.5 h-3.5 text-sage-light" />}
                      >
                        Approve & Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setRejectTarget(drive)}
                        icon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Summary Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3 p-3 bg-paper-dark rounded-sm border border-[#E5DFD5] text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Package CTC</p>
                  <p className="font-bold text-navy mt-0.5">₹ {drive.packageMin} - {drive.packageMax} LPA</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Min CGPA & Backlogs</p>
                  <p className="font-semibold text-navy mt-0.5">CGPA: {drive.minCgpa} | Max Backlogs: {drive.maxBacklogs}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Application Deadline</p>
                  <p className="font-semibold text-navy mt-0.5">{new Date(drive.applicationDeadline).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Eligible Disciplines</p>
                  <p className="font-semibold text-navy mt-0.5">{drive.eligibleBranches.join(', ')}</p>
                </div>
              </div>

              {drive.status === 'REJECTED' && drive.rejectionReason && (
                <div className="p-2.5 bg-clay-50 border border-clay/30 rounded-sm text-xs text-clay-dark">
                  <strong>Rejection Reason Logged: </strong>
                  {drive.rejectionReason}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Review Drive Details Modal */}
      {reviewTarget && (
        <Modal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          title={`Review Drive: ${reviewTarget.jobRole}`}
          subtitle={`${reviewTarget.companyName} • Compensation: ₹ ${reviewTarget.packageMin} - ${reviewTarget.packageMax} LPA`}
          maxWidth="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-charcoal-muted">Status: {reviewTarget.status}</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => setReviewTarget(null)}>
                  Close
                </Button>
                {reviewTarget.status === 'PENDING_APPROVAL' && (
                  <>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setRejectTarget(reviewTarget);
                      }}
                    >
                      Reject Drive
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(reviewTarget.id)}
                    >
                      Approve & Open Drive
                    </Button>
                  </>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-navy uppercase text-[10px] tracking-wider mb-1">Job Description</h4>
              <p className="p-3 bg-paper-dark border border-[#E5DFD5] rounded-sm leading-relaxed whitespace-pre-line text-charcoal">
                {reviewTarget.jobDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-paper-dark border border-[#E5DFD5] rounded-sm">
              <div>
                <p className="font-bold text-navy">Eligible Branches:</p>
                <p className="text-charcoal mt-0.5">{reviewTarget.eligibleBranches.join(', ')}</p>
              </div>
              <div>
                <p className="font-bold text-navy">Academic Constraints:</p>
                <p className="text-charcoal mt-0.5">Min CGPA: {reviewTarget.minCgpa} | Backlogs: {reviewTarget.maxBacklogs}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <Modal
          isOpen={!!rejectTarget}
          onClose={() => setRejectTarget(null)}
          title="Reject Placement Drive Posting"
          subtitle="Audit compliance requires a formal justification reason"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setRejectTarget(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" isLoading={isProcessing} onClick={handleReject}>
                Confirm Rejection & Log Audit
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <Alert type="error">
              Rejecting this drive will return it to the recruiter in REJECTED state with your feedback and create an immutable audit record.
            </Alert>
            <div>
              <label className="block font-semibold text-charcoal mb-1">Formal Justification / Feedback for Recruiter *</label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Compensation structure below university guidelines / please adjust eligible disciplines to include IT..."
                className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
