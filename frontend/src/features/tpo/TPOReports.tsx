import React, { useState, useEffect } from 'react';
import { reportApi } from '../../services/api';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  FileText,
  FileDown,
  Building2,
  GraduationCap,
  Award,
  TrendingUp,
  PieChart as PieIcon,
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

export const TPOReports: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [deptStats, setDeptStats] = useState<any[]>([]);
  const [companyStats, setCompanyStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, deptRes, compRes] = await Promise.all([
        reportApi.getSummary(),
        reportApi.getDepartments(),
        reportApi.getCompanies(),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (deptRes.success) setDeptStats(deptRes.data || []);
      if (compRes.success) setCompanyStats(compRes.data || []);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Placement Reports & Institutional Analytics</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Aggregated university placement metrics, department achievements, and corporate hiring reports
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleExportCSV}
          icon={<FileDown className="w-4 h-4" />}
        >
          Export Official CSV Report
        </Button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Placement %"
          value={summary?.placementRate ? `${summary.placementRate}%` : '0%'}
          subtitle={`${summary?.placedStudents || 0} Placed`}
          icon={<TrendingUp className="w-5 h-5 text-sage" />}
        />
        <StatCard
          title="Average CTC Package"
          value={summary?.avgPackage ? `₹ ${summary.avgPackage} LPA` : '₹ 0.00'}
          subtitle="Mean compensation"
          icon={<Award className="w-5 h-5 text-brass" />}
        />
        <StatCard
          title="Highest CTC Package"
          value={summary?.highestPackage ? `₹ ${summary.highestPackage} LPA` : '₹ 0.00'}
          subtitle="Top corporate offer"
          icon={<Award className="w-5 h-5 text-navy" />}
        />
        <StatCard
          title="Total Offers Extended"
          value={summary?.totalOffers || 0}
          subtitle={`${summary?.acceptedOffers || 0} Accepted`}
          icon={<FileText className="w-5 h-5 text-sage" />}
        />
      </div>

      {/* Department Breakdown Table */}
      <Card className="p-5">
        <CardHeader
          title="Department-wise Placement Performance"
          subtitle="Cohort statistics across engineering branches"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-paper-dark border-b border-[#E5DFD5] text-charcoal-muted uppercase font-bold text-[10px]">
                <th className="p-3">Discipline / Branch</th>
                <th className="p-3">Total Cohort</th>
                <th className="p-3">Placed Students</th>
                <th className="p-3">Placement Rate (%)</th>
                <th className="p-3">Average CTC (LPA)</th>
                <th className="p-3">Max CTC (LPA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D3]">
              {deptStats.map((dept) => (
                <tr key={dept.branch} className="hover:bg-paper/60 transition-colors">
                  <td className="p-3 font-bold text-navy">{dept.branch}</td>
                  <td className="p-3">{dept.totalStudents}</td>
                  <td className="p-3 font-semibold text-sage-dark">{dept.placedStudents}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy">{dept.placementRate}%</span>
                      <div className="w-16 h-1.5 bg-paper-dark rounded-full overflow-hidden border border-[#E5DFD5]">
                        <div className="h-full bg-navy" style={{ width: `${dept.placementRate}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-semibold">₹ {dept.avgPackage} LPA</td>
                  <td className="p-3 font-bold text-navy">₹ {dept.maxPackage} LPA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Company Placement Table */}
      <Card className="p-5">
        <CardHeader
          title="Corporate Partner Recruitment Analytics"
          subtitle="Offers issued and accepted by recruiting organization"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-paper-dark border-b border-[#E5DFD5] text-charcoal-muted uppercase font-bold text-[10px]">
                <th className="p-3">Company Name</th>
                <th className="p-3">Industry Domain</th>
                <th className="p-3">Total Drives</th>
                <th className="p-3">Applicants</th>
                <th className="p-3">Offers Issued</th>
                <th className="p-3">Offers Accepted</th>
                <th className="p-3">Average CTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D3]">
              {companyStats.map((comp) => (
                <tr key={comp.companyId} className="hover:bg-paper/60 transition-colors">
                  <td className="p-3 font-bold text-navy">{comp.companyName}</td>
                  <td className="p-3 text-charcoal-muted">{comp.industry}</td>
                  <td className="p-3">{comp.totalDrives}</td>
                  <td className="p-3">{comp.totalApplicants}</td>
                  <td className="p-3 font-semibold text-navy">{comp.offersIssued}</td>
                  <td className="p-3 font-bold text-sage-dark">{comp.offersAccepted}</td>
                  <td className="p-3 font-semibold">₹ {comp.avgPackageOffered} LPA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
