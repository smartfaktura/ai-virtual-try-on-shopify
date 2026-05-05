import { useState, useMemo, useCallback, useRef } from 'react';
import { useProductImageScenes, type DbScene } from '@/hooks/useProductImageScenes';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, Check, X, ArrowLeft, ImageIcon, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLLECTION_MERGE: Record<string, string> = {
  "snacks-food": "food",
  "food-beverage": "food",
  "wallets": "wallets-cardholders",
};

const TITLE_MAP: Record<string, string> = {
  fragrance: 'Fragrance',
  'beauty-skincare': 'Beauty & Skincare',
  'makeup-lipsticks': 'Makeup & Lipsticks',
  'bags-accessories': 'Bags & Structured Accessories',
  backpacks: 'Backpacks',
  'wallets-cardholders': 'Wallets & Cardholders',
  belts: 'Belts',
  scarves: 'Scarves',
  'caps': 'Hats & Headwear',
  shoes: 'Shoes',
  sneakers: 'Sneakers',
  boots: 'Boots',
  'high-heels': 'High Heels',
  garments: 'Clothing & Apparel',
  dresses: 'Dresses',
  hoodies: 'Hoodies',
  streetwear: 'Streetwear',
  jeans: 'Jeans',
  jackets: 'Jackets',
  activewear: 'Activewear & Sportswear',
  swimwear: 'Swimwear',
  lingerie: 'Lingerie',
  kidswear: 'Kidswear',
  'jewellery-necklaces': 'Necklaces',
  'jewellery-earrings': 'Earrings',
  'jewellery-bracelets': 'Bracelets',
  'jewellery-rings': 'Rings',
  watches: 'Watches',
  eyewear: 'Eyewear',
  furniture: 'Furniture',
  'home-decor': 'Home Decor',
  'tech-devices': 'Tech / Devices',
  food: 'Food & Snacks',
  beverages: 'Beverages',
  'supplements-wellness': 'Supplements & Wellness',
};

interface MatchedFile {
  file: File;
  previewUrl: string;
  matchedScene: DbScene | null;
  matchScore: number; // 0 = no match, higher = better
}

/** Normalize a string for matching: lowercase, replace separators with spaces, trim */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Extract candidate scene name from filename using longest-suffix-match strategy */
function extractCandidates(filename: string): string[] {
  // Strip extension
  const base = filename.replace(/\.[^.]+$/, '');
  // Strip trailing _N or -N (number suffix)
  const stripped = base.replace(/[-_]\d+$/, '');
  // Split into words
  const words = stripped.split(/[-_]+/);

  // Generate progressively shorter suffixes
  const candidates: string[] = [];
  for (let start = 0; start < words.length; start++) {
    const candidate = words.slice(start).join(' ').toLowerCase().trim();
    if (candidate.length >= 3) {
      candidates.push(candidate);
    }
  }
  return candidates;
}

/** Match a file to the best scene */
function matchFileToScene(file: File, scenes: DbScene[]): { scene: DbScene | null; score: number } {
  const candidates = extractCandidates(file.name);

  let bestScene: DbScene | null = null;
  let bestScore = 0;

  for (const scene of scenes) {
    const normalizedTitle = normalize(scene.title);
    const normalizedId = normalize(scene.scene_id);

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      // Exact title match
      if (candidate === normalizedTitle) {
        const score = 100 - i; // prefer longer matches (earlier index = more specific)
        if (score > bestScore) {
          bestScore = score;
          bestScene = scene;
        }
      }
      // Exact scene_id match (with hyphens normalized to spaces)
      if (candidate === normalizedId) {
        const score = 95 - i;
        if (score > bestScore) {
          bestScore = score;
          bestScene = scene;
        }
      }
      // Title contained in candidate
      if (candidate.includes(normalizedTitle) && normalizedTitle.length >= 5) {
        const score = 80 - i;
        if (score > bestScore) {
          bestScore = score;
          bestScene = scene;
        }
      }
      // Candidate contained in title
      if (normalizedTitle.includes(candidate) && candidate.length >= 5) {
        const score = 70 - i;
        if (score > bestScore) {
          bestScore = score;
          bestScene = scene;
        }
      }
    }
  }

  return { scene: bestScene, score: bestScore };
}

