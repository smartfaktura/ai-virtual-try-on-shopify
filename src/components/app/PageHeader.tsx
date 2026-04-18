import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  backAction?: { content: string; onAction: () => void };
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageHeader({ title, subtitle, backAction, actions, children }: PageHeaderProps) {
  return (
    <div>
      <div className="mb-4 sm:mb-6">
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
          <p className="text-base text-muted-foreground mt-1.5">{subtitle}</p>
        )}
      </div>
      <div className="space-y-4 sm:space-y-6">{children}</div>
    </div>
  );
}
