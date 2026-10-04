import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import { Offer } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  FileDown,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const StudentOffers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [acceptModalTarget, setAcceptModalTarget] = useState<Offer | null>(null);
  const [declineModalTarget, setDeclineModalTarget] = useState<Offer | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getOffers();
      if (res.success) {
        setOffers(res.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleAccept = async () => {
    if (!acceptModalTarget) return;
    setIsProcessing(true);
    try {
      await studentApi.acceptOffer(acceptModalTarget.id);
      setAcceptModalTarget(null);
      await fetchOffers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to accept offer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!declineModalTarget) return;
    setIsProcessing(true);
    try {
      await studentApi.declineOffer(declineModalTarget.id, declineReason);
      setDeclineModalTarget(null);
      setDeclineReason('');
      await fetchOffers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to decline offer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCertificate = async () => {
    setIsDownloading(true);
    try {
      const res = await studentApi.downloadCertificate();
      const url = window.URL.createObjectURL(new Blob([res as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'USPS_Placement_Clearance_Certificate.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Error generating clearance certificate.');
    } finally {
      setIsDownloading(false);
    }
  };

  const acceptedOffer = offers.find((o) => o.status === 'ACCEPTED');

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Placement Offers & Clearance Governance</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Review formal recruitment offers, accept placement contracts, and obtain institutional graduation clearance
          </p>
        </div>

        {acceptedOffer && (
          <Button
            variant="accent"
            size="sm"
            isLoading={isDownloading}
            onClick={handleDownloadCertificate}
            icon={<FileDown className="w-4 h-4" />}
          >
            Download Clearance Certificate (PDF)
          </Button>
        )}
      </div>

      {/* Accepted Offer Success Banner */}
      {acceptedOffer && (
        <div className="p-5 bg-sage-50 border border-[#5D9479]/40 rounded-sm shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sage text-white rounded-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-sage-dark uppercase tracking-widest bg-white px-2 py-0.5 rounded-sm border border-sage/30">
                Official Campus Placement Confirmed
              </span>
              <h3 className="text-base font-bold text-navy font-heading mt-1">
                Placed at {acceptedOffer.drive?.company?.name || 'Bharat Tech Innovations'} — ₹ {acceptedOffer.packageOffered} {acceptedOffer.currency}
              </h3>
              <p className="text-xs text-charcoal-muted">
                Role: {acceptedOffer.drive?.jobRole} • Accepted on {new Date(acceptedOffer.acceptedAt || '').toLocaleDateString()}
              </p>
            </div>
          </div>

          <Button size="sm" variant="primary" onClick={handleDownloadCertificate} icon={<FileDown className="w-4 h-4" />}>
            Get Official NOC / Clearance
          </Button>
        </div>
      )}

      {/* Offers List */}
      {offers.length === 0 ? (
        <Card className="text-center py-12">
          <Award className="w-10 h-10 text-charcoal-muted mx-auto mb-2" />
          <h3 className="text-base font-bold text-navy font-heading">No Placement Offers Yet</h3>
          <p className="text-xs text-charcoal-muted mt-1">
            Formal job offers extended by verified recruiters will appear here for your review and acceptance.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer.id} className="p-5 border border-[#E5DFD5]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#EAE2D3]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-navy font-heading">{offer.drive?.jobRole}</h3>
                    <StatusBadge status={offer.status} />
                  </div>
                  <p className="text-xs font-semibold text-charcoal-muted flex items-center gap-1 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-brass" /> {offer.drive?.company?.name || 'Recruiting Partner'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Offered Annual Package</p>
                  <p className="text-xl font-bold text-navy font-heading mt-0.5">
                    ₹ {offer.packageOffered} {offer.currency}
                  </p>
                </div>
              </div>

              {/* Offer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3 bg-paper-dark rounded-sm border border-[#E5DFD5] text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Offer Date</p>
                  <p className="font-semibold text-navy">{offer.offerDate}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Single-Offer Policy</p>
                  <p className="font-semibold text-navy">Binding Institutional Acceptance</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Current Status</p>
                  <p className="font-semibold text-navy">{offer.status}</p>
                </div>
              </div>

              {/* Actions */}
              {offer.status === 'PENDING' && !acceptedOffer && (
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE2D3]">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setDeclineModalTarget(offer)}
                  >
                    Decline Offer
                  </Button>
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => setAcceptModalTarget(offer)}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Accept Placement Offer
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Accept Offer Modal (Single-Offer Policy Confirmation) */}
      {acceptModalTarget && (
        <Modal
          isOpen={!!acceptModalTarget}
          onClose={() => setAcceptModalTarget(null)}
          title="Accept Campus Placement Offer"
          subtitle="University Single-Offer Policy Declaration"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setAcceptModalTarget(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="accent" isLoading={isProcessing} onClick={handleAccept}>
                Confirm & Accept Offer
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <Alert type="warning" title="Institutional Single-Offer Governance">
              By accepting this offer from <strong>{acceptModalTarget.drive?.company?.name}</strong> at <strong>₹ {acceptModalTarget.packageOffered} {acceptModalTarget.currency}</strong>:
            </Alert>

            <ul className="list-disc pl-5 space-y-1 text-charcoal leading-relaxed">
              <li>You will be officially registered as <strong>PLACED</strong> with the University Training & Placement Office.</li>
              <li>In accordance with university placement guidelines, all other active applications will be finalized.</li>
              <li>Your official Graduation Placement & Clearance Certificate will be issued.</li>
            </ul>
          </div>
        </Modal>
      )}

      {/* Decline Offer Modal */}
      {declineModalTarget && (
        <Modal
          isOpen={!!declineModalTarget}
          onClose={() => setDeclineModalTarget(null)}
          title="Decline Placement Offer"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setDeclineModalTarget(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" isLoading={isProcessing} onClick={handleDecline}>
                Confirm Decline
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-charcoal leading-relaxed">
              Are you sure you want to decline the offer from <strong>{declineModalTarget.drive?.company?.name}</strong> for the role of <strong>{declineModalTarget.drive?.jobRole}</strong>?
            </p>
            <div>
              <label className="block font-semibold text-charcoal mb-1">Reason for Declining (Optional feedback for TPO)</label>
              <textarea
                rows={2}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g. Pursuing higher studies / opting for other research commitments..."
                className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
