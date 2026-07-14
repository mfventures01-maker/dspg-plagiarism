import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  id,
  children,
  className,
  title,
  subtitle,
  headerAction,
  footer,
  ...props
}) => {
  return (
    <div
      id={id}
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-slate-150 overflow-hidden transition-all duration-200',
        className
      )}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          {footer}
        </div>
      )}
    </div>
  );
};
