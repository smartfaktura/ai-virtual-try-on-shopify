import { useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/contexts/AuthContext';
import {
  SEO_PAGES,
  SEO_PAGE_GROUPS,
  getSlotFallbackUrl,
  type SeoPageEntry,
  type SeoVisualSlot,
} from '@/data/seoPageVisualSlots';
import {
  useSeoVisualOverridesMap,
  getOverrideKey,
  type SeoVisualOverride,
} from '@/hooks/useSeoVisualOverrides';
import { useAdminSeoVisuals } from '@/hooks/useAdminSeoVisuals';
import type { PublicScene } from '@/hooks/usePublicSceneLibrary';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, Image as ImageIcon, RotateCcw, Pencil, Save, Undo2 } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScenePickerModal } from '@/components/admin/seo-visuals/ScenePickerModal';
import { SITE_URL } from '@/lib/constants';

interface DraftMap {
  // key = `${page_route}::${slot_key}`
  [key: string]: {
    scene_id: string;
    preview_image_url: string;
    alt_text: string | null;
  } | null; // null = clear / remove
}

export default function SeoPageVisuals() {
  const { isRealAdmin, isLoading: adminLoading } = useIsAdmin();
  const { user } = useAuth();
  const overridesMap = useSeoVisualOverridesMap();
  const { upsertMany, removeOne } = useAdminSeoVisuals();

  const [selectedRoute, setSelectedRoute] = useState<string>(SEO_PAGES[0].route);
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [pickerSlotKey, setPickerSlotKey] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [pendingRouteSwitch, setPendingRouteSwitch] = useState<string | null>(null);

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (!isRealAdmin) return <Navigate to="/app" replace />;

  const selectedPage = SEO_PAGES.find((p) => p.route === selectedRoute)!;
  // (selectedSlotKey is still tracked for the picker selection state)


  // Per-page draft helpers
  const getEffective = (slot: SeoVisualSlot): {
    sceneId: string | null;
    url: string;
    alt: string;
    isOverride: boolean;
    isDraft: boolean;
  } => {
    const dKey = getOverrideKey(selectedPage.route, slot.key);
    if (dKey in drafts) {
      const d = drafts[dKey];
      if (d === null) {
        return {
          sceneId: null,
          url: getSlotFallbackUrl(slot),
          alt: slot.fallbackAlt,
          isOverride: false,
          isDraft: true,
        };
      }
      return {
        sceneId: d.scene_id,
        url: d.preview_image_url,
        alt: d.alt_text || slot.fallbackAlt,
        isOverride: true,
        isDraft: true,
      };
    }
    const o = overridesMap.get(dKey);
    if (o) {
      return {
        sceneId: o.scene_id,
        url: o.preview_image_url,
        alt: o.alt_text || slot.fallbackAlt,
        isOverride: true,
        isDraft: false,
      };
    }
    return {
      sceneId: null,
      url: getSlotFallbackUrl(slot),
      alt: slot.fallbackAlt,
      isOverride: false,
      isDraft: false,
    };
  };

  // Stats per page (counts overrides + drafts)
  const pageStats = (page: SeoPageEntry) => {
    let configured = 0;
    let unsaved = 0;
    for (const slot of page.slots) {
      const dKey = getOverrideKey(page.route, slot.key);
      if (dKey in drafts) {
        unsaved++;
        if (drafts[dKey] !== null) configured++;
      } else if (overridesMap.has(dKey)) {
        configured++;
      }
    }
    return { configured, total: page.slots.length, unsaved };
  };

  const dirtyDraftsForPage = useMemo(() => {
    const out: { key: string; route: string; slotKey: string; value: DraftMap[string] }[] = [];
    for (const k of Object.keys(drafts)) {
      const [route, slotKey] = k.split('::');
      if (route === selectedPage.route) {
        out.push({ key: k, route, slotKey, value: drafts[k] });
      }
    }
    return out;
  }, [drafts, selectedPage.route]);

  const hasUnsaved = dirtyDraftsForPage.length > 0;

  // ── Actions ──
  const handlePickerSelect = (scene: PublicScene) => {
    if (!pickerSlotKey || !scene.preview_image_url) return;
    const slot = selectedPage.slots.find((s) => s.key === pickerSlotKey);
    if (!slot) return;
    const dKey = getOverrideKey(selectedPage.route, pickerSlotKey);
    setDrafts((prev) => ({
      ...prev,
      [dKey]: {
        scene_id: scene.scene_id,
        preview_image_url: scene.preview_image_url!,
        alt_text: slot.fallbackAlt,
      },
    }));
  };

  const handleClearSlot = (slot: SeoVisualSlot) => {
    const dKey = getOverrideKey(selectedPage.route, slot.key);
    const exists = overridesMap.has(dKey);
    if (!exists) {
      // No saved override → just drop any draft
      setDrafts((prev) => {
        const { [dKey]: _, ...rest } = prev;
        return rest;
      });
      return;
    }
    setDrafts((prev) => ({ ...prev, [dKey]: null }));
  };

  const handleResetSlot = (slot: SeoVisualSlot) => {
    const dKey = getOverrideKey(selectedPage.route, slot.key);
    setDrafts((prev) => {
      const { [dKey]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSave = async () => {
    if (!user || !hasUnsaved) return;
    const upserts = dirtyDraftsForPage
      .filter((d) => d.value !== null)
      .map((d) => ({
        page_route: d.route,
        slot_key: d.slotKey,
        scene_id: d.value!.scene_id,
        preview_image_url: d.value!.preview_image_url,
        alt_text: d.value!.alt_text,
        updated_by: user.id,
      }));
    const removals = dirtyDraftsForPage.filter((d) => d.value === null);

    try {
      if (upserts.length > 0) await upsertMany.mutateAsync(upserts);
      for (const r of removals) {
        await removeOne.mutateAsync({ page_route: r.route, slot_key: r.slotKey });
      }
      // Drop only this page's drafts
      setDrafts((prev) => {
        const next: DraftMap = {};
        for (const k of Object.keys(prev)) {
          if (!k.startsWith(`${selectedPage.route}::`)) next[k] = prev[k];
        }
        return next;
      });
      toast.success('Visuals updated successfully');
    } catch (err: any) {
      toast.error(`Could not save visuals: ${err.message ?? 'unknown error'}`);
    }
  };

  const handleDiscard = () => {
    setDrafts((prev) => {
      const next: DraftMap = {};
      for (const k of Object.keys(prev)) {
        if (!k.startsWith(`${selectedPage.route}::`)) next[k] = prev[k];
      }
      return next;
    });
    setConfirmDiscard(false);
    toast.info('Changes discarded');
  };

  const handleRouteSwitch = (route: string) => {
    if (hasUnsaved) {
      setPendingRouteSwitch(route);
      return;
    }
    setSelectedRoute(route);
    setSelectedSlotKey(null);
  };

  // ── Render ──
  const groupedPages = SEO_PAGE_GROUPS.map((g) => ({
    ...g,
    pages: SEO_PAGES.filter((p) => p.group === g.id),
  }));

  // Group slots by section for the selected page
  const sections = useMemo(() => {
    const map = new Map<string, SeoVisualSlot[]>();
    for (const s of selectedPage.slots) {
      if (!map.has(s.section)) map.set(s.section, []);
      map.get(s.section)!.push(s);
    }
    return Array.from(map.entries()).map(([name, slots]) => ({ name, slots }));
  }, [selectedPage]);

  const pickerSlot = pickerSlotKey
    ? selectedPage.slots.find((s) => s.key === pickerSlotKey) ?? null
    : null;

  return (
    <div className="pb-32">
      <PageHeader
        title="SEO page visuals"
        subtitle="Manage images shown on public SEO landing pages. Choose a page, pick a slot, replace its image from the Product Visuals library."
      >
        <></>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 mt-4">
        {/* LEFT — page selector */}
        <aside className="lg:sticky lg:top-4 self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto -mx-1 px-1">
          <div className="space-y-5">
            {groupedPages.map((g) => (
              <div key={g.id}>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2 px-1">
                  {g.label}
                </p>
                <div className="space-y-1">
                  {g.pages.map((p) => {
                    const stats = pageStats(p);
                    const active = p.route === selectedRoute;
                    return (
                      <button
                        key={p.route}
                        onClick={() => handleRouteSwitch(p.route)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg border transition-colors',
                          active
                            ? 'border-foreground/20 bg-secondary'
                            : 'border-transparent hover:bg-secondary/60',
                        )}
                      >
                        <div className="text-sm font-medium leading-tight">{p.label}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{p.route}</div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] text-muted-foreground">
                            {stats.configured}/{stats.total}
                          </span>
                          {stats.unsaved > 0 && (
                            <Badge variant="secondary" className="text-[9px] py-0 h-4">
                              {stats.unsaved} unsaved
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN — slots */}
        <main className="min-w-0">
          {/* Page summary card */}
          <div className="border rounded-xl bg-card p-4 mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-tight truncate">{selectedPage.label}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{selectedPage.route}</p>
              {(() => {
                const s = pageStats(selectedPage);
                return (
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span><span className="font-medium text-foreground">{s.configured}</span>/{s.total} configured</span>
                    <span><span className="font-medium text-foreground">{s.total - s.configured}</span> using fallback</span>
                    {s.unsaved > 0 && <span className="text-amber-600 font-medium">{s.unsaved} unsaved</span>}
                  </div>
                );
              })()}
            </div>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`${SITE_URL}${selectedPage.route}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open live page
              </a>
            </Button>
          </div>

          {sections.map((sec) => (
            <section key={sec.name} className="mb-8">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.18em] mb-3">
                {sec.name}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {sec.slots.map((slot) => {
                  const eff = getEffective(slot);
                  return (
                    <div
                      key={slot.key}
                      className="border border-border rounded-xl bg-card overflow-hidden flex flex-col hover:border-foreground/20 transition-colors"
                    >
                      <div className="aspect-[4/5] w-full bg-muted relative">
                        {eff.url ? (
                          <img
                            src={getOptimizedUrl(eff.url, { quality: 55 })}
                            alt={eff.alt}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                        <div className="absolute top-1.5 left-1.5 flex gap-1">
                          {eff.isDraft && (
                            <Badge className="text-[9px] py-0 h-4 bg-amber-500 text-white border-0">
                              Unsaved
                            </Badge>
                          )}
                          {!eff.isDraft && eff.isOverride && (
                            <Badge className="text-[9px] py-0 h-4">Set</Badge>
                          )}
                          {!eff.isOverride && !eff.isDraft && (
                            <Badge variant="secondary" className="text-[9px] py-0 h-4">
                              Fallback
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-2.5 flex flex-col flex-1">
                        <div className="text-[12px] font-medium leading-tight line-clamp-2">
                          {slot.label}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-snug line-clamp-2">
                          {slot.whereItAppears}
                        </p>
                        <div className="flex items-center gap-1 mt-auto pt-2 border-t border-border/50">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-[11px] flex-1 justify-start"
                            onClick={() => {
                              setSelectedSlotKey(slot.key);
                              setPickerSlotKey(slot.key);
                            }}
                          >
                            <Pencil className="h-3 w-3 mr-1" /> Change
                          </Button>
                          {eff.isDraft && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              title="Reset draft"
                              onClick={() => handleResetSlot(slot)}
                            >
                              <Undo2 className="h-3 w-3" />
                            </Button>
                          )}
                          {!eff.isDraft && eff.isOverride && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground"
                              title="Use fallback"
                              onClick={() => handleClearSlot(slot)}
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </main>
      </div>

      {/* Sticky save bar */}
      {hasUnsaved && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-foreground text-background rounded-full pl-5 pr-2 py-2 shadow-xl">
          <span className="text-sm">
            {dirtyDraftsForPage.length} unsaved change{dirtyDraftsForPage.length === 1 ? '' : 's'} on this page
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="text-background hover:text-background hover:bg-background/10 h-8 rounded-full"
            onClick={() => setConfirmDiscard(true)}
            disabled={upsertMany.isPending || removeOne.isPending}
          >
            Discard
          </Button>
          <Button
            size="sm"
            className="bg-background text-foreground hover:bg-background/90 h-8 rounded-full"
            onClick={handleSave}
            disabled={upsertMany.isPending || removeOne.isPending}
          >
            {upsertMany.isPending || removeOne.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5" />
            )}
            Save changes
          </Button>
        </div>
      )}

      {/* Picker modal */}
      {pickerSlot && (
        <ScenePickerModal
          open={pickerSlotKey !== null}
          onOpenChange={(o) => !o && setPickerSlotKey(null)}
          pageLabel={selectedPage.label}
          slot={pickerSlot}
          currentSceneId={getEffective(pickerSlot).sceneId}
          onSelect={handlePickerSelect}
        />
      )}

      {/* Discard confirm */}
      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved visual changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revert all unsaved changes on this page. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Switch-with-unsaved confirm */}
      <AlertDialog
        open={pendingRouteSwitch !== null}
        onOpenChange={(o) => !o && setPendingRouteSwitch(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved visual changes</AlertDialogTitle>
            <AlertDialogDescription>
              Switching pages will discard unsaved changes. Save them first?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on this page</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingRouteSwitch) {
                  setDrafts((prev) => {
                    const next: DraftMap = {};
                    for (const k of Object.keys(prev)) {
                      if (!k.startsWith(`${selectedPage.route}::`)) next[k] = prev[k];
                    }
                    return next;
                  });
                  setSelectedRoute(pendingRouteSwitch);
                  setSelectedSlotKey(null);
                  setPendingRouteSwitch(null);
                }
              }}
            >
              Discard and switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
