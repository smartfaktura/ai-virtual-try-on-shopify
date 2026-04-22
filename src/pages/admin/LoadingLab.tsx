import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrandLoader } from '@/components/ui/brand-loader';
import { DotPulse } from '@/components/ui/dot-pulse';
import { ShimmerBar } from '@/components/ui/shimmer-bar';

export default function LoadingLab() {
  const { isRealAdmin, isLoading } = useIsAdmin();
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showBar, setShowBar] = useState(false);

  if (isLoading) {
    return (
      <div className="p-10">
        <DotPulse size="md" />
      </div>
    );
  }
  if (!isRealAdmin) return <Navigate to="/app" replace />;

  const triggerFullScreen = () => {
    setShowFullScreen(true);
    setTimeout(() => setShowFullScreen(false), 4000);
  };

  const triggerBar = () => {
    setShowBar(true);
    setTimeout(() => setShowBar(false), 3000);
  };

  return (
    <>
      <ShimmerBar visible={showBar} />

      {showFullScreen && (
        <div className="fixed inset-0 z-[200] bg-background animate-fade-in">
          <BrandLoader
            fullScreen
            hints={[
              'Preparing your studio',
              'Loading your library',
              'Almost ready',
            ]}
          />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <header className="space-y-2">
          <p className="section-label">Admin · Sandbox</p>
          <h1 className="text-3xl font-semibold tracking-tight">Loading Lab</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Preview the proposed branded loading primitives before rolling them across the app.
            Existing <code className="blog-inline-code">Loader2</code> usages stay untouched
            until you sign off.
          </p>
        </header>

        {/* Brand Loader */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">BrandLoader</h2>
              <p className="text-sm text-muted-foreground">
                Full-screen / route-level. Monogram with orbiting arc and breathing.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={triggerFullScreen}>
              Show full-screen (4s)
            </Button>
          </div>
          <Card className="h-[280px] flex items-center justify-center">
            <BrandLoader hints={['Preparing your studio', 'Loading your library', 'Almost ready']} />
          </Card>
        </section>

        {/* Dot Pulse */}
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">DotPulse</h2>
            <p className="text-sm text-muted-foreground">
              Inline / button / chip-level. Inherits <code className="blog-inline-code">currentColor</code>.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 space-y-4">
              <p className="section-label">Sizes</p>
              <div className="flex items-center gap-8 text-foreground">
                <div className="flex items-center gap-2">
                  <DotPulse size="sm" />
                  <span className="text-xs text-muted-foreground">sm</span>
                </div>
                <div className="flex items-center gap-2">
                  <DotPulse size="md" />
                  <span className="text-xs text-muted-foreground">md</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4 bg-sidebar text-sidebar-foreground border-sidebar-border">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60">
                Dark sidebar context
              </p>
              <div className="flex items-center gap-3">
                <DotPulse size="md" />
                <span className="text-sm">Loading…</span>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <p className="section-label">Inside a button</p>
              <Button disabled>
                <DotPulse size="sm" className="mr-2" />
                Working
              </Button>
            </Card>

            <Card className="p-6 space-y-4">
              <p className="section-label">Inside a chip</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted text-sm text-foreground">
                <DotPulse size="sm" />
                Loading brand profile
              </div>
            </Card>
          </div>
        </section>

        {/* Shimmer bar */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">ShimmerBar</h2>
              <p className="text-sm text-muted-foreground">
                Top-of-viewport progress for route transitions.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={triggerBar}>
              Trigger bar (3s)
            </Button>
          </div>
          <Card className="h-24 flex items-center justify-center text-sm text-muted-foreground">
            Look at the very top of the viewport.
          </Card>
        </section>

        {/* Comparison */}
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Before vs After</h2>
            <p className="text-sm text-muted-foreground">
              Today's default <code className="blog-inline-code">Loader2</code> next to the proposed dots.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-8 flex flex-col items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-foreground" />
              <p className="text-xs text-muted-foreground">Today — Loader2</p>
            </Card>
            <Card className="p-8 flex flex-col items-center gap-3">
              <div className="text-foreground">
                <DotPulse size="md" />
              </div>
              <p className="text-xs text-muted-foreground">Proposed — DotPulse</p>
            </Card>
          </div>
        </section>

        {/* Reduced motion */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Reduced motion</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            For users who enable <code className="blog-inline-code">prefers-reduced-motion</code>,
            the orbiting arc and dot wave stop animating. A soft opacity pulse remains so the loader
            still communicates "in progress" without vestibular motion. Toggle <em>Reduce motion</em>
            in your OS to verify.
          </p>
        </section>
      </div>
    </>
  );
}
