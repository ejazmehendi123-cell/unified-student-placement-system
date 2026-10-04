import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recruiterApi } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WizardStepper } from '../../components/ui/Stepper';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import {
  Briefcase,
  GraduationCap,
  Coins,
  Calendar,
  CheckCircle2,
  Building2,
  FileCheck,
} from 'lucide-react';

const DRIVE_STEPS = [
  'Job Information',
  'Eligibility Rules',
  'Compensation & CTC',
  'Recruitment Timeline',
  'Review & Submit',
];

const AVAILABLE_BRANCHES = [
  { id: 'CSE', label: 'Computer Science & Engineering (CSE)' },
  { id: 'IT', label: 'Information Technology (IT)' },
  { id: 'ECE', label: 'Electronics & Communication (ECE)' },
  { id: 'Mechanical', label: 'Mechanical Engineering (MECH)' },
  { id: 'Civil', label: 'Civil & Structural Engineering' },
];

export const RecruiterDriveWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    companyName: 'Bharat Tech Innovations',
    jobRole: '',
    jobDescription: '',
    minCgpa: 7.5,
    maxBacklogs: 0,
    eligibleBranches: ['CSE', 'IT', 'ECE'],
    packageMin: 12.0,
    packageMax: 16.0,
    packageCurrency: 'INR (LPA)',
    applicationDeadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    driveDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
  });

  const handleBranchToggle = (branchId: string) => {
    if (formData.eligibleBranches.includes(branchId)) {
      if (formData.eligibleBranches.length === 1) {
        alert('At least one branch must remain selected.');
        return;
      }
      setFormData({
        ...formData,
        eligibleBranches: formData.eligibleBranches.filter((b) => b !== branchId),
      });
    } else {
      setFormData({
        ...formData,
        eligibleBranches: [...formData.eligibleBranches, branchId],
      });
    }
  };

  const handleSave = async (isDraft = false) => {
    if (!formData.jobRole || !formData.jobDescription) {
      setErrorMessage('Please fill out all required job role and description fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        ...formData,
        minCgpa: Number(formData.minCgpa),
        maxBacklogs: Number(formData.maxBacklogs),
        packageMin: Number(formData.packageMin),
        packageMax: Number(formData.packageMax),
        isDraft,
      };

      const res = await recruiterApi.createDrive(payload);
      if (res.success) {
        navigate('/recruiter/drives');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to create placement drive.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.min(DRIVE_STEPS.length - 1, prev + 1));
  };

  const prevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD5]">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Post New Placement Drive</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Configure recruitment parameters, academic eligibility thresholds, and compensation details
          </p>
        </div>
        <Badge variant="primary" size="md">
          Step {currentStep + 1} / {DRIVE_STEPS.length}
        </Badge>
      </div>

      {errorMessage && (
        <Alert type="error" className="text-xs">
          {errorMessage}
        </Alert>
      )}

      {/* Main Wizard Card */}
      <Card className="p-6">
        <WizardStepper
          steps={DRIVE_STEPS}
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
        />

        {/* STEP 1: Job Information */}
        {currentStep === 0 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-navy font-heading border-b border-[#EAE2D3] pb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brass" /> Job Role & Corporate Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Company / Hiring Entity</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs focus:ring-1 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Job Designation / Role Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Associate Software Development Engineer (SDE-1)"
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                  className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs focus:ring-1 focus:ring-navy"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-charcoal mb-1">Detailed Job Description & Responsibilities *</label>
                <textarea
                  rows={6}
                  placeholder="Outline key technical responsibilities, tech stack, team structure, and qualifications..."
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs focus:ring-1 focus:ring-navy"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Eligibility Rules */}
        {currentStep === 1 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-navy font-heading border-b border-[#EAE2D3] pb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brass" /> Deterministic Academic Screening Criteria
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-paper-dark rounded-sm border border-[#E5DFD5]">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Minimum Cumulative CGPA (0.00 - 10.00)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.minCgpa}
                  onChange={(e) => setFormData({ ...formData, minCgpa: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-[#D8D3C8] rounded-sm text-xs"
                />
                <p className="text-[10px] text-charcoal-muted mt-1">Students with lower CGPA will be marked ineligible automatically.</p>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Maximum Active Backlogs Permitted</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={formData.maxBacklogs}
                  onChange={(e) => setFormData({ ...formData, maxBacklogs: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-[#D8D3C8] rounded-sm text-xs"
                />
                <p className="text-[10px] text-charcoal-muted mt-1">Set to 0 for strict zero-backlog recruitment criteria.</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block font-semibold text-charcoal mb-2">Eligible Engineering Disciplines / Branches *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_BRANCHES.map((b) => {
                  const isChecked = formData.eligibleBranches.includes(b.id);
                  return (
                    <label
                      key={b.id}
                      className={`p-3 rounded-sm border cursor-pointer flex items-center gap-2.5 transition-colors ${
                        isChecked ? 'bg-navy-50 border-navy text-navy font-semibold' : 'bg-paper-dark border-[#E5DFD5]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleBranchToggle(b.id)}
                        className="rounded-xs text-navy focus:ring-navy"
                      />
                      <span>{b.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Compensation & CTC */}
        {currentStep === 2 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-navy font-heading border-b border-[#EAE2D3] pb-2 flex items-center gap-2">
              <Coins className="w-4 h-4 text-brass" /> Compensation Structure & CTC
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Minimum Package (LPA) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={formData.packageMin}
                  onChange={(e) => setFormData({ ...formData, packageMin: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Maximum Package (LPA) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={formData.packageMax}
                  onChange={(e) => setFormData({ ...formData, packageMax: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Currency & Unit</label>
                <input
                  type="text"
                  value={formData.packageCurrency}
                  onChange={(e) => setFormData({ ...formData, packageCurrency: e.target.value })}
                  className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-paper-dark rounded-sm border border-[#E5DFD5]">
              <span className="font-bold text-navy">Annual Package Preview: </span>
              <span className="font-semibold text-charcoal">
                ₹ {formData.packageMin.toFixed(2)} - {formData.packageMax.toFixed(2)} {formData.packageCurrency}
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: Timeline & Dates */}
        {currentStep === 3 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-navy font-heading border-b border-[#EAE2D3] pb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brass" /> Application Deadlines & Drive Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Student Application Deadline *</label>
                <input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                />
                <p className="text-[10px] text-charcoal-muted mt-1">Applications will close automatically after this date.</p>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Anticipated Drive / Interview Date</label>
                <input
                  type="date"
                  value={formData.driveDate}
                  onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                  className="w-full px-3 py-2 bg-paper border border-[#D8D3C8] rounded-sm text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Final Review */}
        {currentStep === 4 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-navy font-heading border-b border-[#EAE2D3] pb-2 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sage" /> Review Drive Specification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-paper-dark border border-[#E5DFD5] rounded-sm">
              <div>
                <p className="text-[10px] uppercase font-bold text-charcoal-muted">Job Role</p>
                <p className="text-sm font-bold text-navy">{formData.jobRole || 'Untitled Role'}</p>
                <p className="text-[11px] text-charcoal-muted mt-1">Company: {formData.companyName}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-charcoal-muted">CTC Package</p>
                <p className="text-sm font-bold text-navy">
                  ₹ {formData.packageMin} - {formData.packageMax} {formData.packageCurrency}
                </p>
                <p className="text-[11px] text-charcoal-muted mt-1">Deadline: {formData.applicationDeadline}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-charcoal-muted">Academic Criteria</p>
                <p className="font-semibold text-charcoal">Min CGPA: {formData.minCgpa} | Max Backlogs: {formData.maxBacklogs}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-charcoal-muted">Eligible Disciplines</p>
                <p className="font-semibold text-charcoal">{formData.eligibleBranches.join(', ')}</p>
              </div>
            </div>

            <Alert type="info">
              Submitting for approval will place this drive in the TPO verification queue. Once authorized, it will immediately open for student applications.
            </Alert>
          </div>
        )}

        {/* Wizard Footer Actions */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#EAE2D3]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            ← Previous
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isSubmitting}
              onClick={() => handleSave(true)}
            >
              Save as Draft
            </Button>

            {currentStep < DRIVE_STEPS.length - 1 ? (
              <Button type="button" variant="primary" size="sm" onClick={nextStep}>
                Next Step →
              </Button>
            ) : (
              <Button
                type="button"
                variant="accent"
                size="sm"
                isLoading={isSubmitting}
                onClick={() => handleSave(false)}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Submit for TPO Approval
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
