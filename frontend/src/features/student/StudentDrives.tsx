import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import { PlacementDrive } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  GraduationCap,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const StudentDrives: React.FC = () => {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [eligibilityFilter, setEligibilityFilter] = useState('ALL'); // ALL, ELIGIBLE, APPLIED
  const [sortBy, setSortBy] = useState('deadline'); // deadline, package, recent

  // Selected Drive for Detail & Application Modal
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchDrives = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getDrives();
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

  const handleApply = async (driveId: string) => {
    setIsApplying(true);
    try {
      const res = await studentApi.applyDrive(driveId);
      if (res.success) {
        setApplySuccess(true);
        // Refresh drive state
        await fetchDrives();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  // Multi-facet Filtering
  const filteredDrives = drives
    .filter((d) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          d.jobRole.toLowerCase().includes(q) ||
          d.company?.name?.toLowerCase().includes(q) ||
          d.jobDescription.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Branch filter
      if (selectedBranch !== 'ALL') {
        if (!d.eligibleBranches.includes(selectedBranch)) return false;
      }

      // Eligibility filter
      if (eligibilityFilter === 'ELIGIBLE' && !d.eligibility?.eligible) return false;
      if (eligibilityFilter === 'APPLIED' && !d.applied) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
      }
      if (sortBy === 'package') {
        return b.packageMax - a.packageMax;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Campus Placement Drives</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Discover verified recruitment opportunities with deterministic eligibility screening
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="md">
            Showing {filteredDrives.length} of {drives.length} Drives
          </Badge>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <Card className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, skills..."
              className="w-full pl-9 pr-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs focus:ring-1 focus:ring-navy"
            />
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs focus:ring-1 focus:ring-navy"
            >
              <option value="ALL">All Disciplines & Branches</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="IT">Information Technology (IT)</option>
              <option value="ECE">Electronics & Communication (ECE)</option>
              <option value="Mechanical">Mechanical Engineering</option>
              <option value="Civil">Civil Engineering</option>
            </select>
          </div>

          {/* Eligibility Filter */}
          <div>
            <select
              value={eligibilityFilter}
              onChange={(e) => setEligibilityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs focus:ring-1 focus:ring-navy"
            >
              <option value="ALL">All Drives</option>
              <option value="ELIGIBLE">✓ Eligible Drives Only</option>
              <option value="APPLIED">Applied Drives Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs focus:ring-1 focus:ring-navy"
            >
              <option value="deadline">Sort by: Approaching Deadline</option>
              <option value="package">Sort by: Highest CTC Package</option>
              <option value="recent">Sort by: Recently Published</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Drives Grid */}
      {filteredDrives.length === 0 ? (
        <Card className="text-center py-12">
          <Briefcase className="w-10 h-10 text-charcoal-muted mx-auto mb-2" />
          <h3 className="text-base font-bold text-navy font-heading">No placement drives found</h3>
          <p className="text-xs text-charcoal-muted mt-1">Try clearing filters or search criteria.</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => {
              setSearchQuery('');
              setSelectedBranch('ALL');
              setEligibilityFilter('ALL');
            }}
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrives.map((drive) => {
            const isEligible = drive.eligibility?.eligible;
            const hasApplied = drive.applied;

            return (
              <Card
                key={drive.id}
                className="flex flex-col justify-between hover:border-navy hover:shadow-card transition-all p-5"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold text-navy uppercase tracking-wider bg-navy-50 px-2 py-0.5 rounded-sm border border-navy-100">
                      {drive.company?.industry || 'Technology'}
                    </span>

                    {hasApplied ? (
                      <Badge variant="accent" size="sm">
                        Applied ({drive.applicationStatus})
                      </Badge>
                    ) : isEligible ? (
                      <Badge variant="success" size="sm">
                        ✓ Eligible
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm">
                        ✕ Ineligible
                      </Badge>
                    )}
                  </div>

                  {/* Role & Company */}
                  <h3 className="text-base font-bold text-navy font-heading leading-snug">{drive.jobRole}</h3>
                  <p className="text-xs font-semibold text-charcoal-muted mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-brass" /> {drive.company?.name || drive.companyName}
                  </p>

                  {/* Compensation & Criteria */}
                  <div className="mt-4 pt-3 border-t border-[#EAE2D3] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-charcoal-muted">Package CTC</p>
                      <p className="text-sm font-bold text-navy mt-0.5">
                        ₹ {drive.packageMin} - {drive.packageMax} LPA
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-charcoal-muted">Min CGPA</p>
                      <p className="text-sm font-bold text-navy mt-0.5">{drive.minCgpa.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Eligible branches */}
                  <div className="mt-3">
                    <p className="text-[10px] uppercase font-bold text-charcoal-muted mb-1">Eligible Branches</p>
                    <div className="flex flex-wrap gap-1">
                      {drive.eligibleBranches.map((b) => (
                        <span
                          key={b}
                          className="px-1.5 py-0.5 bg-paper-dark border border-[#E5DFD5] text-[10px] font-semibold text-charcoal rounded-sm"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Explicit Eligibility Breakdown Preview */}
                  <div className="mt-3 p-2 bg-paper-dark rounded-sm border border-[#E5DFD5] text-[11px] leading-relaxed text-charcoal-muted">
                    {isEligible ? (
                      <span className="text-sage-dark font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sage shrink-0" />
                        You meet all academic criteria.
                      </span>
                    ) : (
                      <span className="text-clay-dark font-medium flex items-start gap-1">
                        <XCircle className="w-3.5 h-3.5 text-clay shrink-0 mt-0.5" />
                        {drive.eligibility?.reason}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer & Action */}
                <div className="mt-4 pt-3 border-t border-[#EAE2D3] flex items-center justify-between">
                  <span className="text-[11px] text-charcoal-muted flex items-center gap-1">
                    <Clock className="w-3 h-3 text-brass" />
                    Deadline: {new Date(drive.applicationDeadline).toLocaleDateString()}
                  </span>

                  <Button
                    size="sm"
                    variant={hasApplied ? 'outline' : isEligible ? 'primary' : 'secondary'}
                    onClick={() => {
                      setSelectedDrive(drive);
                      setApplySuccess(false);
                    }}
                  >
                    {hasApplied ? 'View Status' : isEligible ? 'Apply Now →' : 'View Details'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Drive Details & 7-Point Live Eligibility Breakdown Modal */}
      {selectedDrive && (
        <Modal
          isOpen={!!selectedDrive}
          onClose={() => setSelectedDrive(null)}
          title={selectedDrive.jobRole}
          subtitle={`${selectedDrive.company?.name || selectedDrive.companyName} • Campus Recruitment 2026`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-charcoal-muted">
                Deadline: {new Date(selectedDrive.applicationDeadline).toLocaleString()}
              </span>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedDrive(null)}>
                  Close
                </Button>

                {!selectedDrive.applied && selectedDrive.eligibility?.eligible && (
                  <Button
                    variant="accent"
                    size="sm"
                    isLoading={isApplying}
                    disabled={applySuccess}
                    onClick={() => handleApply(selectedDrive.id)}
                  >
                    {applySuccess ? '✓ Application Submitted' : 'Confirm & Submit Application'}
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {applySuccess && (
              <Alert type="success" title="Application Successfully Submitted!">
                Your verified academic profile and resume have been submitted to {selectedDrive.company?.name}. You can track your progress in the Applications tab.
              </Alert>
            )}

            {/* Compensation & Criteria Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-paper-dark border border-[#E5DFD5] rounded-sm">
              <div>
                <p className="text-[10px] uppercase font-bold text-charcoal-muted">CTC Compensation</p>
                <p className="text-sm font-bold text-navy mt-0.5">
                  ₹ {selectedDrive.packageMin} - {selectedDrive.packageMax} LPA
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-charcoal-muted">Min CGPA</p>
                <p className="text-sm font-bold text-navy mt-0.5">{selectedDrive.minCgpa.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-charcoal-muted">Max Backlogs</p>
                <p className="text-sm font-bold text-navy mt-0.5">{selectedDrive.maxBacklogs}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-charcoal-muted">Drive Status</p>
                <p className="text-sm font-bold text-navy mt-0.5">{selectedDrive.status}</p>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <h4 className="font-bold text-navy text-xs uppercase tracking-wider mb-1">Role Description & Responsibilities</h4>
              <p className="text-charcoal leading-relaxed whitespace-pre-line p-3 bg-white border border-[#E5DFD5] rounded-sm">
                {selectedDrive.jobDescription}
              </p>
            </div>

            {/* 7-Factor Comprehensive Eligibility Engine Breakdown */}
            <div>
              <h4 className="font-bold text-navy text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brass" /> Live Eligibility Engine Breakdown
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div
                  className={`p-2.5 rounded-sm border flex items-center justify-between ${
                    selectedDrive.eligibility?.cgpaCheck
                      ? 'bg-sage-50 border-sage/30 text-sage-dark'
                      : 'bg-clay-50 border-clay/30 text-clay-dark'
                  }`}
                >
                  <span>1. CGPA Threshold (Min: {selectedDrive.minCgpa.toFixed(2)})</span>
                  {selectedDrive.eligibility?.cgpaCheck ? (
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                  ) : (
                    <XCircle className="w-4 h-4 text-clay" />
                  )}
                </div>

                <div
                  className={`p-2.5 rounded-sm border flex items-center justify-between ${
                    selectedDrive.eligibility?.backlogCheck
                      ? 'bg-sage-50 border-sage/30 text-sage-dark'
                      : 'bg-clay-50 border-clay/30 text-clay-dark'
                  }`}
                >
                  <span>2. Backlog Count (Max Allowed: {selectedDrive.maxBacklogs})</span>
                  {selectedDrive.eligibility?.backlogCheck ? (
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                  ) : (
                    <XCircle className="w-4 h-4 text-clay" />
                  )}
                </div>

                <div
                  className={`p-2.5 rounded-sm border flex items-center justify-between ${
                    selectedDrive.eligibility?.branchCheck
                      ? 'bg-sage-50 border-sage/30 text-sage-dark'
                      : 'bg-clay-50 border-clay/30 text-clay-dark'
                  }`}
                >
                  <span>3. Branch Discipline Match ({selectedDrive.eligibleBranches.join(', ')})</span>
                  {selectedDrive.eligibility?.branchCheck ? (
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                  ) : (
                    <XCircle className="w-4 h-4 text-clay" />
                  )}
                </div>

                <div
                  className={`p-2.5 rounded-sm border flex items-center justify-between ${
                    selectedDrive.eligibility?.profileCheck
                      ? 'bg-sage-50 border-sage/30 text-sage-dark'
                      : 'bg-clay-50 border-clay/30 text-clay-dark'
                  }`}
                >
                  <span>4. Profile Complete & Resume Uploaded</span>
                  {selectedDrive.eligibility?.profileCheck ? (
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                  ) : (
                    <XCircle className="w-4 h-4 text-clay" />
                  )}
                </div>

                <div
                  className={`p-2.5 rounded-sm border flex items-center justify-between ${
                    selectedDrive.eligibility?.placementPolicyCheck
                      ? 'bg-sage-50 border-sage/30 text-sage-dark'
                      : 'bg-clay-50 border-clay/30 text-clay-dark'
                  }`}
                >
                  <span>5. University Single-Offer Standing</span>
                  {selectedDrive.eligibility?.placementPolicyCheck ? (
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                  ) : (
                    <XCircle className="w-4 h-4 text-clay" />
                  )}
                </div>

                <div
                  className={`p-2.5 rounded-sm border flex items-center justify-between ${
                    selectedDrive.eligibility?.deadlineCheck
                      ? 'bg-sage-50 border-sage/30 text-sage-dark'
                      : 'bg-clay-50 border-clay/30 text-clay-dark'
                  }`}
                >
                  <span>6. Application Deadline Active</span>
                  {selectedDrive.eligibility?.deadlineCheck ? (
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                  ) : (
                    <XCircle className="w-4 h-4 text-clay" />
                  )}
                </div>
              </div>

              <div className="mt-2.5 p-2.5 bg-paper-dark border border-[#E5DFD5] rounded-sm text-xs">
                <span className="font-bold text-navy">Summary Evaluation: </span>
                <span className={selectedDrive.eligibility?.eligible ? 'text-sage-dark font-medium' : 'text-clay-dark font-medium'}>
                  {selectedDrive.eligibility?.reason}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
