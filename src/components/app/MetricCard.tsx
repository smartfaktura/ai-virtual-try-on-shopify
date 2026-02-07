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
      <Card className="card-elevated border-0">
        <CardContent className="p-5 space-y-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const content = (
    <CardContent className="p-5 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div className="flex items-end gap-1">
        <p className="text-2xl font-semibold">{value}</p>
        {suffix && <span className="text-sm text-muted-foreground pb-0.5">{suffix}</span>}
      </div>
      {trend && (
        <p className={`text-xs ${trend.direction === 'up' ? 'text-primary' : 'text-destructive'}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
        </p>
      )}
    </CardContent>
  );

  if (onClick) {
    return (
      <Card className="card-elevated border-0 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
        {content}
      </Card>
    );
  }

  return <Card className="card-elevated border-0">{content}</Card>;
}