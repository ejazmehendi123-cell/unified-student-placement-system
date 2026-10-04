import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../hooks/useAuth';
import { notificationApi } from '../../services/api';
import { Notification, UserRole } from '../../types';
import {
  LayoutDashboard,
  UserCheck,
  Briefcase,
  FileText,
  Calendar,
  Award,
  Bell,
  LogOut,
  ShieldCheck,
  Users,
  Building2,
  FileSpreadsheet,
  ScrollText,
  PieChart,
  Layers,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getMyNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkRead = async (id: string) => {
    await notificationApi.markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead();
    fetchNotifications();
  };

  // Role Navigation Items
  const navItems: NavItem[] = React.useMemo(() => {
    if (role === 'student') {
      return [
        { label: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Profile & Resume', path: '/student/profile', icon: <UserCheck className="w-4 h-4" /> },
        { label: 'Placement Drives', path: '/student/drives', icon: <Briefcase className="w-4 h-4" /> },
        { label: 'My Applications', path: '/student/applications', icon: <FileText className="w-4 h-4" /> },
        { label: 'Interview Schedule', path: '/student/interviews', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Offers & Clearance', path: '/student/offers', icon: <Award className="w-4 h-4" /> },
      ];
    } else if (role === 'recruiter') {
      return [
        { label: 'Dashboard', path: '/recruiter/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Placement Drives', path: '/recruiter/drives', icon: <Briefcase className="w-4 h-4" /> },
        { label: 'Post New Drive', path: '/recruiter/drives/new', icon: <Layers className="w-4 h-4" /> },
        { label: 'Applicants', path: '/recruiter/applicants', icon: <Users className="w-4 h-4" /> },
        { label: 'Interviews', path: '/recruiter/interviews', icon: <Calendar className="w-4 h-4" /> },
      ];
    } else if (role === 'tpo_admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Drive Approvals', path: '/admin/approvals', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'Student Directory', path: '/admin/students', icon: <Users className="w-4 h-4" /> },
        { label: 'Placement Reports', path: '/admin/reports', icon: <PieChart className="w-4 h-4" /> },
        { label: 'Mock SIS Sync', path: '/admin/sis', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { label: 'Audit Logs', path: '/admin/audit-log', icon: <ScrollText className="w-4 h-4" /> },
        { label: 'User Directory', path: '/admin/users', icon: <Building2 className="w-4 h-4" /> },
      ];
    } else if (role === 'leadership') {
      return [
        { label: 'Executive Dashboard', path: '/leadership/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Department Analytics', path: '/leadership/departments', icon: <PieChart className="w-4 h-4" /> },
        { label: 'Company Reports', path: '/leadership/companies', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Placement Statistics', path: '/leadership/reports', icon: <FileText className="w-4 h-4" /> },
      ];
    }
    return [];
  }, [role]);

  const roleLabel = {
    student: 'Student',
    recruiter: 'Recruiter Partner',
    tpo_admin: 'TPO Administration',
    leadership: 'University Leadership',
  }[role || 'student'];

  return (
    <div className="min-h-screen flex flex-col bg-paper text-charcoal">
      {/* Top Header */}
      <header className="bg-navy text-white h-16 flex items-center justify-between px-4 sm:px-6 border-b border-navy-light sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 text-paper hover:bg-navy-light rounded-sm"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate(`/${role}/dashboard`)}>
            <div className="w-8 h-8 bg-brass rounded-sm flex items-center justify-center font-bold text-navy text-sm font-heading shadow-xs">
              U
            </div>
            <div>
              <span className="font-bold text-base tracking-tight font-heading text-paper">USPS</span>
              <span className="hidden sm:inline-block text-[11px] text-paper-muted ml-2 border-l border-navy-light pl-2">
                Unified Student Placement System
              </span>
            </div>
          </div>
        </div>

        {/* Right Header: Role badge, Fast Switcher, Notifications, User menu */}
        <div className="flex items-center gap-3">
          {/* Fast Role Switcher Dropdown (for testing & evaluation) */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="hidden lg:flex items-center gap-2 text-xs bg-navy-light hover:bg-[#2c4373] text-paper px-3 py-1.5 rounded-sm border border-navy-50/20 transition-all"
              title="Fast Role Switcher for Demonstration"
            >
              <span className="w-2 h-2 rounded-full bg-brass animate-pulse" />
              <span className="font-medium">Role: {roleLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-paper-muted" />
            </button>

            {roleSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E5DFD5] rounded-sm shadow-elevated p-2 z-50 text-charcoal animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 border-b border-[#E5DFD5] mb-1">
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted tracking-wider">
                    Demo Role Switcher
                  </p>
                </div>
                {(['student', 'recruiter', 'tpo_admin', 'leadership'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={async () => {
                      setRoleSwitcherOpen(false);
                      await switchDemoRole(r);
                      navigate(`/${r}/dashboard`);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-sm transition-colors flex flex-col ${
                      role === r ? 'bg-navy-50 text-navy font-bold' : 'hover:bg-paper-dark'
                    }`}
                  >
                    <span className="font-semibold">{DEMO_CREDENTIALS[r].title}</span>
                    <span className="text-[10px] text-charcoal-muted">{DEMO_CREDENTIALS[r].subtitle}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifsOpen(!notifsOpen)}
              className="p-2 text-paper-muted hover:text-paper hover:bg-navy-light rounded-sm relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-clay text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E5DFD5] rounded-sm shadow-elevated z-50 text-charcoal animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between p-3 border-b border-[#E5DFD5] bg-paper-dark">
                  <span className="text-xs font-bold text-navy font-heading uppercase tracking-wider">
                    Notifications ({unreadCount} unread)
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-brass-dark hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#EAE2D3]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-charcoal-muted">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkRead(n.id)}
                        className={`p-3 text-xs cursor-pointer hover:bg-paper-dark transition-colors ${
                          !n.isRead ? 'bg-navy-50/50 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-navy">{n.title}</span>
                          <span className="text-[10px] text-charcoal-muted">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-charcoal-muted mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-navy-light">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-paper leading-tight">{user?.fullName}</p>
              <p className="text-[10px] text-paper-muted uppercase tracking-wider">{roleLabel}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-paper-muted hover:text-clay-light hover:bg-navy-light rounded-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E5DFD5] shrink-0 p-4 justify-between">
          <div className="space-y-6">
            <div className="px-2">
              <span className="text-[10px] uppercase font-bold text-charcoal-muted tracking-widest">
                {roleLabel} Navigation
              </span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-sm transition-all ${
                      isActive
                        ? 'bg-navy text-paper shadow-xs'
                        : 'text-charcoal hover:bg-paper-dark hover:text-navy'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Sidebar Institutional Footer */}
          <div className="pt-4 border-t border-[#EAE2D3] text-[11px] text-charcoal-muted space-y-1 px-2">
            <p className="font-semibold text-navy">USPS Institutional Portal</p>
            <p className="text-[10px]">Academic Year 2025–2026</p>
            <div className="flex items-center gap-1 text-[10px] text-sage-dark font-medium pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block" />
              <span>System Operational</span>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-out Drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-navy-dark/50 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-64 bg-white border-r border-[#E5DFD5] p-4 flex flex-col justify-between z-10 shadow-elevated">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD5]">
                  <span className="font-bold text-sm text-navy font-heading">Menu</span>
                  <button onClick={() => setMobileOpen(false)} className="p-1 text-charcoal">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-sm ${
                          isActive ? 'bg-navy text-paper' : 'text-charcoal hover:bg-paper-dark'
                        }`
                      }
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Mobile Role Switcher buttons */}
              <div className="pt-4 border-t border-[#E5DFD5] space-y-2">
                <p className="text-[10px] font-bold text-charcoal-muted uppercase">Switch Role</p>
                <div className="grid grid-cols-2 gap-1">
                  {(['student', 'recruiter', 'tpo_admin', 'leadership'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={async () => {
                        setMobileOpen(false);
                        await switchDemoRole(r);
                        navigate(`/${r}/dashboard`);
                      }}
                      className="text-[10px] p-1.5 text-center bg-paper-dark hover:bg-navy-50 rounded-sm border border-[#E5DFD5] font-semibold"
                    >
                      {DEMO_CREDENTIALS[r].title.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
