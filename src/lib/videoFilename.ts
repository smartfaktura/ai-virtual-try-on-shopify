/**
 * Shared video filename builder.
 * Pattern: {motion}_{source}_{shortId}.mp4
 */

function sanitize(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase()
    .slice(0, 40);
}

function titleCase(str: string): string {
  return str.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

interface VideoFileNameOptions {
  cameraType?: string | null;
  settingsJson?: Record<string, unknown> | null;
  projectTitle?: string | null;
  videoId?: string;
}

export function buildVideoFileName(opts: VideoFileNameOptions): string {
  const { cameraType, settingsJson, projectTitle, videoId } = opts;
  const s = settingsJson || {};

  // Motion part
  const motion = cameraType || (s.cameraMotion as string) || '';

  // Source/product part
  const source = (s.sourceName as string) || (s.productName as string) || projectTitle || '';

  // Short ID
  const shortId = videoId?.slice(0, 6) || Date.now().toString(36);

  const parts: string[] = [];
  if (motion) parts.push(sanitize(motion));
  if (source) parts.push(sanitize(source));
  parts.push(shortId);

  return `${parts.join('_')}.mp4`;
}

export function buildVideoZipName(opts: VideoFileNameOptions): string {
  const { cameraType, settingsJson } = opts;
  const s = settingsJson || {};
  const motion = cameraType || (s.cameraMotion as string) || '';
  const source = (s.sourceName as string) || '';

  const parts: string[] = [];
  if (motion) parts.push(sanitize(motion));
  if (source) parts.push(sanitize(source));
  if (parts.length === 0) parts.push('video');

  return parts.join('_');
}
