import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, Check, X, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UgcScene {
  label: string;
  preview_url?: string | null;
}

interface MatchedFile {
  file: File;
  previewUrl: string;
  matchedLabel: string | null;
  matchScore: number;
}

/** Normalize a string for matching: lowercase, replace separators with spaces, trim */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[-_/]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Extract candidate scene name from filename using longest-suffix-match strategy */
function extractCandidates(filename: string): string[] {
  const base = filename.replace(/\.[^.]+$/, '');
  const stripped = base.replace(/[-_]\d+$/, '');
  const words = stripped.split(/[-_\s]+/);

  const candidates: string[] = [];
  for (let start = 0; start < words.length; start++) {
    const candidate = words.slice(start).join(' ').toLowerCase().trim();
    if (candidate.length >= 3) candidates.push(candidate);
  }
  return candidates;
}

function matchFileToScene(file: File, scenes: UgcScene[]): { label: string | null; score: number } {
  const candidates = extractCandidates(file.name);
  let bestLabel: string | null = null;
  let bestScore = 0;

  for (const scene of scenes) {
    const normalizedLabel = normalize(scene.label);

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      if (candidate === normalizedLabel) {
        const score = 100 - i;
        if (score > bestScore) { bestScore = score; bestLabel = scene.label; }
      }
      if (candidate.includes(normalizedLabel) && normalizedLabel.length >= 5) {
        const score = 80 - i;
        if (score > bestScore) { bestScore = score; bestLabel = scene.label; }
      }
      if (normalizedLabel.includes(candidate) && candidate.length >= 5) {
        const score = 70 - i;
        if (score > bestScore) { bestScore = score; bestLabel = scene.label; }
      }
    }
  }

  return { label: bestLabel, score: bestScore };
}

