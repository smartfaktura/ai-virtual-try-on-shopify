import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, Trash2, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useHiddenScenes } from '@/hooks/useHiddenScenes';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { useSceneSortOrder, useSaveSceneSortOrder } from '@/hooks/useSceneSortOrder';
import { mockTryOnPoses, poseCategoryLabels } from '@/data/mockData';
import type { TryOnPose, PoseCategory } from '@/types';
import { toast } from 'sonner';
import { PageHeader } from '@/components/app/PageHeader';

export default function AdminScenes() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { hiddenIds, hideScene, unhideScene, filterVisible } = useHiddenScenes();
  const { asPoses: customPoses, scenes: customScenesRaw } = useCustomScenes();
  const { sortMap } = useSceneSortOrder();
  const saveSortOrder = useSaveSceneSortOrder();
  const { deleteScene } = useDeleteCustomScene();

  // Redirect non-admins
  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate('/app');
  }, [adminLoading, isAdmin, navigate]);

  // Build ordered list per category
  const allPoses = useMemo(() => {
    const visible = [...filterVisible(mockTryOnPoses), ...customPoses];
    // Apply stored sort order
    return [...visible].sort((a, b) => {
      const sa = sortMap.get(a.poseId) ?? 9999;
      const sb = sortMap.get(b.poseId) ?? 9999;
      if (sa !== sb) return sa - sb;
      return 0;
    });
  }, [filterVisible, mockTryOnPoses, customPoses, sortMap]);

  const allCategories = Object.keys(poseCategoryLabels) as PoseCategory[];

  // Local mutable order state
  const [orderedPoses, setOrderedPoses] = useState<TryOnPose[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setOrderedPoses(allPoses);
    setDirty(false);
  }, [allPoses]);

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
      const result = prev.map(p => {
        if (p.poseId === poseId) return swapPose;
        if (p.poseId === swapPose.poseId) return pose;
        return p;
      });
      return result;
    });
    setDirty(true);
  };

  const handleDelete = async (pose: TryOnPose) => {
    const isCustom = pose.poseId.startsWith('custom-');
    if (isCustom) {
      const realId = pose.poseId.replace('custom-', '');
      deleteScene.mutate(realId, {
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
    const entries: { scene_id: string; sort_order: number }[] = [];
    for (const cat of allCategories) {
      const catPoses = orderedPoses.filter(p => p.category === cat);
      for (const pose of catPoses) {
        entries.push({ scene_id: pose.poseId, sort_order: globalOrder++ });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Scene Manager" subtitle="Reorder and manage all scenes across categories" />
        <Button
          onClick={handleSave}
          disabled={!dirty || saveSortOrder.isPending}
          className="gap-2"
        >
          {saveSortOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Order
        </Button>
      </div>

      {allCategories.map(cat => {
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
                  <img
                    src={pose.previewUrl}
                    alt={pose.name}
                    className="w-10 h-12 rounded object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{pose.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{pose.poseId}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={idx === 0}
                      onClick={() => movePose(pose.poseId, 'up')}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={idx === poses.length - 1}
                      onClick={() => movePose(pose.poseId, 'down')}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(pose)}
                    >
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

// Re-export for use within this file
import { useDeleteCustomScene } from '@/hooks/useCustomScenes';
