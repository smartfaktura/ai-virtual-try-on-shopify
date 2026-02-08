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
      }));

      setImages(mapped);
      setIsLoading(false);
    }

    loadImages();
  }, [user]);

  // Save a generated image (base64 → storage → DB)
  const saveImage = useCallback(async (
    base64DataUrl: string,
    prompt: string,
    aspectRatio: string,
    quality: string,
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
          prompt,
          aspect_ratio: aspectRatio,
          quality,
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
        prompt,
        aspectRatio,
        quality,
        createdAt: new Date(row.created_at).getTime(),
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

  return { images, isLoading, saveImage, deleteImage };
}
