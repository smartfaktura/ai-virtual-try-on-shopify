import { useState, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  const [hoverOpen, setHoverOpen] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>();

  if (loading) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-4 sm:p-5 min-h-[120px] space-y-3">
        <div className="h-2.5 w-14 bg-muted rounded-full animate-pulse" />
        <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
        <div className="h-2 w-20 bg-muted rounded-full animate-pulse" />
      </div>
    );
  }

  const isBrandedTooltip = tooltip && typeof tooltip === 'object';

  const handleMouseEnter = () => {
    if (!tooltip) return;
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHoverOpen(true), 200);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHoverOpen(false), 250);
  };

  const cardContent = (
    <div className="flex flex-col gap-1">
      {/* Title */}
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 text-muted-foreground/60" />}
        <span className="text-[10px] sm:text-[11px] font-medium tracking-widest uppercase text-muted-foreground">{title}</span>
      </div>

      {/* Value or description */}
      {value !== undefined ? (
        <div className="mt-1">
          <p className="text-lg sm:text-xl font-semibold text-foreground tracking-tight leading-none whitespace-nowrap">{value}</p>
          {suffix && (
            <p className="text-[10px] text-muted-foreground/60 mt-1 leading-snug">{suffix}</p>
          )}
        </div>
      ) : description ? (
        <div className="mt-1">
          <p className="text-sm font-medium text-foreground leading-snug">{description}</p>
        </div>
      ) : null}

      {trend && (
        <p className={`text-[10px] font-medium ${trend.direction === 'up' ? 'text-primary' : 'text-destructive'}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
        </p>
      )}

      {typeof progress === 'number' && (
        <div className="mt-1.5">
          <div className="h-1 w-full rounded-full bg-muted/60 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor || 'bg-primary'}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {action && (
        <div className="mt-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-0 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-transparent p-0"
            onClick={(e) => { e.stopPropagation(); action.onClick(); }}
          >
            {action.label} →
          </Button>
        </div>
      )}
    </div>
  );

  const cardClass = `rounded-xl border border-border/40 bg-card p-4 sm:p-5 transition-all duration-200 hover:border-border/80 hover:shadow-sm ${
    onClick ? 'cursor-pointer' : ''
  }`;

  const cardEl = onClick ? (
    <div className={cardClass} onClick={onClick}>{cardContent}</div>
  ) : (
    <div className={cardClass}>{cardContent}</div>
  );

  if (!tooltip) return cardEl;

  return (
    <Popover open={hoverOpen} onOpenChange={setHoverOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {onClick ? (
            <div className={cardClass} onClick={onClick}>{cardContent}</div>
          ) : (
            <div className={cardClass}>{cardContent}</div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-auto max-w-[260px] p-3 rounded-lg shadow-lg border border-border/60 bg-popover"
        onMouseEnter={() => { clearTimeout(hoverTimeout.current); setHoverOpen(true); }}
        onMouseLeave={handleMouseLeave}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {isBrandedTooltip ? (
          <div className="flex items-start gap-2.5">
            <img
              src={(tooltip as BrandedTooltip).avatar}
              alt={(tooltip as BrandedTooltip).memberName}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-1 ring-border/30"
            />
            <div>
              <p className="text-[11px] font-semibold text-foreground/90">{(tooltip as BrandedTooltip).memberName}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{(tooltip as BrandedTooltip).text}</p>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground leading-relaxed">{typeof tooltip === 'string' ? tooltip : ''}</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
