import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backAction?: { content: string; onAction: () => void };
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageHeader({ title, subtitle, backAction, actions, children }: PageHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {backAction && (
              <Button variant="ghost" size="sm" onClick={backAction.onAction} className="gap-1.5 self-start">
                <ArrowLeft className="w-4 h-4" />
                {backAction.content}
              </Button>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
        {subtitle && (
          <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-lg">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
