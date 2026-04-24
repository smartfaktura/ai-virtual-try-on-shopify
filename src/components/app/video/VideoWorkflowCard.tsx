import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface VideoWorkflowCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  bestFor: string[];
  to: string;
  disabled?: boolean;
  comingSoon?: boolean;
  beta?: boolean;
}

export function VideoWorkflowCard({ icon: Icon, title, description, bestFor, to, disabled, comingSoon, beta }: VideoWorkflowCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => !disabled && navigate(to)}
      disabled={disabled}
      className={cn(
        'group relative flex flex-col items-start gap-4 rounded-xl border p-6 text-left transition-all',
        comingSoon
          ? 'opacity-75 cursor-default border-dashed border-border/60 bg-card/80'
          : disabled
            ? 'opacity-50 cursor-not-allowed border-border bg-card'
            : 'border-border bg-card hover:border-primary/30 hover:shadow-md cursor-pointer'
      )}
    >
      {comingSoon && (
        <Badge variant="outline" className="absolute top-4 right-4 text-[10px] font-medium text-muted-foreground border-border/60">Coming Soon</Badge>
      )}
      <div className={cn(
        "flex h-11 w-11 items-center justify-center rounded-lg",
        comingSoon ? "bg-muted/60 text-muted-foreground" : "bg-primary/10 text-primary"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
        {bestFor.map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
