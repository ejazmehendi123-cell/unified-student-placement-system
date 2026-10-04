import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  Lock,
  ExternalLink,
} from 'lucide-react';

export const TPOStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [placementFilter, setPlacementFilter] = useState('ALL');

  // Override Modal
  const [overrideTarget, setOverrideTarget] = useState<any | null>(null);
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [isOverriding, setIsOverriding] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stuRes, drivesRes] = await Promise.all([
        adminApi.getStudents(),
        adminApi.getAllDrives(),
      ]);

      if (stuRes.success) setStudents(stuRes.data || []);
      if (drivesRes.success) {
        setDrives(drivesRes.data || []);
        if (drivesRes.data?.length > 0) setSelectedDriveId(drivesRes.data[0].id);
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

  const handleOverrideEligibility = async () => {
    if (!overrideTarget || !selectedDriveId || !overrideReason.trim()) {
      alert('Please fill out all override parameters and mandatory justification.');
      return;
    }

    setIsOverriding(true);
    try {
      await adminApi.overrideEligibility({
        studentId: overrideTarget.id,
        driveId: selectedDriveId,
        reason: overrideReason,
      });
      alert('Eligibility override registered and audited successfully.');
      setOverrideTarget(null);
      setOverrideReason('');
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Override failed.');
    } finally {
      setIsOverriding(false);
    }
  };

  const filtered = students.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        s.fullName?.toLowerCase().includes(q) ||
        s.rollNumber?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (branchFilter !== 'ALL' && s.branch !== branchFilter) return false;
    if (placementFilter === 'PLACED' && !s.isPlaced) return false;
    if (placementFilter === 'UNPLACED' && s.isPlaced) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Student Directory & Academic Governance</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Student academic standing, placement statuses, and administrative eligibility exception overrides
          </p>
        </div>

        <Badge variant="neutral" size="md">
          {students.length} Total Registered Students
        </Badge>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, roll number..."
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
              value={placementFilter}
              onChange={(e) => setPlacementFilter(e.target.value)}
              className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
            >
              <option value="ALL">All Placement Statuses</option>
              <option value="PLACED">Placed Students Only</option>
              <option value="UNPLACED">Unplaced Students</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card className="p-0 overflow-hidden border border-[#E5DFD5]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-paper-dark border-b border-[#E5DFD5] text-charcoal-muted uppercase font-bold text-[10px]">
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5">CGPA</th>
                <th className="p-3.5">Backlogs</th>
                <th className="p-3.5">Placement Status</th>
                <th className="p-3.5">Company / Package</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D3]">
              {filtered.map((stu) => (
                <tr key={stu.id} className="hover:bg-paper/60 transition-colors">
                  <td className="p-3.5 font-bold text-navy">{stu.rollNumber}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-charcoal">{stu.fullName || 'Student'}</p>
                    <p className="text-[11px] text-charcoal-muted">{stu.email}</p>
                  </td>
                  <td className="p-3.5 font-medium">{stu.branch}</td>
                  <td className="p-3.5 font-bold text-navy">{stu.cgpa.toFixed(2)}</td>
                  <td className="p-3.5 font-semibold">
                    <span className={stu.backlogCount === 0 ? 'text-sage-dark' : 'text-clay-dark'}>
                      {stu.backlogCount}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <Badge variant={stu.isPlaced ? 'success' : 'neutral'} size="sm">
                      {stu.isPlaced ? 'PLACED' : 'UNPLACED'}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-[11px]">
                    {stu.placement ? (
                      <div>
                        <p className="font-semibold text-navy">{stu.placement.company?.name || 'Recruiting Partner'}</p>
                        <p className="text-charcoal-muted">₹ {stu.placement.package} LPA</p>
                      </div>
                    ) : (
                      <span className="text-charcoal-muted">—</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setOverrideTarget(stu)}
                      icon={<ShieldAlert className="w-3.5 h-3.5 text-brass" />}
                    >
                      Override
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Eligibility Override Modal */}
      {overrideTarget && (
        <Modal
          isOpen={!!overrideTarget}
          onClose={() => setOverrideTarget(null)}
          title={`Administrative Eligibility Override`}
          subtitle={`Student: ${overrideTarget.fullName} (${overrideTarget.rollNumber})`}
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setOverrideTarget(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="accent" isLoading={isOverriding} onClick={handleOverrideEligibility}>
                Authorize Override & Log Audit
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <Alert type="warning" title="Administrative Audit Requirement">
              Every manual eligibility exception bypasses automated criteria checks and creates an immutable audit trail entry logged with your admin ID.
            </Alert>

            <div>
              <label className="block font-semibold text-charcoal mb-1">Target Placement Drive</label>
              <select
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
              >
                {drives.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.jobRole} ({d.companyName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">Mandatory Justification / TPO Approval Reason *</label>
              <textarea
                rows={3}
                required
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Special institutional dean approval granted based on prior semiconductor research and outstanding hackathon record..."
                className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
