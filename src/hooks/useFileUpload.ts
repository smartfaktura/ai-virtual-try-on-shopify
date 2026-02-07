import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseFileUploadResult {
  upload: (file: File) => Promise<string | null>;
  isUploading: boolean;
  error: string | null;
  progress: number;
}

export function useFileUpload(): UseFileUploadResult {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error('Please sign in to upload');
      return null;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Generate unique filename with user-scoped path
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${timestamp}-${randomId}.${extension}`;

      setProgress(30);

      // Upload to secure product-uploads bucket
      const { data, error: uploadError } = await supabase.storage
        .from('product-uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setProgress(80);

      // Get signed URL for private bucket
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('product-uploads')
        .createSignedUrl(data.path, 60 * 60 * 24 * 365);

      if (signedUrlError) {
        throw new Error(signedUrlError.message);
      }

      setProgress(100);
      
      toast.success('Image uploaded successfully');
      return signedUrlData.signedUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  return {
    upload,
    isUploading,
    error,
    progress,
  };
}
