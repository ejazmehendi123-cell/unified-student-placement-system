import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recruiterApi } from '../../services/api';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Award,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const RecruiterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [drivesRes, intRes] = await Promise.all([
        recruiterApi.getMyDrives(),
        recruiterApi.getInterviews(),
      ]);

      if (drivesRes.success) setDrives(drivesRes.data || []);
      if (intRes.success) setInterviews(intRes.data || []);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalApplicants = drives.reduce((acc, d) => acc + (d.applicantCount || 0), 0);
  const totalShortlisted = drives.reduce((acc, d) => acc + (d.shortlistedCount || 0), 0);
  const openDrives = drives.filter((d) => d.status === 'OPEN').length;
  const pendingApprovals = drives.filter((d) => d.status === 'PENDING_APPROVAL').length;

  // Chart data: Applicants per drive
  const driveStatsData = drives.map((d) => ({
    name: d.jobRole.length > 20 ? `${d.jobRole.substring(0, 18)}...` : d.jobRole,
    applicants: d.applicantCount || 0,
    shortlisted: d.shortlistedCount || 0,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Recruitment & Talent Portal</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage your corporate placement drives, candidate screening pipeline, and interview evaluations
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/recruiter/drives/new')}
          icon={<Plus className="w-4 h-4" />}
        >
          Post New Placement Drive
        </Button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Open Drives"
          value={openDrives}
          subtitle={`${pendingApprovals} drives pending TPO approval`}
          icon={<Briefcase className="w-5 h-5 text-navy" />}
        />
        <StatCard
          title="Total Candidates"
          value={totalApplicants}
          subtitle={`${totalShortlisted} candidates shortlisted`}
          icon={<Users className="w-5 h-5 text-brass" />}
        />
        <StatCard
          title="Interview Pipeline"
          value={interviews.length}
          subtitle="Scheduled technical & HR rounds"
          icon={<Calendar className="w-5 h-5 text-sage" />}
        />
        <StatCard
          title="Shortlisting Rate"
          value={totalApplicants > 0 ? `${((totalShortlisted / totalApplicants) * 100).toFixed(1)}%` : '0%'}
          subtitle="Conversion efficiency"
          icon={<TrendingUp className="w-5 h-5 text-brass" />}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drive Pipeline Funnel Chart */}
        <div className="lg:col-span-7">
          <Card className="p-5 h-full flex flex-col justify-between">
            <CardHeader
              title="Recruitment Pipeline by Drive"
              subtitle="Candidate applications vs. shortlisted selections"
            />

            <div className="h-64 w-full pt-2">
              {driveStatsData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-charcoal-muted">
                  No drive data to display. Create a placement drive to track applicants.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={driveStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5A606A' }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#5A606A' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5DFD5',
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="applicants" fill="#1B2A4A" name="Total Applicants" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="shortlisted" fill="#B8863B" name="Shortlisted" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Active Drives List */}
        <div className="lg:col-span-5">
          <Card className="p-5 h-full">
            <CardHeader
              title="Recent Placement Drives"
              subtitle="Latest corporate recruitment postings"
              action={
                <Button size="sm" variant="ghost" onClick={() => navigate('/recruiter/drives')}>
                  View All →
                </Button>
              }
            />

            <div className="space-y-3">
              {drives.slice(0, 3).map((drive) => (
                <div
                  key={drive.id}
                  onClick={() => navigate(`/recruiter/applicants?driveId=${drive.id}`)}
                  className="p-3.5 bg-paper-dark border border-[#E5DFD5] rounded-sm hover:border-navy cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-navy font-heading">{drive.jobRole}</h4>
                      <p className="text-[11px] text-charcoal-muted mt-0.5">
                        ₹ {drive.packageMin} - {drive.packageMax} LPA • Min CGPA: {drive.minCgpa.toFixed(2)}
                      </p>
                    </div>
                    <StatusBadge status={drive.status} />
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#EAE2D3] text-[11px]">
                    <span className="font-semibold text-navy">
                      {drive.applicantCount || 0} Applicants ({drive.shortlistedCount || 0} Shortlisted)
                    </span>
                    <span className="text-charcoal-muted">
                      Deadline: {new Date(drive.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
