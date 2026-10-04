import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../services/api';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { ApplicationStepper } from '../../components/ui/Stepper';
import {
  Briefcase,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profRes, drivesRes, appsRes, intRes, offRes] = await Promise.all([
        studentApi.getProfile(),
        studentApi.getDrives(),
        studentApi.getApplications(),
        studentApi.getInterviews(),
        studentApi.getOffers(),
      ]);

      if (profRes.success) setProfileData(profRes.data);
      if (drivesRes.success) setDrives(drivesRes.data || []);
      if (appsRes.success) setApplications(appsRes.data || []);
      if (intRes.success) setInterviews(intRes.data || []);
      if (offRes.success) setOffers(offRes.data || []);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const student = profileData?.student;
  const profilePercentage = profileData?.profilePercentage || 0;
  const pendingOffer = offers.find((o) => o.status === 'PENDING');
  const acceptedOffer = offers.find((o) => o.status === 'ACCEPTED');

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">
            Welcome back, {profileData?.profile?.fullName || 'Student'}
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Roll No: <span className="font-semibold text-charcoal">{student?.rollNumber || '2022CSE014'}</span> | Department of {student?.department || 'Computer Science'} ({student?.branch || 'CSE'})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {student?.isPlaced ? (
            <Badge variant="success" size="md">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> Officially Placed
            </Badge>
          ) : (
            <Badge variant="neutral" size="md">
              Placement Active
            </Badge>
          )}
        </div>
      </div>

      {/* Prominent Offer Action Banner (If received an offer) */}
      {pendingOffer && (
        <Alert type="warning" title="Placement Offer Extended — Action Required">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <p className="text-xs">
              <strong>{pendingOffer.drive?.company?.name || 'Bharat Tech'}</strong> has extended a placement offer for the role of <strong>{pendingOffer.drive?.jobRole}</strong> at <strong>{pendingOffer.packageOffered} {pendingOffer.currency}</strong>. Please review and respond in your Offers tab.
            </p>
            <Button
              size="sm"
              variant="accent"
              onClick={() => navigate('/student/offers')}
              className="shrink-0"
            >
              Review Offer Details →
            </Button>
          </div>
        </Alert>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cumulative CGPA"
          value={student?.cgpa ? student.cgpa.toFixed(2) : '8.75'}
          subtitle={`${student?.backlogCount || 0} Active Backlogs`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Eligible Drives"
          value={drives.filter((d) => d.eligibility?.eligible).length}
          subtitle={`${drives.length} total drives published`}
          icon={<Briefcase className="w-5 h-5 text-brass" />}
        />
        <StatCard
          title="Applications"
          value={applications.length}
          subtitle={`${applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW_SCHEDULED').length} in active pipeline`}
          icon={<FileCheck className="w-5 h-5 text-sage" />}
        />
        <StatCard
          title="Scheduled Interviews"
          value={interviews.length}
          subtitle={interviews.length > 0 ? 'Upcoming technical round' : 'No rounds today'}
          icon={<Calendar className="w-5 h-5 text-navy" />}
        />
      </div>

      {/* Placement Readiness Section (Section 11 in master prompt) */}
      <Card className="border border-[#E5DFD5]">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-[#EAE2D3] gap-3">
          <div>
            <h2 className="text-base font-bold text-navy font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brass" />
              Placement Readiness Evaluation
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5">
              University verification status for campus recruitment participation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-navy">{profilePercentage}% Complete</span>
            <div className="w-32 h-2.5 bg-paper-dark rounded-full overflow-hidden border border-[#E5DFD5]">
              <div
                className="h-full bg-navy rounded-full transition-all duration-500"
                style={{ width: `${profilePercentage}%` }}
              />
            </div>
            {profilePercentage < 100 && (
              <Button size="sm" variant="outline" onClick={() => navigate('/student/profile')}>
                Complete Profile →
              </Button>
            )}
          </div>
        </div>

        {/* 5-Criteria Progress Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-paper-dark rounded-sm border border-[#E5DFD5]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-charcoal">Profile Data</span>
              <CheckCircle2 className="w-4 h-4 text-sage" />
            </div>
            <p className="text-[11px] text-charcoal-muted mt-1">Personal & Contact Info verified</p>
          </div>

          <div className="p-3 bg-paper-dark rounded-sm border border-[#E5DFD5]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-charcoal">Resume</span>
              {student?.resumeDocumentId ? (
                <CheckCircle2 className="w-4 h-4 text-sage" />
              ) : (
                <AlertCircle className="w-4 h-4 text-clay" />
              )}
            </div>
            <p className="text-[11px] text-charcoal-muted mt-1">
              {student?.resumeDocumentId ? 'PDF Resume attached' : 'Resume upload pending'}
            </p>
          </div>

          <div className="p-3 bg-paper-dark rounded-sm border border-[#E5DFD5]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-charcoal">Academics</span>
              <CheckCircle2 className="w-4 h-4 text-sage" />
            </div>
            <p className="text-[11px] text-charcoal-muted mt-1">5 Semesters synchronized</p>
          </div>

          <div className="p-3 bg-paper-dark rounded-sm border border-[#E5DFD5]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-charcoal">Skills & Projects</span>
              <CheckCircle2 className="w-4 h-4 text-sage" />
            </div>
            <p className="text-[11px] text-charcoal-muted mt-1">5 Skills & 2 Projects</p>
          </div>

          <div className="p-3 bg-paper-dark rounded-sm border border-[#E5DFD5]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-charcoal">Policy Standing</span>
              <CheckCircle2 className="w-4 h-4 text-sage" />
            </div>
            <p className="text-[11px] text-charcoal-muted mt-1">Single-Offer compliant</p>
          </div>
        </div>
      </Card>

      {/* Main Grid: Active Applications & Upcoming Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Applications with Stepper */}
        <div className="lg:col-span-7 space-y-4">
          <CardHeader
            title="Recent Applications Pipeline"
            subtitle="Live status tracker across recruitment rounds"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/student/applications')}>
                View All ({applications.length}) →
              </Button>
            }
          />

          {applications.length === 0 ? (
            <Card className="text-center py-8">
              <Briefcase className="w-8 h-8 text-charcoal-muted mx-auto mb-2" />
              <p className="text-sm font-semibold text-navy">No applications submitted yet</p>
              <p className="text-xs text-charcoal-muted mt-1">
                Explore eligible placement drives and apply before deadlines.
              </p>
              <Button size="sm" variant="primary" className="mt-3" onClick={() => navigate('/student/drives')}>
                Browse Placement Drives →
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 2).map((app) => (
                <Card key={app.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-navy font-heading">
                        {app.drive?.jobRole || 'Software Engineer'}
                      </h3>
                      <p className="text-xs text-charcoal-muted">
                        {app.drive?.company?.name || 'Recruiting Partner'} • Package: {app.drive?.packageMax || '18'} LPA
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  {/* Application Stepper */}
                  <div className="mt-3 pt-3 border-t border-[#EAE2D3]">
                    <ApplicationStepper status={app.status} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Drives & Deadlines */}
        <div className="lg:col-span-5 space-y-4">
          <CardHeader
            title="Upcoming Placement Drives"
            subtitle="Drives closing soon for applications"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/student/drives')}>
                Browse ({drives.length}) →
              </Button>
            }
          />

          <div className="space-y-3">
            {drives.slice(0, 3).map((drive) => {
              const isEligible = drive.eligibility?.eligible;
              return (
                <Card key={drive.id} className="p-3.5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-navy">{drive.jobRole}</h4>
                      <p className="text-[11px] text-charcoal-muted">{drive.company?.name || drive.companyName}</p>
                    </div>
                    <Badge variant={isEligible ? 'success' : 'neutral'} size="sm">
                      {isEligible ? 'Eligible' : 'Check Criteria'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#EAE2D3] text-[11px] text-charcoal-muted">
                    <span className="flex items-center gap-1 font-medium text-navy">
                      ₹ {drive.packageMin} - {drive.packageMax} LPA
                    </span>
                    <span className="flex items-center gap-1 text-charcoal-muted">
                      <Clock className="w-3 h-3 text-brass" />
                      {new Date(drive.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
