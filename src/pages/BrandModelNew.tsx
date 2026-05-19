import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { UnifiedGenerator } from '@/pages/BrandModels';

export default function BrandModelNew() {
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto pb-32">
      <div className="mb-4 sm:mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/models')}
          className="gap-1.5 -ml-2 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Brand Models
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">New brand model</h1>
        <p className="text-base text-muted-foreground mt-1.5">
          Describe the person you want VOVV.AI to create
        </p>
      </div>

      <UnifiedGenerator
        layout="sections"
        onSuccess={() => navigate('/app/models')}
        isAdmin={isAdmin}
      />
    </div>
  );
}
