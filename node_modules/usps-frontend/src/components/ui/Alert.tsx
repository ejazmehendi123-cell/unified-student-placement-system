import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className = '',
}) => {
  const styles = {
    info: {
      container: 'bg-navy-50 border-navy-100 text-navy-dark',
      icon: <Info className="w-5 h-5 text-navy shrink-0" />,
    },
    success: {
      container: 'bg-sage-50 border-[#C5D8CE] text-sage-dark',
      icon: <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />,
    },
    warning: {
      container: 'bg-brass-50 border-[#EBD6B6] text-[#785116]',
      icon: <AlertTriangle className="w-5 h-5 text-brass shrink-0" />,
    },
    error: {
      container: 'bg-clay-50 border-[#ECC6BE] text-clay-dark',
      icon: <AlertCircle className="w-5 h-5 text-clay shrink-0" />,
    },
  }[type];

  return (
    <div className={`p-4 rounded-sm border flex items-start gap-3 text-sm ${styles.container} ${className}`}>
      {styles.icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold text-sm mb-0.5">{title}</h4>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
