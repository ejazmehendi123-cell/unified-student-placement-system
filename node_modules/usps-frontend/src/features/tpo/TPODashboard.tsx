import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, reportApi } from '../../services/api';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import {
  Users,
  Briefcase,
  Award,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  ScrollText,
  Building2,
  PieChart as PieIcon,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#1B2A4A', '#B8863B', '#4C7A63', '#B4543E', '#848C98'];

export const TPODashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [deptStats, setDeptStats] = useState<any[]>([]);
  const [packageTiers, setPackageTiers] = useState<any[]>([]);
  const [pendingDrives, setPendingDrives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, deptRes, pkgRes, drivesRes] = await Promise.all([
        reportApi.getSummary(),
        reportApi.getDepartments(),
        reportApi.getPackages(),
        adminApi.getAllDrives(),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (deptRes.success) setDeptStats(deptRes.data || []);
      if (pkgRes.success) setPackageTiers(pkgRes.data || []);
      if (drivesRes.success) {
        const pending = (drivesRes.data || []).filter((d: any) => d.status === 'PENDING_APPROVAL');
        setPendingDrives(pending);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Training & Placement Office (TPO)</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Institutional placement administration, drive authorizations, and compliance governance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/sis')}
            icon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Mock SIS Sync
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/approvals')}
            icon={<ShieldCheck className="w-4 h-4" />}
          >
            Drive Approvals ({pendingDrives.length})
          </Button>
        </div>
      </div>

      {/* Top University KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Placement Rate"
          value={summary?.placementRate ? `${summary.placementRate}%` : '0%'}
          subtitle={`${summary?.placedStudents || 0} of ${summary?.totalStudents || 0} students placed`}
          icon={<TrendingUp className="w-5 h-5 text-sage" />}
          trendType="positive"
        />
        <StatCard
          title="Average CTC Package"
          value={summary?.avgPackage ? `₹ ${summary.avgPackage} LPA` : '₹ 0.00 LPA'}
          subtitle={`Highest CTC: ₹ ${summary?.highestPackage || 0} LPA`}
          icon={<Award className="w-5 h-5 text-brass" />}
        />
        <StatCard
          title="Placement Drives"
          value={summary?.totalDrives || 0}
          subtitle={`${summary?.openDrives || 0} currently OPEN for applications`}
          icon={<Briefcase className="w-5 h-5 text-navy" />}
        />
        <StatCard
          title="Pending Approvals"
          value={pendingDrives.length}
          subtitle="Awaiting administrative signoff"
          icon={<ShieldCheck className="w-5 h-5 text-clay" />}
        />
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Placement Statistics Chart */}
        <div className="lg:col-span-7">
          <Card className="p-5 h-full flex flex-col justify-between">
            <CardHeader
              title="Department Placement Rates (%)"
              subtitle="Comparison across engineering disciplines"
            />
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptStats} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <XAxis dataKey="branch" tick={{ fontSize: 11, fill: '#5A606A' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#5A606A' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5DFD5',
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="placementRate" fill="#1B2A4A" name="Placement Rate (%)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Package Distribution Tiers */}
        <div className="lg:col-span-5">
          <Card className="p-5 h-full flex flex-col justify-between">
            <CardHeader
              title="Salary Package Distribution"
              subtitle="Placed student count by CTC compensation tier"
            />
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={packageTiers}
                    dataKey="count"
                    nameKey="tier"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {packageTiers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Approvals Quick Queue */}
      {pendingDrives.length > 0 && (
        <Card className="p-5 border-l-4 border-l-brass">
          <CardHeader
            title="Drives Awaiting TPO Authorization"
            subtitle="Review corporate terms and publish to students"
            action={
              <Button size="sm" variant="accent" onClick={() => navigate('/admin/approvals')}>
                Review All ({pendingDrives.length}) →
              </Button>
            }
          />
          <div className="space-y-3">
            {pendingDrives.slice(0, 2).map((d) => (
              <div key={d.id} className="p-3 bg-paper-dark border border-[#E5DFD5] rounded-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-navy">{d.jobRole}</h4>
                  <p className="text-[11px] text-charcoal-muted">{d.companyName} • ₹ {d.packageMin} - {d.packageMax} LPA</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/admin/approvals')}>
                  Review Criteria →
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
