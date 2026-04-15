import { getExtensionFromContentType } from '@/lib/dropDownload';
import { toast } from '@/lib/brandedToast';

/**
 * Detects if the current device is mobile (iOS/Android).
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * On mobile: opens native share sheet so user can "Save Image" to Photos.
 * On desktop (or unsupported): falls back to standard download.
 */
export async function saveOrShareImage(imageUrl: string, filename: string): Promise<void> {
  try {
    const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    const response = await fetch(proxyUrl);
    const contentType = response.headers.get('content-type') || 'image/png';
    const ext = getExtensionFromContentType(contentType);
    const blob = await response.blob();
    const finalName = filename.includes('.') ? filename : `${filename}${ext}`;

    // Try Web Share API with file on mobile
    if (isMobileDevice() && navigator.share) {
      const file = new File([blob], finalName, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        if (isIOS()) {
          toast('Tap "Save Image" in the share menu', { duration: 4000 });
        }
        await navigator.share({ files: [file] });
        return;
      }
    }

    // Fallback: standard download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err: unknown) {
    // User cancelled share sheet — not an error
    if (err instanceof Error && err.name === 'AbortError') return;
    toast.error('Download failed');
  }
}
