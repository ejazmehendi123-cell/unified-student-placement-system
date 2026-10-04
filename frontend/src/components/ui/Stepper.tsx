import React from 'react';
import { Check } from 'lucide-react';
import { ApplicationStatus } from '../../types';

export const APPLICATION_STAGES = [
  { key: 'REGISTERED', label: 'Registered' },
  { key: 'ELIGIBLE', label: 'Eligible' },
  { key: 'APPLIED', label: 'Applied' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'OFFER', label: 'Offer' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'PLACED', label: 'Placed' },
];

export const getStageIndexFromStatus = (status: ApplicationStatus): number => {
  switch (status) {
    case 'SUBMITTED':
      return 2; // Applied
    case 'SHORTLISTED':
      return 3; // Shortlisted
    case 'INTERVIEW_SCHEDULED':
      return 4; // Interview
    case 'OFFERED':
      return 5; // Offer
    case 'ACCEPTED':
      return 6; // Accepted
    case 'PLACED':
      return 7; // Placed
    case 'REJECTED':
    case 'DECLINED':
    case 'WITHDRAWN':
      return 2;
    default:
      return 2;
  }
};

export const ApplicationStepper: React.FC<{ status: ApplicationStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const currentIndex = getStageIndexFromStatus(status);
  const isTerminated = status === 'REJECTED' || status === 'DECLINED' || status === 'WITHDRAWN';

  return (
    <div className={`w-full py-3 ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E5DFD5] -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-navy -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${(currentIndex / (APPLICATION_STAGES.length - 1)) * 100}%` }}
        />

        {APPLICATION_STAGES.map((stage, idx) => {
          const isPassed = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent && isTerminated
                    ? 'bg-clay text-white ring-2 ring-clay-light'
                    : isPassed
                    ? 'bg-navy text-white ring-2 ring-navy-light'
                    : 'bg-paper-dark text-charcoal-muted border border-charcoal-border'
                }`}
              >
                {isPassed && !isCurrent ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span
                className={`text-[10px] mt-1.5 font-medium whitespace-nowrap uppercase tracking-wider ${
                  isCurrent
                    ? isTerminated
                      ? 'text-clay font-bold'
                      : 'text-navy font-bold'
                    : isPassed
                    ? 'text-charcoal'
                    : 'text-charcoal-muted'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
      {isTerminated && (
        <div className="mt-2 text-center text-xs font-semibold text-clay uppercase tracking-wider">
          Current status: {status}
        </div>
      )}
    </div>
  );
};

export const WizardStepper: React.FC<{
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}> = ({ steps, currentStep, onStepClick, className = '' }) => {
  return (
    <div className={`flex items-center justify-between border-b border-[#E5DFD5] pb-3 mb-6 ${className}`}>
      {steps.map((label, idx) => {
        const isPassed = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <button
            key={label}
            type="button"
            disabled={!onStepClick || idx > currentStep}
            onClick={() => onStepClick && onStepClick(idx)}
            className={`flex items-center gap-2 group text-left ${
              onStepClick && idx <= currentStep ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold border transition-colors ${
                isCurrent
                  ? 'bg-navy text-white border-navy'
                  : isPassed
                  ? 'bg-sage text-white border-sage'
                  : 'bg-paper-dark text-charcoal-muted border-charcoal-border'
              }`}
            >
              {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase font-semibold text-charcoal-muted">Step {idx + 1}</p>
              <p className={`text-xs font-bold ${isCurrent ? 'text-navy' : isPassed ? 'text-charcoal' : 'text-charcoal-muted'}`}>
                {label}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
