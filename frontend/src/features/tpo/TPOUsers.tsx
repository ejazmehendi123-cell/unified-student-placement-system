import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { UserProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Users,
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react';

export const TPOUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getUsers();
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: UserProfile) => {
    try {
      await adminApi.updateUserStatus(user.id, !user.isActive);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update user status.');
    }
  };

  const filtered = users.filter((u) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (roleFilter && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">User & Security Governance</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage institutional user accounts, access roles, and account activation states
          </p>
        </div>

        <Badge variant="neutral" size="md">
          {users.length} Registered Accounts
        </Badge>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user name, email..."
              className="w-full pl-9 pr-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
            >
              <option value="">All User Roles</option>
              <option value="student">Student</option>
              <option value="recruiter">Recruiter</option>
              <option value="tpo_admin">TPO Administration</option>
              <option value="leadership">University Leadership</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden border border-[#E5DFD5]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-paper-dark border-b border-[#E5DFD5] text-charcoal-muted uppercase font-bold text-[10px]">
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">System Role</th>
                <th className="p-3.5">MFA Status</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D3]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-paper/60 transition-colors">
                  <td className="p-3.5 font-bold text-navy">{user.fullName}</td>
                  <td className="p-3.5 font-mono text-[11px] text-charcoal">{user.email}</td>
                  <td className="p-3.5">
                    <Badge variant="neutral" size="sm">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-3.5">
                    {user.mfaEnabled ? (
                      <span className="text-sage-dark font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> TOTP Enabled
                      </span>
                    ) : (
                      <span className="text-charcoal-muted">Standard Password</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <Badge variant={user.isActive ? 'success' : 'danger'} size="sm">
                      {user.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      size="sm"
                      variant={user.isActive ? 'danger' : 'primary'}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
