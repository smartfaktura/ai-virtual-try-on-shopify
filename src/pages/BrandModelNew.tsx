import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/app/PageHeader';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { UnifiedGenerator } from '@/pages/BrandModels';

export default function BrandModelNew() {
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Create New Model"
        subtitle="Describe your ideal model · 20 credits per generation"
        backAction={{ content: 'Brand Models', onAction: () => navigate('/app/models') }}
      >
        <UnifiedGenerator
          layout="sections"
          onSuccess={() => navigate('/app/models')}
          isAdmin={isAdmin}
        />
      </PageHeader>
    </div>
  );
}
