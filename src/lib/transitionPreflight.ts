/**
 * Pre-flight validation for Start & End Video uploads.
 * Enforces Kling image2video constraints BEFORE submitting the job:
 *   - file type (.jpg/.jpeg/.png)
 *   - size ≤ 10MB
 *   - resolution ≥ 300px each side
 *   - aspect ratio within 1:2.5–2.5:1
 *   - start & end MUST share the same aspect ratio (within 5%)
 */

import type { ValidationWarning } from '@/components/app/video/ValidationWarnings';

export interface ImageProbe {
  width: number;
  height: number;
  sizeBytes?: number;
  mimeType?: string;
}

export interface PreflightInput {
  start: ImageProbe | null;
  end: ImageProbe | null;
}

export interface PreflightResult {
  warnings: ValidationWarning[];
  /** True only when both frames pass all blocking checks. */
  ok: boolean;
}

const MAX_BYTES = 10 * 1024 * 1024;
const MIN_DIMENSION = 300;
const MIN_AR = 1 / 2.5; // 0.4
const MAX_AR = 2.5;
const AR_MATCH_TOLERANCE = 0.05; // 5%
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png'];

function aspectRatio(p: ImageProbe): number {
  return p.width / p.height;
}

function checkOne(label: 'Start' | 'End', p: ImageProbe): { warnings: ValidationWarning[]; blocking: boolean } {
  const warnings: ValidationWarning[] = [];
  let blocking = false;

  if (p.sizeBytes && p.sizeBytes > MAX_BYTES) {
    warnings.push({ type: 'error', message: `${label} image is over 10MB. Please compress and re-upload.` });
    blocking = true;
  }
  if (p.width < MIN_DIMENSION || p.height < MIN_DIMENSION) {
    warnings.push({ type: 'error', message: `${label} image is too small (${p.width}×${p.height}). Each side must be at least ${MIN_DIMENSION}px.` });
    blocking = true;
  }
  const ar = aspectRatio(p);
  if (ar < MIN_AR || ar > MAX_AR) {
    warnings.push({ type: 'error', message: `${label} image aspect ratio is outside the supported range (1:2.5–2.5:1).` });
    blocking = true;
  }
  if (p.mimeType && !ALLOWED_MIME.includes(p.mimeType.toLowerCase())) {
    warnings.push({ type: 'warning', message: `${label} image format may not be optimal. JPG or PNG is recommended.` });
  }

  return { warnings, blocking };
}

export function runTransitionPreflight(input: PreflightInput): PreflightResult {
  const warnings: ValidationWarning[] = [];
  let blocking = false;

  if (!input.start || !input.end) {
    return { warnings, ok: false };
  }

  const startCheck = checkOne('Start', input.start);
  const endCheck = checkOne('End', input.end);
  warnings.push(...startCheck.warnings, ...endCheck.warnings);
  blocking = blocking || startCheck.blocking || endCheck.blocking;

  // AR match check — Kling requires both frames share the same AR.
  const startAR = aspectRatio(input.start);
  const endAR = aspectRatio(input.end);
  const arDiff = Math.abs(startAR - endAR) / Math.max(startAR, endAR);
  if (arDiff > AR_MATCH_TOLERANCE) {
    warnings.push({
      type: 'error',
      message: 'Start and end images must have the same aspect ratio. Crop or re-upload one of them.',
    });
    blocking = true;
  }

  return { warnings, ok: !blocking };
}

/** Probe an image File (browser side) for dimensions + size. */
export async function probeFile(file: File): Promise<ImageProbe> {
  const url = URL.createObjectURL(file);
  try {
    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
    return { ...dims, sizeBytes: file.size, mimeType: file.type };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Probe a remote URL (used when image came from the library). Size is unknown. */
export async function probeUrl(url: string): Promise<ImageProbe> {
  const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
  return { ...dims };
}

/** Pick a Kling-compatible aspect ratio label from a probe. */
export function probeToAspectRatio(p: ImageProbe): '1:1' | '16:9' | '9:16' {
  const ar = p.width / p.height;
  if (ar > 1.3) return '16:9';
  if (ar < 0.77) return '9:16';
  return '1:1';
}
