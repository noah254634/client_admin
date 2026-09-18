import React from 'react';

export default function PageHeader({ badge, title, subtitle, actions }) {
  return (
    <div className="mb-8 pb-6 border-b border-[var(--border-color)] flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        {badge && (
          <span className="badge-glass mb-3 inline-block">{badge}</span>
        )}
        <h1 className="font-sans-title text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
