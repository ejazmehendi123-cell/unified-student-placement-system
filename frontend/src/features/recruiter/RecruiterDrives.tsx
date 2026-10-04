import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recruiterApi } from '../../services/api';
import { PlacementDrive } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import {
  Briefcase,
  Users,
  Plus,
  Clock,
  Calendar,
  Building2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const RecruiterDrives: React.FC = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDrives = async () => {
    setIsLoading(true);
    try {
      const res = await recruiterApi.getMyDrives();
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Corporate Placement Drives</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage your company&apos;s campus hiring drives, recruitment stages, and applicant quotas
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/recruiter/drives/new')}
          icon={<Plus className="w-4 h-4" />}
        >
          Post New Drive
        </Button>
      </div>

      {drives.length === 0 ? (
        <Card className="text-center py-12">
          <Briefcase className="w-10 h-10 text-charcoal-muted mx-auto mb-2" />
          <h3 className="text-base font-bold text-navy font-heading">No Placement Drives Created</h3>
          <p className="text-xs text-charcoal-muted mt-1">
            Post your first university placement drive to start receiving qualified student applications.
          </p>
          <Button
            size="sm"
            variant="primary"
            className="mt-3"
            onClick={() => navigate('/recruiter/drives/new')}
          >
            Post Drive Wizard →
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {drives.map((drive) => (
            <Card key={drive.id} className="p-5 border border-[#E5DFD5]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#EAE2D3]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-navy font-heading">{drive.jobRole}</h3>
                    <StatusBadge status={drive.status} />
                  </div>
                  <p className="text-xs font-semibold text-charcoal-muted mt-0.5">
                    Company: {drive.companyName || 'Corporate Partner'} • Min CGPA: {drive.minCgpa.toFixed(2)} • Max Backlogs: {drive.maxBacklogs}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(`/recruiter/applicants?driveId=${drive.id}`)}
                    icon={<Users className="w-4 h-4" />}
                  >
                    View Applicants ({drive.applicantCount || 0})
                  </Button>
                </div>
              </div>

              {/* Drive Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 bg-paper-dark rounded-sm border border-[#E5DFD5] text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Package Range</p>
                  <p className="font-bold text-navy mt-0.5">₹ {drive.packageMin} - {drive.packageMax} LPA</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Application Deadline</p>
                  <p className="font-semibold text-navy mt-0.5">{new Date(drive.applicationDeadline).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Shortlisted Candidates</p>
                  <p className="font-bold text-navy mt-0.5">{drive.shortlistedCount || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Eligible Disciplines</p>
                  <p className="font-semibold text-navy mt-0.5">{drive.eligibleBranches.join(', ')}</p>
                </div>
              </div>

              {drive.status === 'REJECTED' && drive.rejectionReason && (
                <div className="p-3 bg-clay-50 border border-clay/30 rounded-sm text-xs text-clay-dark">
                  <strong>TPO Feedback / Changes Requested: </strong>
                  {drive.rejectionReason}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
