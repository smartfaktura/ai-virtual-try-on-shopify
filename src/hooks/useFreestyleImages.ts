import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FreestyleImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  quality: string;
  createdAt: number;
  modelId?: string | null;
  sceneId?: string | null;
  productId?: string | null;
}

export interface SaveImageMeta {
  prompt: string;
  aspectRatio: string;
  quality: string;
  modelId?: string | null;
  sceneId?: string | null;
  productId?: string | null;
}

export function useFreestyleImages() {
  const { user } = useAuth();
  const [images, setImages] = useState<FreestyleImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved images on mount
  useEffect(() => {
    if (!user) {
      setImages([]);
      setIsLoading(false);
      return;
    }

    async function loadImages() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('freestyle_generations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load freestyle images:', error);
        setIsLoading(false);
        return;
      }

      const mapped: FreestyleImage[] = (data || []).map((row: any) => ({
        id: row.id,
        url: row.image_url,
        prompt: row.prompt,
        aspectRatio: row.aspect_ratio,
        quality: row.quality,
        createdAt: new Date(row.created_at).getTime(),
        modelId: row.model_id ?? null,
        sceneId: row.scene_id ?? null,
        productId: row.product_id ?? null,
      }));

      setImages(mapped);
      setIsLoading(false);
    }

    loadImages();
  }, [user]);

  // Save a generated image (base64 → storage → DB)
  const saveImage = useCallback(async (
    base64DataUrl: string,
    meta: SaveImageMeta,
  ): Promise<FreestyleImage | null> => {
    if (!user) return null;

    try {
      // Convert base64 to blob
      const response = await fetch(base64DataUrl);
      const blob = await response.blob();
      const fileId = crypto.randomUUID();
      const filePath = `${user.id}/${fileId}.png`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('freestyle-images')
        .upload(filePath, blob, { contentType: 'image/png', upsert: false });

      if (uploadError) {
        console.error('Upload failed:', uploadError);
        toast.error('Failed to save image');
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('freestyle-images')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      // Insert DB row
      const { data: row, error: dbError } = await supabase
        .from('freestyle_generations')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          prompt: meta.prompt,
          aspect_ratio: meta.aspectRatio,
          quality: meta.quality,
          model_id: meta.modelId ?? null,
          scene_id: meta.sceneId ?? null,
          product_id: meta.productId ?? null,
        })
        .select()
        .single();

      if (dbError) {
        console.error('DB insert failed:', dbError);
        toast.error('Failed to save image metadata');
        return null;
      }

      const saved: FreestyleImage = {
        id: row.id,
        url: imageUrl,
        prompt: meta.prompt,
        aspectRatio: meta.aspectRatio,
        quality: meta.quality,
        createdAt: new Date(row.created_at).getTime(),
        modelId: (row as any).model_id ?? null,
        sceneId: (row as any).scene_id ?? null,
        productId: (row as any).product_id ?? null,
      };

      setImages(prev => [saved, ...prev]);
      return saved;
    } catch (err) {
      console.error('Save image error:', err);
      toast.error('Failed to save image');
      return null;
    }
  }, [user]);

  // Delete an image from storage + DB
  const deleteImage = useCallback(async (imageId: string) => {
    if (!user) return;

    const image = images.find(i => i.id === imageId);
    if (!image) return;

    // Extract storage path from URL
    try {
      const url = new URL(image.url);
      const pathParts = url.pathname.split('/freestyle-images/');
      const storagePath = pathParts[1] ? decodeURIComponent(pathParts[1]) : null;

      // Delete from storage
      if (storagePath) {
        await supabase.storage.from('freestyle-images').remove([storagePath]);
      }
    } catch {
      // URL parsing failed, still proceed with DB delete
    }

    // Delete from DB
    const { error } = await supabase
      .from('freestyle_generations')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete image');
      return;
    }

    setImages(prev => prev.filter(i => i.id !== imageId));
    toast.success('Image deleted');
  }, [user, images]);

  // Batch save: upload all images in parallel, update state once
  const saveImages = useCallback(async (
    base64DataUrls: string[],
    meta: SaveImageMeta,
  ): Promise<FreestyleImage[]> => {
    if (!user) return [];

    const uploadOne = async (base64DataUrl: string): Promise<FreestyleImage | null> => {
      try {
        const response = await fetch(base64DataUrl);
        const blob = await response.blob();
        const fileId = crypto.randomUUID();
        const filePath = `${user.id}/${fileId}.png`;

        const { error: uploadError } = await supabase.storage
          .from('freestyle-images')
          .upload(filePath, blob, { contentType: 'image/png', upsert: false });

        if (uploadError) {
          console.error('Upload failed:', uploadError);
          return null;
        }

        const { data: urlData } = supabase.storage
          .from('freestyle-images')
          .getPublicUrl(filePath);

        const imageUrl = urlData.publicUrl;

        const { data: row, error: dbError } = await supabase
          .from('freestyle_generations')
          .insert({
            user_id: user.id,
            image_url: imageUrl,
            prompt: meta.prompt,
            aspect_ratio: meta.aspectRatio,
            quality: meta.quality,
            model_id: meta.modelId ?? null,
            scene_id: meta.sceneId ?? null,
            product_id: meta.productId ?? null,
          })
          .select()
          .single();

        if (dbError) {
          console.error('DB insert failed:', dbError);
          return null;
        }

        return {
          id: row.id,
          url: imageUrl,
          prompt: meta.prompt,
          aspectRatio: meta.aspectRatio,
          quality: meta.quality,
          createdAt: new Date(row.created_at).getTime(),
          modelId: (row as any).model_id ?? null,
          sceneId: (row as any).scene_id ?? null,
          productId: (row as any).product_id ?? null,
        };
      } catch (err) {
        console.error('Save image error:', err);
        return null;
      }
    };

    const results = await Promise.all(base64DataUrls.map(uploadOne));
    const saved = results.filter(Boolean) as FreestyleImage[];

    if (saved.length > 0) {
      setImages(prev => [...saved, ...prev]);
    }
    if (saved.length < base64DataUrls.length) {
      toast.error(`Failed to save ${base64DataUrls.length - saved.length} image(s)`);
    }

    return saved;
  }, [user]);

  // Refresh images from DB (e.g. after server-side save)
  const refreshImages = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('freestyle_generations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to refresh freestyle images:', error);
      return;
    }

    const mapped: FreestyleImage[] = (data || []).map((row: any) => ({
      id: row.id,
      url: row.image_url,
      prompt: row.prompt,
      aspectRatio: row.aspect_ratio,
      quality: row.quality,
      createdAt: new Date(row.created_at).getTime(),
      modelId: row.model_id ?? null,
      sceneId: row.scene_id ?? null,
      productId: row.product_id ?? null,
    }));

    setImages(mapped);
  }, [user]);

  return { images, isLoading, saveImage, saveImages, deleteImage, refreshImages };
}
