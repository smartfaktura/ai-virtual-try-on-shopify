import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { UnifiedGenerator } from '@/pages/BrandModels';

export default function BrandModelNew() {
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Link
        to="/app/models"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Brand Models
      </Link>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Create New Model
        </h1>
        <p className="text-sm text-muted-foreground">
          Describe your ideal model · 20 credits per generation
        </p>
      </div>

      <Card className="p-6 border-border/60">
        <UnifiedGenerator
          onSuccess={() => navigate('/app/models')}
          isAdmin={isAdmin}
        />
      </Card>
    </div>
  );
}
