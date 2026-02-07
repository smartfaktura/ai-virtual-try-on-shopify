import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  loading?: boolean;
  onClick?: () => void;
}

export function MetricCard({ title, value, suffix, icon: Icon, trend, loading, onClick }: MetricCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-16 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const content = (
    <div className="p-5 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      <div className="flex items-end gap-1.5">
        <p className="text-3xl font-extrabold text-foreground tracking-tight">{value}</p>
        {suffix && <span className="text-xs text-muted-foreground pb-1">{suffix}</span>}
      </div>
      {trend && (
        <p className={`text-xs font-medium ${trend.direction === 'up' ? 'text-primary' : 'text-destructive'}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
        </p>
      )}
    </div>
  );

  const className = `rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 ${
    onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary/30' : ''
  }`;

  if (onClick) {
    return <div className={className} onClick={onClick}>{content}</div>;
  }

  return <div className={className}>{content}</div>;
}
