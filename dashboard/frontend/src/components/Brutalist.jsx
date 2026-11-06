import React from 'react';
import clsx from 'clsx';

export function BrutButton({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  onClick, 
  disabled = false,
  icon: Icon
}) {
  const base = "font-mono font-bold tracking-wider uppercase transition-all duration-150 inline-flex items-center justify-center gap-2 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

  const variants = {
    primary: "bg-brutal-accent text-black hover:bg-brutal-accent2 shadow-brutal hover:shadow-brutal-accent",
    secondary: "bg-brutal-surface text-brutal-text hover:bg-brutal-secondary border-brutal-border shadow-brutal",
    danger: "bg-brutal-danger text-white hover:bg-red-600 shadow-brutal hover:shadow-brutal-danger",
    outline: "bg-transparent text-brutal-accent border-brutal-accent hover:bg-brutal-accent hover:text-black shadow-brutal-accent"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(base, variants[variant], sizes[size], className)}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function BrutCard({ children, className = "", highlight = false, title, subtitle, badge }) {
  return (
    <div className={clsx(
      "bg-brutal-surface border-2 border-brutal-border shadow-brutal relative p-5 transition-all",
      highlight && "border-brutal-accent shadow-brutal-accent",
      className
    )}>
      {(title || badge) && (
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-brutal-border">
          <div>
            {title && <h3 className="font-display font-bold text-lg text-brutal-text tracking-wide uppercase">{title}</h3>}
            {subtitle && <p className="font-mono text-xs text-brutal-muted">{subtitle}</p>}
          </div>
          {badge && (
            <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 border border-black bg-brutal-accent text-black shadow-brutal-sm">
              {badge}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatBox({ label, value, sub, icon: Icon, accent = false }) {
  return (
    <div className={clsx(
      "bg-brutal-secondary border-2 border-brutal-border p-4 shadow-brutal flex items-center justify-between",
      accent && "border-brutal-accent shadow-brutal-accent"
    )}>
      <div>
        <p className="font-mono text-xs text-brutal-muted uppercase tracking-wider">{label}</p>
        <p className="font-mono font-black text-2xl lg:text-3xl text-brutal-text mt-1">{value}</p>
        {sub && <p className="font-mono text-[11px] text-brutal-accent mt-0.5">{sub}</p>}
      </div>
      {Icon && (
        <div className="w-12 h-12 bg-brutal-surface border-2 border-brutal-border flex items-center justify-center text-brutal-accent shadow-brutal-sm">
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}

