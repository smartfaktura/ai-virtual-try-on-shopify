import JSZip from 'jszip';

export interface DropImage {
  url: string;
  workflow_name?: string;
  scene_name?: string;
  product_title?: string;
}

export function getExtensionFromContentType(contentType: string | null): string {
  if (!contentType) return '.png';
  const ct = contentType.toLowerCase();
  if (ct.includes('image/png')) return '.png';
  if (ct.includes('image/webp')) return '.webp';
  if (ct.includes('image/gif')) return '.gif';
  if (ct.includes('image/jpeg') || ct.includes('image/jpg')) return '.jpg';
  return '.png';
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
      const folder = (img.workflow_name || 'General').replace(/\//g, '–');
      const fileName = img.scene_name
        ? `${img.scene_name.replace(/\//g, '–')}_${i + 1}${ext}`
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

function getVideoExtension(ct: string | null): string {
  if (!ct) return '.mp4';
  if (ct.includes('video/mp4')) return '.mp4';
  if (ct.includes('video/webm')) return '.webm';
  return '.mp4';
}

export async function downloadVideosAsZip(
  videos: { url: string; name: string }[],
  zipName: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  const zip = new JSZip();
  const total = videos.length;

  for (let i = 0; i < total; i++) {
    const v = videos[i];
    try {
      const response = await fetch(v.url);
      if (!response.ok) continue;
      const contentType = response.headers.get('content-type');
      const ext = getVideoExtension(contentType);
      const arrayBuffer = await response.arrayBuffer();
      const baseName = v.name.replace(/\.[^.]+$/, '');
      zip.file(`${baseName}${ext}`, arrayBuffer, { binary: true });
    } catch {
      // skip failed downloads
    }
    onProgress?.(Math.round(((i + 1) / total) * 100));
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${zipName.replace(/\s+/g, '_')}.zip`;
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
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}
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
