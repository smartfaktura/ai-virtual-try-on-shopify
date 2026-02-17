import JSZip from 'jszip';

export interface DropImage {
  url: string;
  workflow_name?: string;
  scene_name?: string;
  product_title?: string;
}

function getExtensionFromContentType(contentType: string | null): string {
  if (!contentType) return '.jpg';
  const ct = contentType.toLowerCase();
  if (ct.includes('image/png')) return '.png';
  if (ct.includes('image/webp')) return '.webp';
  if (ct.includes('image/gif')) return '.gif';
  if (ct.includes('image/jpeg') || ct.includes('image/jpg')) return '.jpg';
  return '.jpg';
}

export async function downloadDropAsZip(
  images: DropImage[],
  dropName: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  const zip = new JSZip();
  const total = images.length;

  for (let i = 0; i < total; i++) {
    const img = images[i];
    try {
      const response = await fetch(img.url);
      if (!response.ok) {
        console.warn(`Skipping image ${i + 1}: ${response.status} ${response.statusText}`);
        continue;
      }
      const contentType = response.headers.get('content-type');
      const ext = getExtensionFromContentType(contentType);
      const arrayBuffer = await response.arrayBuffer();
      const folder = img.workflow_name || 'General';
      const fileName = img.scene_name
        ? `${img.scene_name}_${i + 1}${ext}`
        : `image_${i + 1}${ext}`;
      zip.file(`${folder}/${fileName}`, arrayBuffer, { binary: true });
    } catch {
      // skip failed downloads
    }
    onProgress?.(Math.round(((i + 1) / total) * 100));
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${dropName.replace(/\s+/g, '_')}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadSingleImage(imageUrl: string, fileName: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get('content-type');
  const ext = getExtensionFromContentType(contentType);
  // Replace any existing extension in fileName with the correct one
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}
