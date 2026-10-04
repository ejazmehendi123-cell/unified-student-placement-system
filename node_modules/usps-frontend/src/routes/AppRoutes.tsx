import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { AppShell } from '../components/shell/AppShell';

// Auth
import { LoginPage } from '../features/auth/LoginPage';

// Student
import { StudentDashboard } from '../features/student/StudentDashboard';
import { StudentProfileWizard } from '../features/student/StudentProfileWizard';
import { StudentDrives } from '../features/student/StudentDrives';
import { StudentApplications } from '../features/student/StudentApplications';
import { StudentInterviews } from '../features/student/StudentInterviews';
import { StudentOffers } from '../features/student/StudentOffers';

// Recruiter
import { RecruiterDashboard } from '../features/recruiter/RecruiterDashboard';
import { RecruiterDrives } from '../features/recruiter/RecruiterDrives';
import { RecruiterDriveWizard } from '../features/recruiter/RecruiterDriveWizard';
import { RecruiterApplicants } from '../features/recruiter/RecruiterApplicants';
import { RecruiterInterviews } from '../features/recruiter/RecruiterInterviews';

// TPO Admin
import { TPODashboard } from '../features/tpo/TPODashboard';
import { TPODriveApprovals } from '../features/tpo/TPODriveApprovals';
import { TPOStudents } from '../features/tpo/TPOStudents';
import { TPOSISSync } from '../features/tpo/TPOSISSync';
import { TPOAuditLog } from '../features/tpo/TPOAuditLog';
import { TPOUsers } from '../features/tpo/TPOUsers';
import { TPOReports } from '../features/tpo/TPOReports';

// Leadership
import { LeadershipDashboard } from '../features/leadership/LeadershipDashboard';

const ProtectedLayout: React.FC<{ allowedRoles?: UserRole[] }> = ({ allowedRoles }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-navy font-semibold text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
          <span>Verifying Institutional Credentials...</span>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

export const AppRoutes: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <Routes>
      {/* Public Auth */}
      <Route
        path="/login"
        element={user && role ? <Navigate to={`/${role}/dashboard`} replace /> : <LoginPage />}
      />

      {/* Student Routes */}
      <Route element={<ProtectedLayout allowedRoles={['student']} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfileWizard />} />
        <Route path="/student/drives" element={<StudentDrives />} />
        <Route path="/student/applications" element={<StudentApplications />} />
        <Route path="/student/interviews" element={<StudentInterviews />} />
        <Route path="/student/offers" element={<StudentOffers />} />
      </Route>

      {/* Recruiter Routes */}
      <Route element={<ProtectedLayout allowedRoles={['recruiter', 'tpo_admin']} />}>
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/drives" element={<RecruiterDrives />} />
        <Route path="/recruiter/drives/new" element={<RecruiterDriveWizard />} />
        <Route path="/recruiter/applicants" element={<RecruiterApplicants />} />
        <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
      </Route>

      {/* TPO Admin Routes */}
      <Route element={<ProtectedLayout allowedRoles={['tpo_admin']} />}>
        <Route path="/admin/dashboard" element={<TPODashboard />} />
        <Route path="/admin/approvals" element={<TPODriveApprovals />} />
        <Route path="/admin/students" element={<TPOStudents />} />
        <Route path="/admin/reports" element={<TPOReports />} />
        <Route path="/admin/sis" element={<TPOSISSync />} />
        <Route path="/admin/audit-log" element={<TPOAuditLog />} />
        <Route path="/admin/users" element={<TPOUsers />} />
      </Route>

      {/* Leadership Routes */}
      <Route element={<ProtectedLayout allowedRoles={['leadership', 'tpo_admin']} />}>
        <Route path="/leadership/dashboard" element={<LeadershipDashboard />} />
        <Route path="/leadership/departments" element={<LeadershipDashboard />} />
        <Route path="/leadership/companies" element={<LeadershipDashboard />} />
        <Route path="/leadership/reports" element={<LeadershipDashboard />} />
      </Route>

      {/* Default fallback */}
      <Route
        path="*"
        element={
          user && role ? (
            <Navigate to={`/${role}/dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};
