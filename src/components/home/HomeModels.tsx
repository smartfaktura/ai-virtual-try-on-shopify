import { ModelsMarquee } from '@/components/landing/ModelShowcaseSection';

export function HomeModels() {
  return (
    <ModelsMarquee
      eyebrow={(count) => `Models · ${count}+ ready-to-shoot`}
      title="Your cast. Ready in seconds."
      subtitle="Pick from 40+ professional AI models across every body type, ethnicity, and age — or train your own brand model in minutes and shoot it forever."
    />
  );
}
