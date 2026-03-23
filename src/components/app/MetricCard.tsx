import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BrandedTooltip {
  text: string;
  memberName: string;
  avatar: string;
}

interface MetricCardProps {
  title: string;
  value?: string | number;
  suffix?: string;
  icon?: LucideIcon;
  tooltip?: string | BrandedTooltip;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  loading?: boolean;
  onClick?: () => void;
  progress?: number;
  progressColor?: string;
  action?: { label: string; onClick: () => void };
  description?: string;
}

export function MetricCard({ title, value, suffix, icon: Icon, tooltip, trend, loading, onClick, progress, progressColor, action, description }: MetricCardProps) {
  const [flipped, setFlipped] = useState(false);

  if (loading) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-4 sm:p-5 h-[140px] space-y-3">
        <div className="h-2.5 w-14 bg-muted rounded-full animate-pulse" />
        <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
        <div className="h-2 w-20 bg-muted rounded-full animate-pulse" />
      </div>
    );
  }

  const isBrandedTooltip = tooltip && typeof tooltip === 'object';
  const hasTooltip = !!tooltip;

  const cardClass = `rounded-xl border border-border/40 bg-card p-4 sm:p-5 h-[140px] relative overflow-hidden transition-all duration-200 hover:border-border/80 hover:shadow-sm ${
    onClick ? 'cursor-pointer' : ''
  }`;

  const handleClick = () => {
    if (onClick) onClick();
  };

  // Mobile tap to flip
  const handleTap = () => {
    if (hasTooltip && window.matchMedia('(hover: none)').matches) {
      setFlipped(f => !f);
    }
  };

  const normalContent = (
    <div className="flex flex-col gap-1 h-full justify-between">
      <div>
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3 h-3 text-muted-foreground/60" />}
          <span className="text-[10px] sm:text-[11px] font-medium tracking-widest uppercase text-muted-foreground">{title}</span>
        </div>

        {value !== undefined ? (
          <div className="mt-1.5">
            <p className="text-lg sm:text-xl font-semibold text-foreground tracking-tight leading-none whitespace-nowrap">{value}</p>
            {suffix && (
              <p className="text-[10px] text-muted-foreground/60 mt-1 leading-snug">{suffix}</p>
            )}
          </div>
        ) : description ? (
          <div className="mt-1.5">
            <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">{description}</p>
          </div>
        ) : null}

        {trend && (
          <p className={`text-[10px] font-medium mt-1 ${trend.direction === 'up' ? 'text-primary' : 'text-destructive'}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </p>
        )}
      </div>

      <div>
        {typeof progress === 'number' && (
          <div className="mt-1">
            <div className="h-1 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor || 'bg-primary'}`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}

        {action && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-0 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-transparent p-0 mt-1"
            onClick={(e) => { e.stopPropagation(); action.onClick(); }}
          >
            {action.label} →
          </Button>
        )}
      </div>
    </div>
  );

  const tooltipContent = hasTooltip ? (
    <div className="flex items-start gap-3 h-full p-0.5">
      {isBrandedTooltip && (
        <img
          src={(tooltip as BrandedTooltip).avatar}
          alt={(tooltip as BrandedTooltip).memberName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-border/30 mt-0.5"
        />
      )}
      <div className="flex flex-col justify-center min-w-0">
        {isBrandedTooltip && (
          <p className="text-[11px] font-semibold text-foreground/90 mb-1">{(tooltip as BrandedTooltip).memberName}</p>
        )}
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {isBrandedTooltip ? (tooltip as BrandedTooltip).text : (tooltip as string)}
        </p>
      </div>
    </div>
  ) : null;

  return (
    <div
      className={cardClass}
      onClick={handleClick}
      onMouseEnter={() => hasTooltip && setFlipped(true)}
      onMouseLeave={() => hasTooltip && setFlipped(false)}
      onTouchEnd={handleTap}
    >
      {/* Normal content */}
      <div className={`absolute inset-0 p-4 sm:p-5 transition-all duration-300 ${
        flipped && hasTooltip ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}>
        {normalContent}
      </div>

      {/* Tooltip content */}
      {hasTooltip && (
        <div className={`absolute inset-0 p-4 sm:p-5 flex items-center transition-all duration-300 ${
          flipped ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}>
          {tooltipContent}
        </div>
      )}

      {/* Mobile info dot */}
      {hasTooltip && (
        <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-primary/30 sm:hidden" />
      )}
    </div>
  );
}
