import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseFileUploadResult {
  upload: (file: File) => Promise<string | null>;
  isUploading: boolean;
  error: string | null;
  progress: number;
}

export function useFileUpload(): UseFileUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${timestamp}-${randomId}.${extension}`;

      setProgress(30);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('scratch-uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setProgress(80);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('scratch-uploads')
        .getPublicUrl(data.path);

      setProgress(100);
      
      toast.success('Image uploaded successfully');
      return urlData.publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    upload,
    isUploading,
    error,
    progress,
  };
}
