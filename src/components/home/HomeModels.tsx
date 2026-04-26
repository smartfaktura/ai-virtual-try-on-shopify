import { ModelsMarquee } from '@/components/landing/ModelShowcaseSection';

interface HomeModelsProps {
  className?: string;
}

export function HomeModels({ className }: HomeModelsProps) {
  return (
    <ModelsMarquee
      className={className}
      eyebrow={(count) => `${count}+ AI BRAND MODELS`}
      title="Choose a model or create your own."
      subtitle="Use ready AI models or build a reusable brand model for consistent on-model visuals across your products."
    />
  );
}
