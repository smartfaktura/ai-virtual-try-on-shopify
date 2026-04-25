import { ModelsMarquee } from '@/components/landing/ModelShowcaseSection';

export function HomeModels() {
  return (
    <ModelsMarquee
      eyebrow={(count) => `Models · ${count}+ looks`}
      title="Every face. Every look. Every campaign."
      subtitle="Pick from 40+ ready-to-shoot AI models — or create your own brand model in minutes."
    />
  );
}