export default function AdminUgcBulkPreviewUpload() {
  const { isAdmin } = useIsAdmin();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scenes, setScenes] = useState<UgcScene[]>([]);
  const [loadingScenes, setLoadingScenes] = useState(true);
  const [matchedFiles, setMatchedFiles] = useState<MatchedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  const loadScenes = useCallback(async () => {
    setLoadingScenes(true);
    const { data, error } = await supabase
      .from('workflows' as any)
      .select('generation_config')
      .eq('slug', 'selfie-ugc-set')
      .maybeSingle();

    if (error) {
      toast.error('Failed to load UGC scenes');
      setLoadingScenes(false);
      return;
    }

    const variations =
      (data as any)?.generation_config?.variation_strategy?.variations ?? [];
    setScenes(
      variations.map((v: any) => ({ label: v.label, preview_url: v.preview_url ?? null }))
    );
    setLoadingScenes(false);
  }, []);

  useEffect(() => { loadScenes(); }, [loadScenes]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!fileArray.length) return;

    const matched: MatchedFile[] = fileArray.map(file => {
      const { label, score } = matchFileToScene(file, scenes);
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        matchedLabel: label,
        matchScore: score,
      };
    });

    matched.sort((a, b) => (b.matchScore > 0 ? 1 : 0) - (a.matchScore > 0 ? 1 : 0));
    setMatchedFiles(matched);
  }, [scenes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleManualReassign = (index: number, label: string) => {
    setMatchedFiles(prev => prev.map((m, i) =>
      i === index ? { ...m, matchedLabel: label, matchScore: 50 } : m
    ));
  };

  const handleRemove = (index: number) => {
    setMatchedFiles(prev => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const matchedCount = matchedFiles.filter(m => m.matchedLabel).length;
  const unmatchedCount = matchedFiles.filter(m => !m.matchedLabel).length;

  const handleUploadAll = async () => {
    if (!user) return;
    const toUpload = matchedFiles.filter(m => m.matchedLabel);
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
        const fileName = `${user.id}/ugc-scene-previews/${timestamp}-${randomId}.${ext}`;

        const { data, error: uploadError } = await supabase.storage
          .from('product-uploads')
          .upload(fileName, item.file, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('product-uploads')
          .getPublicUrl(data.path);

        const { error: rpcError } = await supabase.rpc(
          'update_ugc_scene_preview' as any,
          { p_label: item.matchedLabel!, p_preview_url: urlData.publicUrl }
        );
        if (rpcError) throw rpcError;

        successCount++;
        setUploadProgress(p => ({ ...p, done: p.done + 1 }));
      } catch (err: any) {
        console.error(`Failed to upload ${item.file.name}:`, err);
        toast.error(`Failed: ${item.file.name} — ${err?.message || 'unknown error'}`);
        setUploadProgress(p => ({ ...p, done: p.done + 1 }));
      }
    }

    setUploading(false);
    toast.success(`${successCount}/${toUpload.length} previews updated`);

    matchedFiles.forEach(m => URL.revokeObjectURL(m.previewUrl));
    setMatchedFiles([]);
    await loadScenes();
  };

  const sortedScenesForSelect = useMemo(
    () => [...scenes].sort((a, b) => a.label.localeCompare(b.label)),
    [scenes]
  );

  if (!isAdmin) {
    return <div className="p-8 text-center text-muted-foreground">Admin access required</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/app/generate/selfie-ugc-set">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">UGC Scene Bulk Previews</h1>
          <p className="text-sm text-muted-foreground">
            Updates preview thumbnails for the {scenes.length || 'Selfie/UGC'} scenes of the Selfie/UGC workflow.
          </p>
        </div>
      </div>

      {loadingScenes ? (
        <Card><CardContent className="py-10 flex items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading scenes…
        </CardContent></Card>
      ) : (
        <>
          {/* Drop zone */}
          <Card>
            <CardContent className="py-4">
              <label className="text-sm font-medium block mb-3">1. Drop images here</label>
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
                  Use names like <code className="px-1 rounded bg-muted">modern-luxury-business-center.jpg</code>,{' '}
                  <code className="px-1 rounded bg-muted">beach-walk.png</code>,{' '}
                  <code className="px-1 rounded bg-muted">luxury-hotel-room.webp</code>.
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

          {/* Review matches */}
          {matchedFiles.length > 0 && (
            <Card>
              <CardContent className="py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">2. Review matches</label>
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
                        m.matchedLabel ? 'border-border' : 'border-destructive/50 bg-destructive/5'
                      }`}
                    >
                      <button
                        onClick={() => handleRemove(i)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-muted z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      <div className="aspect-square rounded overflow-hidden bg-muted">
                        <img src={m.previewUrl} alt={m.file.name} className="w-full h-full object-cover" />
                      </div>

                      <p className="text-[10px] text-muted-foreground truncate" title={m.file.name}>
                        {m.file.name}
                      </p>

                      {m.matchedLabel ? (
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          <span className="text-xs font-medium truncate">{m.matchedLabel}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                          <span className="text-xs text-destructive">No match found</span>
                        </div>
                      )}

                      <Select
                        value={m.matchedLabel || ''}
                        onValueChange={v => handleManualReassign(i, v)}
                      >
                        <SelectTrigger className="h-7 text-[10px]">
                          <SelectValue placeholder="Assign manually…" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {sortedScenesForSelect.map(s => (
                            <SelectItem key={s.label} value={s.label} className="text-xs">
                              {s.label}
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

          {/* Current scene previews overview */}
          <Card>
            <CardContent className="py-4 space-y-3">
              <label className="text-sm font-medium">Current previews ({scenes.length})</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {scenes.map(s => (
                  <div key={s.label} className="rounded-lg border p-2 space-y-1.5">
                    <div className="aspect-square rounded overflow-hidden bg-muted flex items-center justify-center">
                      {s.preview_url ? (
                        <img src={s.preview_url} alt={s.label} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">No preview</span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium truncate" title={s.label}>{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
