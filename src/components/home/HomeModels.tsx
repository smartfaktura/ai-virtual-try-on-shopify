import { ModelsMarquee } from '@/components/landing/ModelShowcaseSection';

interface HomeModelsProps {
  className?: string;
}

export function HomeModels({ className }: HomeModelsProps) {
  return (
    <ModelsMarquee
      className={className}
      eyebrow={(count) => `Models · ${count}+ ready-to-shoot`}
      title="Pick a model. Start shooting."
      subtitle="40+ professional AI models across body types, ethnicities, and ages. Or train your own brand model in minutes and reuse it on every product, forever."
    />
  );
}
