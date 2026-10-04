import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { ShieldCheck, GraduationCap, Building2, UserCheck, BarChart3, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await login(email, password);
      // Retrieve the logged in user from localStorage
      const saved = localStorage.getItem('usps_user');
      const u = saved ? JSON.parse(saved) : null;
      if (u?.role) {
        navigate(`/${u.role}/dashboard`);
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Invalid credentials or connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (r: UserRole) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await switchDemoRole(r);
      navigate(`/${r}/dashboard`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top University Brand */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-2 border-b border-[#E5DFD5]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-navy rounded-sm flex items-center justify-center text-brass font-bold text-lg font-heading shadow-xs">
            U
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-navy font-heading leading-tight">
              Unified Student Placement System
            </h1>
            <p className="text-[11px] text-charcoal-muted uppercase tracking-wider">
              Official University Placement & Career Governance Portal
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-navy bg-paper-dark px-3 py-1.5 border border-[#E5DFD5] rounded-sm">
          <ShieldCheck className="w-4 h-4 text-brass" />
          <span>Institutional Single-Sign-On</span>
        </div>
      </div>

      {/* Main Auth Split Layout */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-start">
        {/* Left Column: 1-Click Demo Roles Showcase */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <span className="text-[10px] font-bold text-brass uppercase tracking-widest bg-brass-50 px-2.5 py-1 rounded-sm border border-brass/20">
              Instant Demonstration Access
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy font-heading mt-2">
              Select an Institutional Persona
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1 leading-relaxed">
              Explore the end-to-end recruitment lifecycle with full database authorization, real-time eligibility evaluation, and role-based views.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Student Card */}
            <Card
              onClick={() => handleQuickDemoLogin('student')}
              className="group hover:border-navy hover:bg-navy-50/20 transition-all p-4 border border-[#E5DFD5]"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 bg-navy-50 rounded-sm text-navy group-hover:bg-navy group-hover:text-paper transition-colors">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-muted group-hover:text-navy group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-sm text-navy font-heading mt-3">Student Portal</h3>
              <p className="text-xs text-charcoal-muted mt-0.5">{DEMO_CREDENTIALS.student.subtitle}</p>
              <div className="mt-3 pt-2 border-t border-[#EAE2D3] flex items-center justify-between text-[11px]">
                <span className="text-charcoal-muted">Role: Student</span>
                <span className="font-semibold text-navy">1-Click Login →</span>
              </div>
            </Card>

            {/* Recruiter Card */}
            <Card
              onClick={() => handleQuickDemoLogin('recruiter')}
              className="group hover:border-navy hover:bg-navy-50/20 transition-all p-4 border border-[#E5DFD5]"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 bg-brass-50 rounded-sm text-brass-dark group-hover:bg-brass group-hover:text-white transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-muted group-hover:text-navy group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-sm text-navy font-heading mt-3">Recruiter Partner</h3>
              <p className="text-xs text-charcoal-muted mt-0.5">{DEMO_CREDENTIALS.recruiter.subtitle}</p>
              <div className="mt-3 pt-2 border-t border-[#EAE2D3] flex items-center justify-between text-[11px]">
                <span className="text-charcoal-muted">Role: Recruiter</span>
                <span className="font-semibold text-navy">1-Click Login →</span>
              </div>
            </Card>

            {/* TPO / Admin Card */}
            <Card
              onClick={() => handleQuickDemoLogin('tpo_admin')}
              className="group hover:border-navy hover:bg-navy-50/20 transition-all p-4 border border-[#E5DFD5]"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 bg-sage-50 rounded-sm text-sage-dark group-hover:bg-sage group-hover:text-white transition-colors">
                  <UserCheck className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-muted group-hover:text-navy group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-sm text-navy font-heading mt-3">TPO / Admin Portal</h3>
              <p className="text-xs text-charcoal-muted mt-0.5">{DEMO_CREDENTIALS.tpo_admin.subtitle}</p>
              <div className="mt-3 pt-2 border-t border-[#EAE2D3] flex items-center justify-between text-[11px]">
                <span className="text-charcoal-muted">Role: TPO Admin</span>
                <span className="font-semibold text-navy">1-Click Login →</span>
              </div>
            </Card>

            {/* Leadership Card */}
            <Card
              onClick={() => handleQuickDemoLogin('leadership')}
              className="group hover:border-navy hover:bg-navy-50/20 transition-all p-4 border border-[#E5DFD5]"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 bg-paper-dark rounded-sm text-charcoal group-hover:bg-navy group-hover:text-paper transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-muted group-hover:text-navy group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-sm text-navy font-heading mt-3">Leadership / Dean</h3>
              <p className="text-xs text-charcoal-muted mt-0.5">{DEMO_CREDENTIALS.leadership.subtitle}</p>
              <div className="mt-3 pt-2 border-t border-[#EAE2D3] flex items-center justify-between text-[11px]">
                <span className="text-charcoal-muted">Role: Leadership</span>
                <span className="font-semibold text-navy">1-Click Login →</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Standard Email/Password Form */}
        <div className="lg:col-span-5">
          <Card className="p-6 bg-white border border-[#D8D3C8] shadow-card">
            <div className="pb-4 mb-4 border-b border-[#E5DFD5]">
              <h3 className="text-lg font-bold text-navy font-heading">Secure Account Sign In</h3>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Enter your university credentials or demo password
              </p>
            </div>

            {errorMsg && (
              <Alert type="error" className="mb-4 text-xs">
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Institutional Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@usps.demo"
                    className="w-full pl-9 pr-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm focus:outline-none focus:ring-2 focus:ring-navy focus:bg-white text-charcoal text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-charcoal">Password</label>
                  <span className="text-[10px] text-charcoal-muted">Demo: DemoPass@2026</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm focus:outline-none focus:ring-2 focus:ring-navy focus:bg-white text-charcoal text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                  Sign In to USPS Portal
                </Button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-[#EAE2D3] text-center">
              <p className="text-[11px] text-charcoal-muted">
                Protected by End-to-End Row Level Security (RLS) & Multi-Factor Authentication
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full pt-4 border-t border-[#E5DFD5] flex flex-col sm:flex-row items-center justify-between text-[11px] text-charcoal-muted gap-2">
        <p>© 2026 Unified Student Placement System (USPS) — Institutional Academic Edition</p>
        <div className="flex items-center gap-4">
          <span>Privacy Architecture</span>
          <span>Security Controls</span>
          <span>WCAG 2.2 AA Compliant</span>
        </div>
      </footer>
    </div>
  );
};
