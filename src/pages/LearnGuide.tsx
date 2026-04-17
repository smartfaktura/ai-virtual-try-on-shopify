import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { GuideLayout } from '@/components/app/learn/GuideLayout';
import { getGuide, type LearnSection } from '@/data/learnContent';

export default function LearnGuide() {
  const { section, slug } = useParams<{ section?: string; slug?: string }>();
  const navigate = useNavigate();

  // Freestyle route uses a fixed slug
  const sectionId = (section ?? 'freestyle') as LearnSection;
  const slugId = slug ?? 'freestyle-basics';

  const guide = getGuide(sectionId, slugId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sectionId, slugId]);

  if (!guide) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Guide not found</h1>
        <p className="text-muted-foreground mb-6">This guide doesn’t exist or has moved.</p>
        <button
          onClick={() => navigate('/app/learn')}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to Learn
        </button>
      </div>
    );
  }

  return <GuideLayout guide={guide} />;
}
