import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-navy text-white border-navy',
    accent: 'bg-brass-50 text-brass-dark border-[#D49F4E]',
    success: 'bg-sage-50 text-sage-dark border-[#5D9479]',
    danger: 'bg-clay-50 text-clay-dark border-[#CC6750]',
    warning: 'bg-amber-50 text-amber-900 border-amber-300',
    neutral: 'bg-paper-dark text-charcoal border-charcoal-border',
    outline: 'bg-transparent text-charcoal border-charcoal-border',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold tracking-wide uppercase',
  };

  return (
    <span
      className={`inline-flex items-center rounded-sm border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  switch (normalized) {
    case 'OPEN':
    case 'ACCEPTED':
    case 'PLACED':
    case 'VERIFIED':
      return <Badge variant="success" className={className}>{status.replace('_', ' ')}</Badge>;

    case 'SHORTLISTED':
    case 'INTERVIEW_SCHEDULED':
      return <Badge variant="accent" className={className}>{status.replace('_', ' ')}</Badge>;

    case 'PENDING_APPROVAL':
    case 'SUBMITTED':
    case 'PENDING':
      return <Badge variant="warning" className={className}>{status.replace('_', ' ')}</Badge>;

    case 'REJECTED':
    case 'DECLINED':
    case 'CANCELLED':
      return <Badge variant="danger" className={className}>{status.replace('_', ' ')}</Badge>;

    case 'CLOSED':
    case 'DRAFT':
    case 'WITHDRAWN':
    case 'UNPLACED':
    default:
      return <Badge variant="neutral" className={className}>{status.replace('_', ' ')}</Badge>;
  }
};
