import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { PageHeader } from '@/components/app/PageHeader';
import { UnifiedGenerator } from '@/pages/BrandModels';

export default function BrandModelNew() {
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto pb-32">
      <PageHeader
        title="New brand model"
        subtitle="Describe the person you want VOVV.AI to create"
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
