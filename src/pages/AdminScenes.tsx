import { useState, useMemo, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, ChevronsUp, Trash2, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useHiddenScenes } from '@/hooks/useHiddenScenes';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { useSceneSortOrder, useSaveSceneSortOrder } from '@/hooks/useSceneSortOrder';
import { mockTryOnPoses, poseCategoryLabels } from '@/data/mockData';
import type { TryOnPose, PoseCategory } from '@/types';
import { toast } from 'sonner';
import { useDeleteCustomScene } from '@/hooks/useCustomScenes';

export default function AdminScenes() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { hiddenIds, hideScene, unhideScene, filterVisible } = useHiddenScenes();
  const { asPoses: customPoses, scenes: customScenesRaw } = useCustomScenes();
  const { sortMap, categoryMap } = useSceneSortOrder();
  const saveSortOrder = useSaveSceneSortOrder();
  const deleteSceneMutation = useDeleteCustomScene();

  // Stable deps: serialize hiddenIds and sortMap to avoid recreating allPoses on every render
  const hiddenKey = JSON.stringify(hiddenIds);
  const sortKey = JSON.stringify([...sortMap.entries()]);
  const categoryOverrideKey = JSON.stringify([...categoryMap.entries()]);
  const customKey = JSON.stringify(customPoses.map(p => p.poseId));

  const allPoses = useMemo(() => {
    const visible = mockTryOnPoses.filter(p => !hiddenIds.includes(p.poseId));
    const combined = [...visible, ...customPoses];
    const withOverrides = combined.map(p => {
      const override = categoryMap.get(p.poseId);
      if (override) return { ...p, category: override as PoseCategory };
      return p;
    });
    return [...withOverrides].sort((a, b) => {
      const sa = sortMap.get(a.poseId) ?? 9999;
      const sb = sortMap.get(b.poseId) ?? 9999;
      if (sa !== sb) return sa - sb;
      return 0;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenKey, sortKey, categoryOverrideKey, customKey]);

  const defaultCategoryOrder = Object.keys(poseCategoryLabels) as PoseCategory[];

  // Local mutable state
  const [orderedPoses, setOrderedPoses] = useState<TryOnPose[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<PoseCategory[]>(defaultCategoryOrder);
  const [dirty, setDirty] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (allPoses.length > 0) {
      setOrderedPoses(allPoses);
      if (sortMap.size > 0) {
        const catMinOrder = new Map<string, number>();
        allPoses.forEach(p => {
          const order = sortMap.get(p.poseId) ?? 9999;
          const current = catMinOrder.get(p.category);
          if (current === undefined || order < current) {
            catMinOrder.set(p.category, order);
          }
        });
        const derived = [...catMinOrder.entries()]
          .sort((a, b) => a[1] - b[1])
          .map(([cat]) => cat as PoseCategory);
        const remaining = defaultCategoryOrder.filter(c => !derived.includes(c));
        setCategoryOrder([...derived, ...remaining]);
      }
      setDirty(false);
      setInitialized(true);
    }
  }, [allPoses]);

  // Guard: redirect non-admins after all hooks
  if (adminLoading) return null;
  if (!isAdmin) return <Navigate to="/app" replace />;

  const movePose = (poseId: string, direction: 'up' | 'down') => {
    setOrderedPoses(prev => {
      const pose = prev.find(p => p.poseId === poseId);
      if (!pose) return prev;
      const cat = pose.category;
      const catPoses = prev.filter(p => p.category === cat);
      const idx = catPoses.findIndex(p => p.poseId === poseId);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= catPoses.length) return prev;

      const swapPose = catPoses[swapIdx];
      // Swap in the full array
      const globalIdxA = prev.findIndex(p => p.poseId === poseId);
      const globalIdxB = prev.findIndex(p => p.poseId === swapPose.poseId);
      const result = [...prev];
      result[globalIdxA] = swapPose;
      result[globalIdxB] = pose;
      return result;
    });
    setDirty(true);
  };

  const movePoseToTop = (poseId: string) => {
    setOrderedPoses(prev => {
      const pose = prev.find(p => p.poseId === poseId);
      if (!pose) return prev;
      const withoutPose = prev.filter(p => p.poseId !== poseId);
      const firstCatIdx = withoutPose.findIndex(p => p.category === pose.category);
      const result = [...withoutPose];
      result.splice(firstCatIdx >= 0 ? firstCatIdx : 0, 0, pose);
      return result;
    });
    setDirty(true);
  };

  const changePoseCategory = (poseId: string, newCategory: PoseCategory) => {
    setOrderedPoses(prev =>
      prev.map(p => p.poseId === poseId ? { ...p, category: newCategory } : p)
    );
    setDirty(true);
  };

  const moveCategoryOrder = (cat: PoseCategory, direction: 'up' | 'down') => {
    setCategoryOrder(prev => {
      const idx = prev.indexOf(cat);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const result = [...prev];
      [result[idx], result[swapIdx]] = [result[swapIdx], result[idx]];
      return result;
    });
    setDirty(true);
  };

  const handleDelete = async (pose: TryOnPose) => {
    const isCustom = pose.poseId.startsWith('custom-');
    if (isCustom) {
      const realId = pose.poseId.replace('custom-', '');
      deleteSceneMutation.mutate(realId, {
        onSuccess: () => toast.success(`Deleted "${pose.name}"`),
        onError: () => toast.error('Failed to delete scene'),
      });
    } else {
      hideScene.mutate(pose.poseId, {
        onSuccess: () => toast.success(`Hidden "${pose.name}"`),
        onError: () => toast.error('Failed to hide scene'),
      });
    }
  };

  const handleSave = () => {
    let globalOrder = 0;
    const entries: { scene_id: string; sort_order: number; category_override?: string | null }[] = [];
    for (const cat of categoryOrder) {
      const catPoses = orderedPoses.filter(p => p.category === cat);
      for (const pose of catPoses) {
        // Determine if this pose's original category differs from current
        const originalPose = [...mockTryOnPoses, ...customPoses].find(p => p.poseId === pose.poseId);
        const originalCategory = originalPose?.category;
        const categoryOverride = originalCategory !== pose.category ? pose.category : null;
        entries.push({
          scene_id: pose.poseId,
          sort_order: globalOrder++,
          category_override: categoryOverride,
        });
      }
    }
    saveSortOrder.mutate(entries, {
      onSuccess: () => {
        toast.success('Sort order saved');
        setDirty(false);
      },
      onError: () => toast.error('Failed to save sort order'),
    });
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return null;

  // Only show categories that have poses
  const activeCats = categoryOrder.filter(cat =>
    orderedPoses.some(p => p.category === cat)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Scene Manager</h1>
          <p className="text-xs text-muted-foreground">Reorder scenes, change categories, and manage visibility</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!dirty || saveSortOrder.isPending}
          className="gap-2"
        >
          {saveSortOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Order
        </Button>
      </div>

      {/* ── CATEGORY ORDER SECTION ── */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category Order</h2>
        <div className="border border-border rounded-lg divide-y divide-border bg-card">
          {activeCats.map((cat, catIdx) => {
            const count = orderedPoses.filter(p => p.category === cat).length;
            return (
              <div key={cat} className="flex items-center gap-3 px-3 py-2">
                <span className="text-muted-foreground text-xs">≡</span>
                <span className="text-sm font-medium flex-1">{poseCategoryLabels[cat]} ({count})</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={catIdx === 0} onClick={() => moveCategoryOrder(cat, 'up')}>
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={catIdx === activeCats.length - 1} onClick={() => moveCategoryOrder(cat, 'down')}>
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SCENES BY CATEGORY ── */}
      {activeCats.map((cat) => {
        const poses = orderedPoses.filter(p => p.category === cat);
        if (poses.length === 0) return null;
        return (
          <div key={cat} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {poseCategoryLabels[cat]} ({poses.length})
            </h3>
            <div className="border border-border rounded-lg divide-y divide-border bg-card">
              {poses.map((pose, idx) => (
                <div key={pose.poseId} className="flex items-center gap-3 px-3 py-2">
                  <div className="relative w-10 h-12 rounded bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <img
                      src={pose.previewUrl}
                      alt={pose.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span className="absolute text-[10px] font-medium text-muted-foreground pointer-events-none">{pose.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{pose.name}</p>
                    <Select value={pose.category} onValueChange={(val) => changePoseCategory(pose.poseId, val as PoseCategory)}>
                      <SelectTrigger className="h-6 w-auto min-w-[120px] text-[10px] border-0 bg-muted/50 px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultCategoryOrder.map(c => (
                          <SelectItem key={c} value={c} className="text-xs">{poseCategoryLabels[c]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => movePoseToTop(pose.poseId)} title="Move to top">
                      <ChevronsUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => movePose(pose.poseId, 'up')}>
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === poses.length - 1} onClick={() => movePose(pose.poseId, 'down')}>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(pose)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
