import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mountain, Sparkles, Users, Layers, Lock } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export default function BrandScenes() {
  const navigate = useNavigate();
  const { isRealAdmin } = useIsAdmin();

  return (
    <div className="space-y-8 sm:space-y-10">
      <SEOHead title="Brand Scenes — VOVV.AI" description="Custom brand scenes — coming soon" noindex />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Brand Scenes</h1>
        <p className="text-base text-muted-foreground mt-1.5 max-w-xl">
          Coming soon — design your own signature scenes for your brand
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 max-w-3xl">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
          <Mountain className="w-6 h-6 text-primary" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Custom scenes are coming soon
        </h2>
        <p className="text-base text-muted-foreground mt-3 leading-relaxed">
          Brands will soon be able to design and save their own signature scenes — backgrounds, environments,
          and moods that match their visual identity. Generate any product inside scenes built exclusively for your brand.
        </p>

        <div className="mt-8 space-y-3">
          {[
            { icon: Sparkles, text: 'Design your own scenes from references or prompts' },
            { icon: Layers, text: 'Save and reuse across all your products' },
            { icon: Users, text: 'Share across your team' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.text} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed pt-1">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center gap-3">
          <Button
            onClick={() => navigate('/app/workflows')}
            className="rounded-full font-semibold gap-2"
          >
            Open Visual Studio
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-xs text-muted-foreground">
            In the meantime, explore 1600+ ready-made scenes
          </p>
        </div>

        {isRealAdmin && (
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/brand-scenes/new')}
              className="rounded-full gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              Open wizard (admin)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
