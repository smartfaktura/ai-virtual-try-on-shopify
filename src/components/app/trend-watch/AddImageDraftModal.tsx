import { useState, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ImagePlus, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSceneRecipes } from '@/hooks/useSceneRecipes';
import { toast } from 'sonner';

interface AddImageDraftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFile?: File | null;
  onDraftCreated: () => void;
}

export function AddImageDraftModal({ open, onOpenChange, initialFile, onDraftCreated }: AddImageDraftModalProps) {
  const { user } = useAuth();
  const { createRecipe } = useSceneRecipes();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && initialFile) {
      setFile(initialFile);
      setPreview(URL.createObjectURL(initialFile));
    }
  }, [open, initialFile]);

  useEffect(() => {
    if (!open) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const f = item.getAsFile();
          if (f) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
          }
          return;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [open]);

  const handleFileSelect = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleAnalyzeAndCreate = async () => {
    if (!file || !user) return;
    setIsProcessing(true);

    try {
      // 1. Upload to scratch-uploads
      const ts = Date.now();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `trend-watch/${user.id}/${ts}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('scratch-uploads')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from('scratch-uploads')
        .getPublicUrl(path);
      const mediaUrl = urlData.publicUrl;

      // 2. Create a watch_post row
      const { data: post, error: postErr } = await supabase
        .from('watch_posts' as any)
        .insert({
          media_url: mediaUrl,
          media_type: 'IMAGE',
          source: 'manual_upload',
          posted_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (postErr) throw postErr;

      // 3. Analyze — use returned analysis directly
      const { data: analysisResult, error: analysisErr } = await supabase.functions.invoke('analyze-trend-post', {
        body: { watch_post_id: (post as any).id },
      });
      if (analysisErr) throw analysisErr;
      if (analysisResult?.error) throw new Error(analysisResult.error);

      const analysis = analysisResult?.analysis;
      if (!analysis) throw new Error('No analysis returned');

      // 4. Create scene recipe from returned analysis
      await createRecipe.mutateAsync({
        name: analysis.recommended_scene_name || 'Uploaded Scene',
        category: analysis.category || '',
        subcategory: analysis.subcategory || '',
        aesthetic_family: analysis.recommended_aesthetic_family || '',
        scene_type: analysis.scene_type || '',
        palette: analysis.palette || [],
        lighting: analysis.lighting_type || '',
        background: analysis.background_type || '',
        composition: analysis.composition_logic || '',
        crop: analysis.crop_type || '',
        camera_feel: analysis.camera_angle || '',
        props: analysis.props || [],
        mood: analysis.mood || '',
        styling_tone: analysis.styling_tone || '',
        premium_cues: analysis.premium_cues || [],
        avoid_terms: analysis.avoid_terms || [],
        source_type: 'manual_upload',
        source_reference_analysis_id: analysis.id,
        source_watch_post_id: (post as any).id,
        preview_image_url: mediaUrl,
        short_description: analysis.short_summary || '',
      });

      toast.success('Draft scene created');
      onOpenChange(false);
      onDraftCreated();
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setIsProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Image → Draft Scene</DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div
            className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Drop an image here, paste (Ctrl+V), or click to browse
            </p>
            <Input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleAnalyzeAndCreate}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing…</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" /> Analyze & Create Draft</>
                )}
              </Button>
              <Button variant="outline" onClick={reset} disabled={isProcessing}>
                Clear
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
