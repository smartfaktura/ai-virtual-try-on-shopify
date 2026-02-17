import { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toSignedUrl, toSignedUrls } from '@/lib/signedUrl';

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

const PAGE_SIZE = 20;
const QUERY_KEY = 'freestyle-images';

export function useFreestyleImages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const infiniteQuery = useInfiniteQuery({
    queryKey: [QUERY_KEY, user?.id],
    queryFn: async ({ pageParam = 0 }): Promise<{ items: FreestyleImage[]; hasMore: boolean }> => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('freestyle_generations')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Failed to load freestyle images:', error);
        throw error;
      }

      const rows = data || [];

      // Batch sign all URLs at once
      const rawUrls = rows.map((row: any) => row.image_url);
      const signedUrls = await toSignedUrls(rawUrls);

      const items: FreestyleImage[] = rows.map((row: any, i: number) => ({
        id: row.id,
        url: signedUrls[i],
        prompt: row.prompt,
        aspectRatio: row.aspect_ratio,
        quality: row.quality,
        createdAt: new Date(row.created_at).getTime(),
        modelId: row.model_id ?? null,
        sceneId: row.scene_id ?? null,
        productId: row.product_id ?? null,
      }));

      return { items, hasMore: rows.length === PAGE_SIZE };
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Flatten pages into a single array
  const images = useMemo(() => {
    if (!infiniteQuery.data) return [];
    return infiniteQuery.data.pages.flatMap(page => page.items);
  }, [infiniteQuery.data]);

  const isLoading = infiniteQuery.isLoading;

  // Save a generated image (base64 → storage → DB)
  const saveImage = useCallback(async (
    base64DataUrl: string,
    meta: SaveImageMeta,
  ): Promise<FreestyleImage | null> => {
    if (!user) return null;

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
        toast.error('Failed to save image');
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
        toast.error('Failed to save image metadata');
        return null;
      }

      const signedImageUrl = await toSignedUrl(imageUrl);
      const saved: FreestyleImage = {
        id: row.id,
        url: signedImageUrl,
        prompt: meta.prompt,
        aspectRatio: meta.aspectRatio,
        quality: meta.quality,
        createdAt: new Date(row.created_at).getTime(),
        modelId: (row as any).model_id ?? null,
        sceneId: (row as any).scene_id ?? null,
        productId: (row as any).product_id ?? null,
      };

      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      return saved;
    } catch (err) {
      console.error('Save image error:', err);
      toast.error('Failed to save image');
      return null;
    }
  }, [user, queryClient]);

  // Delete an image from storage + DB
  const deleteImage = useCallback(async (imageId: string) => {
    if (!user) return;

    const image = images.find(i => i.id === imageId);
    if (!image) return;

    try {
      const url = new URL(image.url);
      const pathParts = url.pathname.split('/freestyle-images/');
      const storagePath = pathParts[1] ? decodeURIComponent(pathParts[1]) : null;

      if (storagePath) {
        await supabase.storage.from('freestyle-images').remove([storagePath]);
      }
    } catch {
      // URL parsing failed, still proceed with DB delete
    }

    const { error } = await supabase
      .from('freestyle_generations')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete image');
      return;
    }

    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    toast.success('Image deleted');
  }, [user, images, queryClient]);

  // Batch save
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

        const signedBatchUrl = await toSignedUrl(imageUrl);
        return {
          id: row.id,
          url: signedBatchUrl,
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

    if (saved.length < base64DataUrls.length) {
      toast.error(`Failed to save ${base64DataUrls.length - saved.length} image(s)`);
    }

    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    return saved;
  }, [user, queryClient]);

  // Refresh = invalidate cache
  const refreshImages = useCallback(() => {
    queryClient.refetchQueries({ queryKey: [QUERY_KEY] });
  }, [queryClient]);

  return {
    images,
    isLoading,
    saveImage,
    saveImages,
    deleteImage,
    refreshImages,
    fetchNextPage: infiniteQuery.fetchNextPage,
    hasNextPage: infiniteQuery.hasNextPage ?? false,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
  };
}
