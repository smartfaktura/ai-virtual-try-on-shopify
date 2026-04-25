import { ModelsMarquee } from '@/components/landing/ModelShowcaseSection';

export function HomeModels() {
  return (
    <ModelsMarquee
      eyebrow={(count) => `Models · ${count}+ ready-to-shoot`}
      title="Pick a model. Start shooting."
      subtitle="40+ professional AI models across body types, ethnicities, and ages. Or train your own brand model in minutes and reuse it on every product, forever."
    />
  );
}
