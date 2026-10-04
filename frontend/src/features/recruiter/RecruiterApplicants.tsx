import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recruiterApi } from '../../services/api';
import { Application, PlacementDrive } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  Award,
  FileDown,
  ExternalLink,
  GraduationCap,
  Eye,
} from 'lucide-react';

export const RecruiterApplicants: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDriveId = searchParams.get('driveId') || '';

  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [activeDriveId, setActiveDriveId] = useState<string>(selectedDriveId);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Candidate Details Drawer Modal
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);

  // Interview Scheduling Modal
  const [scheduleTarget, setScheduleTarget] = useState<Application | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    roundNumber: 1,
    roundType: 'Technical Round 1 (Live Coding & DSA)',
    scheduledAt: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16),
    mode: 'ONLINE' as 'ONLINE' | 'OFFLINE',
    meetingUrl: 'https://meet.google.com/usps-round-eval',
    venue: '',
    studentInstructions: 'Please join with camera enabled and your development environment ready.',
  });
  const [isScheduling, setIsScheduling] = useState(false);

  // Offer Modal
  const [offerTarget, setOfferTarget] = useState<Application | null>(null);
  const [offerForm, setOfferForm] = useState({
    packageOffered: 16.5,
    currency: 'INR (LPA)',
  });
  const [isIssuingOffer, setIsIssuingOffer] = useState(false);

  const loadDrives = async () => {
    try {
      const res = await recruiterApi.getMyDrives();
      if (res.success && res.data) {
        setDrives(res.data);
        if (!activeDriveId && res.data.length > 0) {
          setActiveDriveId(res.data[0].id);
        }
      }
    } catch {
      // Ignore
    }
  };

  const loadApplicants = async (driveId: string) => {
    if (!driveId) return;
    setIsLoading(true);
    try {
      const res = await recruiterApi.getApplicants(driveId);
      if (res.success && res.data) {
        setApplicants(res.data.applicants || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrives();
  }, []);

  useEffect(() => {
    if (activeDriveId) {
      loadApplicants(activeDriveId);
      setSearchParams({ driveId: activeDriveId });
    }
  }, [activeDriveId]);

  const handleShortlist = async (appId: string) => {
    try {
      await recruiterApi.shortlistCandidate(activeDriveId, appId);
      await loadApplicants(activeDriveId);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error shortlisting candidate');
    }
  };

  const handleReject = async (appId: string) => {
    try {
      await recruiterApi.rejectCandidate(activeDriveId, appId);
      await loadApplicants(activeDriveId);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error rejecting candidate');
    }
  };

  const handleScheduleInterview = async () => {
    if (!scheduleTarget) return;
    setIsScheduling(true);
    try {
      await recruiterApi.scheduleInterview(activeDriveId, {
        applicationId: scheduleTarget.id,
        roundNumber: Number(interviewForm.roundNumber),
        roundType: interviewForm.roundType,
        scheduledAt: new Date(interviewForm.scheduledAt).toISOString(),
        mode: interviewForm.mode,
        meetingUrl: interviewForm.meetingUrl,
        venue: interviewForm.venue,
        studentInstructions: interviewForm.studentInstructions,
      });
      setScheduleTarget(null);
      await loadApplicants(activeDriveId);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to schedule interview.');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleIssueOffer = async () => {
    if (!offerTarget) return;
    setIsIssuingOffer(true);
    try {
      await recruiterApi.issueOffer(activeDriveId, {
        applicationId: offerTarget.id,
        packageOffered: Number(offerForm.packageOffered),
        currency: offerForm.currency,
      });
      setOfferTarget(null);
      await loadApplicants(activeDriveId);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to issue offer.');
    } finally {
      setIsIssuingOffer(false);
    }
  };

  const handleExportCSV = () => {
    if (!activeDriveId) return;
    window.open(`/api/recruiter/drives/${activeDriveId}/shortlist/export`, '_blank');
  };

  // Filtered applicants
  const filtered = applicants.filter((a) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        a.student?.fullName?.toLowerCase().includes(q) ||
        a.student?.rollNumber?.toLowerCase().includes(q) ||
        a.student?.email?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (branchFilter !== 'ALL' && a.student?.branch !== branchFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  const activeDrive = drives.find((d) => d.id === activeDriveId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Candidate Evaluation & Screening</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Review student academic profiles, manage shortlists, schedule rounds, and extend job offers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<FileDown className="w-4 h-4" />}
          >
            Export Authorized Shortlist (CSV)
          </Button>
        </div>
      </div>

      {/* Drive Selector Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E5DFD5]">
        {drives.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDriveId(d.id)}
            className={`px-3 py-2 text-xs font-semibold rounded-t-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeDriveId === d.id
                ? 'bg-navy text-paper border-t-2 border-brass shadow-xs'
                : 'bg-white text-charcoal hover:bg-paper-dark border border-b-0 border-[#E5DFD5]'
            }`}
          >
            <span>{d.jobRole}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeDriveId === d.id ? 'bg-brass text-navy' : 'bg-paper-dark text-charcoal-muted'
              }`}
            >
              {d.applicantCount || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, roll number..."
              className="w-full pl-9 pr-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
            />
          </div>

          <div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
            >
              <option value="ALL">All Disciplines / Branches</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="IT">Information Technology (IT)</option>
              <option value="ECE">Electronics & Communication (ECE)</option>
              <option value="Mechanical">Mechanical Engineering</option>
              <option value="Civil">Civil Engineering</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
            >
              <option value="ALL">All Application Statuses</option>
              <option value="SUBMITTED">SUBMITTED (Pending Review)</option>
              <option value="SHORTLISTED">SHORTLISTED</option>
              <option value="INTERVIEW_SCHEDULED">INTERVIEW SCHEDULED</option>
              <option value="OFFERED">OFFER EXTENDED</option>
              <option value="ACCEPTED">OFFER ACCEPTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Applicants Table */}
      <Card className="p-0 overflow-hidden border border-[#E5DFD5]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-paper-dark border-b border-[#E5DFD5] text-charcoal-muted uppercase font-bold text-[10px]">
                <th className="p-3.5">Candidate</th>
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5">CGPA</th>
                <th className="p-3.5">Backlogs</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D3]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-charcoal-muted">
                    No applicants match the selected criteria for this drive.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-paper/60 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-navy">{app.student?.fullName || 'Candidate'}</p>
                      <p className="text-[11px] text-charcoal-muted">{app.student?.email}</p>
                    </td>
                    <td className="p-3.5 font-semibold text-charcoal">{app.student?.rollNumber}</td>
                    <td className="p-3.5 font-medium">{app.student?.branch}</td>
                    <td className="p-3.5 font-bold text-navy">{app.student?.cgpa.toFixed(2)}</td>
                    <td className="p-3.5">
                      <span className={app.student?.backlogCount === 0 ? 'text-sage-dark font-semibold' : 'text-clay-dark font-semibold'}>
                        {app.student?.backlogCount || 0}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCandidate(app)}
                          title="View Profile & Resume"
                        >
                          <Eye className="w-3.5 h-3.5 text-navy" />
                        </Button>

                        {app.status === 'SUBMITTED' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShortlist(app.id)}
                            >
                              Shortlist
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-clay hover:bg-clay-50"
                              onClick={() => handleReject(app.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {(app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED') && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setScheduleTarget(app);
                              setInterviewForm({
                                ...interviewForm,
                                roundNumber: (app.interview?.roundNumber || 0) + 1,
                              });
                            }}
                            icon={<Calendar className="w-3.5 h-3.5" />}
                          >
                            Schedule Round
                          </Button>
                        )}

                        {(app.status === 'INTERVIEW_SCHEDULED' || app.status === 'SHORTLISTED') && (
                          <Button
                            size="sm"
                            variant="accent"
                            onClick={() => {
                              setOfferTarget(app);
                              setOfferForm({
                                packageOffered: activeDrive?.packageMax || 16.0,
                                currency: 'INR (LPA)',
                              });
                            }}
                            icon={<Award className="w-3.5 h-3.5" />}
                          >
                            Offer
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Candidate Profile Details Drawer Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title={selectedCandidate.student?.fullName || 'Candidate Profile'}
          subtitle={`Roll No: ${selectedCandidate.student?.rollNumber} • ${selectedCandidate.student?.branch} (${selectedCandidate.student?.department})`}
          maxWidth="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-charcoal-muted">
                Applied on: {new Date(selectedCandidate.appliedAt).toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => setSelectedCandidate(null)}>
                  Close
                </Button>
                {selectedCandidate.student?.resumeUrl && (
                  <a
                    href={selectedCandidate.student.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-sm hover:bg-navy-light inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Preview Verified Resume (PDF)
                  </a>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-paper-dark rounded-sm border border-[#E5DFD5]">
              <div>
                <p className="text-[10px] uppercase font-bold text-charcoal-muted">CGPA</p>
                <p className="text-sm font-bold text-navy mt-0.5">{selectedCandidate.student?.cgpa.toFixed(2)} / 10.00</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-charcoal-muted">Active Backlogs</p>
                <p className="text-sm font-bold text-navy mt-0.5">{selectedCandidate.student?.backlogCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-charcoal-muted">Passing Cohort</p>
                <p className="text-sm font-bold text-navy mt-0.5">{selectedCandidate.student?.passingYear || 2026}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-charcoal-muted">Placement Status</p>
                <p className="text-sm font-bold text-navy mt-0.5">{selectedCandidate.student?.placementStatus || 'UNPLACED'}</p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="font-bold text-navy uppercase text-[10px] tracking-wider mb-1.5">Technical Competencies</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedCandidate.student?.skills && selectedCandidate.student.skills.length > 0 ? (
                  selectedCandidate.student.skills.map((s: any) => (
                    <span key={s.id || s.skillName} className="px-2 py-1 bg-paper-dark border border-[#D8D3C8] rounded-sm font-semibold text-navy">
                      {s.skillName} ({s.skillLevel})
                    </span>
                  ))
                ) : (
                  <span className="text-charcoal-muted">Data Structures & Algorithms, TypeScript, React, PostgreSQL</span>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Schedule Interview Modal */}
      {scheduleTarget && (
        <Modal
          isOpen={!!scheduleTarget}
          onClose={() => setScheduleTarget(null)}
          title={`Schedule Interview: ${scheduleTarget.student?.fullName}`}
          subtitle={`Drive: ${activeDrive?.jobRole}`}
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setScheduleTarget(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" isLoading={isScheduling} onClick={handleScheduleInterview}>
                Confirm & Notify Candidate
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Round Number</label>
                <input
                  type="number"
                  min="1"
                  value={interviewForm.roundNumber}
                  onChange={(e) => setInterviewForm({ ...interviewForm, roundNumber: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-charcoal mb-1">Interview Mode</label>
                <select
                  value={interviewForm.mode}
                  onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                >
                  <option value="ONLINE">ONLINE (Video Meeting)</option>
                  <option value="OFFLINE">OFFLINE (Campus Room / Hall)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">Round Designation / Type</label>
              <input
                type="text"
                value={interviewForm.roundType}
                onChange={(e) => setInterviewForm({ ...interviewForm, roundType: e.target.value })}
                className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">Date & Time Slot</label>
              <input
                type="datetime-local"
                value={interviewForm.scheduledAt}
                onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
                className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
              />
            </div>

            {interviewForm.mode === 'ONLINE' ? (
              <div>
                <label className="block font-semibold text-charcoal mb-1">Meeting URL (Google Meet / Teams / Zoom)</label>
                <input
                  type="url"
                  value={interviewForm.meetingUrl}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meetingUrl: e.target.value })}
                  className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                />
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-charcoal mb-1">Campus Venue / Room</label>
                <input
                  type="text"
                  placeholder="e.g. Placement Cell Conference Hall A"
                  value={interviewForm.venue}
                  onChange={(e) => setInterviewForm({ ...interviewForm, venue: e.target.value })}
                  className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-charcoal mb-1">Candidate Preparation Guidelines</label>
              <textarea
                rows={2}
                value={interviewForm.studentInstructions}
                onChange={(e) => setInterviewForm({ ...interviewForm, studentInstructions: e.target.value })}
                className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Issue Offer Modal */}
      {offerTarget && (
        <Modal
          isOpen={!!offerTarget}
          onClose={() => setOfferTarget(null)}
          title={`Extend Placement Offer: ${offerTarget.student?.fullName}`}
          subtitle={`Role: ${activeDrive?.jobRole}`}
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setOfferTarget(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="accent" isLoading={isIssuingOffer} onClick={handleIssueOffer}>
                Issue Official Offer
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <Alert type="info">
              Issuing an offer will notify the student and update their status to <strong>OFFERED</strong>.
            </Alert>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Offered Annual CTC (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={offerForm.packageOffered}
                  onChange={(e) => setOfferForm({ ...offerForm, packageOffered: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs font-bold text-navy"
                />
              </div>
              <div>
                <label className="block font-semibold text-charcoal mb-1">Currency</label>
                <input
                  type="text"
                  value={offerForm.currency}
                  onChange={(e) => setOfferForm({ ...offerForm, currency: e.target.value })}
                  className="w-full px-3 py-1.5 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
