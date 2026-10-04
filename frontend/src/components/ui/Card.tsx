import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#E5DFD5] rounded-sm shadow-subtle p-5 ${
        onClick ? 'cursor-pointer hover:border-navy hover:shadow-card transition-all' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex items-start justify-between pb-3 mb-4 border-b border-[#EAE2D3] ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-navy font-heading">{title}</h3>
        {subtitle && <p className="text-xs text-charcoal-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
};

export const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  accentColor?: string;
  className?: string;
}> = ({ title, value, subtitle, icon, trend, trendType = 'neutral', className = '' }) => {
  return (
    <div className={`bg-white border border-[#E5DFD5] rounded-sm p-4 shadow-subtle flex items-center justify-between ${className}`}>
      <div>
        <p className="text-xs font-medium text-charcoal-muted uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-navy mt-1 font-heading">{value}</p>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={`text-xs font-semibold ${
                  trendType === 'positive'
                    ? 'text-sage-dark'
                    : trendType === 'negative'
                    ? 'text-clay-dark'
                    : 'text-charcoal-muted'
                }`}
              >
                {trend}
              </span>
            )}
            {subtitle && <span className="text-xs text-charcoal-muted">{subtitle}</span>}
          </div>
        )}
      </div>
      <div className="p-3 bg-paper-dark rounded-sm text-navy border border-[#E5DFD5]">
        {icon}
      </div>
    </div>
  );
};
