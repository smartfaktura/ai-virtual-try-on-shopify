import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { UnifiedGenerator } from '@/pages/BrandModels';

export default function BrandModelNew() {
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto pt-2 pb-32">
      <header className="mb-6">
        <Link
          to="/app/models"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Brand Models
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-1.5">Create new model</h1>
            <p className="text-sm text-muted-foreground">Describe your ideal model</p>
          </div>
          <span className="shrink-0 mt-1 inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            20 credits per generation
          </span>
        </div>
      </header>

      <UnifiedGenerator
        layout="sections"
        onSuccess={() => navigate('/app/models')}
        isAdmin={isAdmin}
      />
    </div>
  );
}