export default function AdminBulkPreviewUpload() {
  const { isAdmin } = useIsAdmin();
  const { user } = useAuth();
  const { rawScenes, updateScene } = useProductImageScenes({ includePromptTemplate: true, includeInactive: true });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    const catSet = new Set<string>();
    for (const s of rawScenes) {
      if (s.is_active && s.category_collection) {
        const merged = COLLECTION_MERGE[s.category_collection] ?? s.category_collection;
        catSet.add(merged);
      }
    }
    return Array.from(catSet)
      .sort((a, b) => {
        const aSort = rawScenes.find(s => s.category_collection === a)?.category_sort_order ?? 999;
        const bSort = rawScenes.find(s => s.category_collection === b)?.category_sort_order ?? 999;
        return aSort - bSort;
      })
      .map(c => ({
        value: c,
        label: TITLE_MAP[c] || c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      }));
  }, [rawScenes]);

  const [category, setCategory] = useState<string>('');
  const [matchedFiles, setMatchedFiles] = useState<MatchedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  // Scenes filtered to selected category
  const categoryScenes = useMemo(() => {
    if (!category) return [];
    return rawScenes.filter(s => {
      const merged = COLLECTION_MERGE[s.category_collection ?? ''] ?? s.category_collection;
      return merged === category && s.is_active;
    });
  }, [rawScenes, category]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!fileArray.length) return;

    const matched: MatchedFile[] = fileArray.map(file => {
      const { scene, score } = matchFileToScene(file, categoryScenes);
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        matchedScene: scene,
        matchScore: score,
      };
    });

    // Sort: matched first, then unmatched
    matched.sort((a, b) => (b.matchScore > 0 ? 1 : 0) - (a.matchScore > 0 ? 1 : 0));
    setMatchedFiles(matched);
  }, [categoryScenes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleManualReassign = (index: number, sceneId: string) => {
    setMatchedFiles(prev => prev.map((m, i) => {
      if (i !== index) return m;
      const scene = categoryScenes.find(s => s.id === sceneId) || null;
      return { ...m, matchedScene: scene, matchScore: scene ? 50 : 0 };
    }));
  };

  const handleRemove = (index: number) => {
    setMatchedFiles(prev => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const matchedCount = matchedFiles.filter(m => m.matchedScene).length;
  const unmatchedCount = matchedFiles.filter(m => !m.matchedScene).length;

  const handleUploadAll = async () => {
    if (!user) return;
    const toUpload = matchedFiles.filter(m => m.matchedScene);
    if (!toUpload.length) {
      toast.error('No matched files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress({ done: 0, total: toUpload.length });
    let successCount = 0;

    for (const item of toUpload) {
      try {
        const ext = item.file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const fileName = `${user.id}/scene-previews/${timestamp}-${randomId}.${ext}`;

        const { data, error: uploadError } = await supabase.storage
          .from('product-uploads')
          .upload(fileName, item.file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('product-uploads')
          .getPublicUrl(data.path);

        await updateScene.mutateAsync({
          id: item.matchedScene!.id,
          updates: { preview_image_url: urlData.publicUrl },
        });

        successCount++;
        setUploadProgress(p => ({ ...p, done: p.done + 1 }));
      } catch (err: any) {
        console.error(`Failed to upload ${item.file.name}:`, err);
        toast.error(`Failed: ${item.file.name}`);
        setUploadProgress(p => ({ ...p, done: p.done + 1 }));
      }
    }

    setUploading(false);
    toast.success(`${successCount}/${toUpload.length} previews updated`);

    // Clean up
    matchedFiles.forEach(m => URL.revokeObjectURL(m.previewUrl));
    setMatchedFiles([]);
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-muted-foreground">Admin access required</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/app/admin/product-image-scenes">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bulk Preview Upload</h1>
          <p className="text-sm text-muted-foreground">Drop multiple images to auto-match and update scene previews.</p>
        </div>
      </div>

      {/* Step 1: Category */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <label className="text-sm font-medium">1. Select category to match against</label>
          <Select value={category} onValueChange={v => { setCategory(v); setMatchedFiles([]); }}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose category…" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {category && (
            <p className="text-xs text-muted-foreground">
              {categoryScenes.length} active scenes in this category
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Drop zone */}
      {category && (
        <Card>
          <CardContent className="py-4">
            <label className="text-sm font-medium block mb-3">2. Drop images here</label>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Drag & drop images here, or click to select
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Filenames are matched to scene titles automatically
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && handleFiles(e.target.files)}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review matches */}
      {matchedFiles.length > 0 && (
        <Card>
          <CardContent className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">3. Review matches</label>
                <div className="flex gap-3 mt-1">
                  <Badge variant="default" className="text-xs">
                    <Check className="w-3 h-3 mr-1" /> {matchedCount} matched
                  </Badge>
                  {unmatchedCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" /> {unmatchedCount} unmatched
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    matchedFiles.forEach(m => URL.revokeObjectURL(m.previewUrl));
                    setMatchedFiles([]);
                  }}
                >
                  Clear all
                </Button>
                <Button
                  size="sm"
                  onClick={handleUploadAll}
                  disabled={uploading || matchedCount === 0}
                  className="gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  Upload {matchedCount} previews
                </Button>
              </div>
            </div>

            {uploading && (
              <div className="space-y-1">
                <Progress value={(uploadProgress.done / uploadProgress.total) * 100} />
                <p className="text-xs text-muted-foreground text-center">
                  {uploadProgress.done} / {uploadProgress.total} complete
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {matchedFiles.map((m, i) => (
                <div
                  key={i}
                  className={`relative rounded-lg border p-2 space-y-2 ${
                    m.matchedScene ? 'border-border' : 'border-destructive/50 bg-destructive/5'
                  }`}
                >
                  <button
                    onClick={() => handleRemove(i)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-muted z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* Image preview */}
                  <div className="aspect-square rounded overflow-hidden bg-muted">
                    <img
                      src={m.previewUrl}
                      alt={m.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Filename */}
                  <p className="text-[10px] text-muted-foreground truncate" title={m.file.name}>
                    {m.file.name}
                  </p>

                  {/* Match info */}
                  {m.matchedScene ? (
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span className="text-xs font-medium truncate">{m.matchedScene.title}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <span className="text-xs text-destructive">No match found</span>
                    </div>
                  )}

                  {/* Manual reassign */}
                  <Select
                    value={m.matchedScene?.id || ''}
                    onValueChange={v => handleManualReassign(i, v)}
                  >
                    <SelectTrigger className="h-7 text-[10px]">
                      <SelectValue placeholder="Assign manually…" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {categoryScenes.map(s => (
                        <SelectItem key={s.id} value={s.id} className="text-xs">
                          {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
