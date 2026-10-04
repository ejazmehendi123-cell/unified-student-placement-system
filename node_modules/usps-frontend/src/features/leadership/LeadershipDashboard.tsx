import React, { useState, useEffect } from 'react';
import { reportApi } from '../../services/api';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Building2,
  FileDown,
  ShieldCheck,
  PieChart as PieIcon,
  Sparkles,
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

export const LeadershipDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [deptStats, setDeptStats] = useState<any[]>([]);
  const [companyStats, setCompanyStats] = useState<any[]>([]);
  const [packageTiers, setPackageTiers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, deptRes, compRes, pkgRes] = await Promise.all([
        reportApi.getSummary(),
        reportApi.getDepartments(),
        reportApi.getCompanies(),
        reportApi.getPackages(),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (deptRes.success) setDeptStats(deptRes.data || []);
      if (compRes.success) setCompanyStats(compRes.data || []);
      if (pkgRes.success) setPackageTiers(pkgRes.data || []);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    window.open('/api/reports/export', '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">University Leadership Executive Analytics</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Privacy-preserving aggregate metrics, department comparisons, and corporate hiring trajectory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            icon={<FileDown className="w-4 h-4" />}
          >
            Export Institutional Placement Report (CSV)
          </Button>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-3 bg-navy-50/70 border border-navy-100 rounded-sm flex items-center justify-between text-xs text-navy-dark">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brass" />
          <span>
            <strong>Privacy By Design:</strong> Executive views display aggregated statistical summaries without exposing individual student PII.
          </span>
        </div>
        <span className="font-semibold text-[11px] text-charcoal-muted uppercase">Academic Year 2025–26</span>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Placement Rate"
          value={summary?.placementRate ? `${summary.placementRate}%` : '0%'}
          subtitle={`${summary?.placedStudents || 0} Placed (${summary?.totalStudents || 0} Total)`}
          icon={<TrendingUp className="w-5 h-5 text-sage" />}
          trendType="positive"
        />
        <StatCard
          title="Average CTC Package"
          value={summary?.avgPackage ? `₹ ${summary.avgPackage} LPA` : '₹ 0.00'}
          subtitle={`Highest CTC: ₹ ${summary?.highestPackage || 0} LPA`}
          icon={<Award className="w-5 h-5 text-brass" />}
        />
        <StatCard
          title="Corporate Partner Drives"
          value={summary?.totalDrives || 0}
          subtitle={`${summary?.openDrives || 0} currently active`}
          icon={<Building2 className="w-5 h-5 text-navy" />}
        />
        <StatCard
          title="Total Offers Extended"
          value={summary?.totalOffers || 0}
          subtitle={`${summary?.acceptedOffers || 0} accepted offers`}
          icon={<Users className="w-5 h-5 text-sage" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Placement Comparison Chart */}
        <div className="lg:col-span-7">
          <Card className="p-5 h-full flex flex-col justify-between">
            <CardHeader
              title="Department Placement Success (%)"
              subtitle="Comparison across academic branches"
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

        {/* Salary Package Tier Distribution */}
        <div className="lg:col-span-5">
          <Card className="p-5 h-full flex flex-col justify-between">
            <CardHeader
              title="CTC Package Distribution"
              subtitle="Placed students by compensation band"
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

      {/* Department Breakdown Table */}
      <Card className="p-5">
        <CardHeader
          title="Discipline Placement Breakdown"
          subtitle="Cohort statistics and mean compensation per department"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-paper-dark border-b border-[#E5DFD5] text-charcoal-muted uppercase font-bold text-[10px]">
                <th className="p-3">Department / Discipline</th>
                <th className="p-3">Total Cohort</th>
                <th className="p-3">Placed Students</th>
                <th className="p-3">Placement Rate (%)</th>
                <th className="p-3">Average CTC (LPA)</th>
                <th className="p-3">Highest CTC (LPA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D3]">
              {deptStats.map((dept) => (
                <tr key={dept.branch} className="hover:bg-paper/60 transition-colors">
                  <td className="p-3 font-bold text-navy">{dept.branch}</td>
                  <td className="p-3">{dept.totalStudents}</td>
                  <td className="p-3 font-semibold text-sage-dark">{dept.placedStudents}</td>
                  <td className="p-3">
                    <span className="font-bold text-navy">{dept.placementRate}%</span>
                  </td>
                  <td className="p-3 font-semibold">₹ {dept.avgPackage} LPA</td>
                  <td className="p-3 font-bold text-navy">₹ {dept.maxPackage} LPA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
