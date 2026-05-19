/**
 * Converts an image URL to Base64 data URL format.
 * This is necessary for AI models to access local/relative images.
 */
export async function convertImageToBase64(imageUrl: string): Promise<string> {
  // Reject obviously invalid inputs up front to avoid silently base64-ing
  // SPA fallback HTML (e.g. when a metadata flag like 'generator' leaks through).
  if (
    !imageUrl ||
    (!/^https?:\/\//i.test(imageUrl) &&
      !imageUrl.startsWith('data:') &&
      !imageUrl.startsWith('blob:') &&
      !imageUrl.startsWith('/'))
  ) {
    throw new Error(`[imageUtils] Invalid image URL: ${imageUrl}`);
  }

  // If already base64 or data URL - return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // If it's a full HTTPS URL (not localhost) - return as is
  // AI models can access these directly
  if (imageUrl.startsWith('https://') && !imageUrl.includes('localhost')) {
    return imageUrl;
  }
  
  // Convert local/relative URL to base64
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (
      contentType &&
      !contentType.startsWith('image/') &&
      contentType !== 'application/octet-stream'
    ) {
      throw new Error(
        `[imageUtils] Expected image response, got content-type "${contentType}" for ${imageUrl}`,
      );
    }

    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('[imageUtils] Converted image to base64, size:', Math.round(result.length / 1024), 'KB');
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read image as base64'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('[imageUtils] Failed to convert image:', error);
    throw error;
  }
}
