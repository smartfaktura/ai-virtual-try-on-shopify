// Calibrated duration estimator for Talking Video.
//
// WPM values measured roughly from probe MP4s in storage
// (generated-videos/probe/<voice>.mp4). Each probe spoke the sample
// "Hi, welcome to our new collection" (~6 words, ~2.2–2.6s of speech).
// Adjust by re-running a probe with a longer script and updating.
const VOICE_WPM: Record<string, number> = {
  ai_kaiya: 158,
  girlfriend_4_speech02: 162,
  calm_story1: 138,
  oversea_male1: 150,
  uk_man2: 146,
  uk_boy1: 168,
};
const DEFAULT_WPM = 150;

const PAUSE_SHORT = 0.25;
const PAUSE_MEDIUM = 0.6;
const PAUSE_LONG = 1.0;
const KLING_PADDING = 0.4; // intro/outro Kling adds

export const PAUSE_TOKEN = {
  short: '[.]',
  medium: '[..]',
  long: '[...]',
} as const;

const ALL_TOKEN_RE = /\[\.{1,3}\]|\[\/?em\]/g;
const SHORT_RE = /\[\.\](?!\.)/g;
const MEDIUM_RE = /\[\.\.\](?!\.)/g;
const LONG_RE = /\[\.\.\.\]/g;
const LEGACY_EM_RE = /\[\/?em\]/g;

export interface DurationEstimate {
  low: number;
  mid: number;
  high: number;
  words: number;
  fits: 'ok' | 'tight' | 'over';
  overBy: number; // seconds over target (0 if within)
}

/** Strip tokens and emphasis markers; return word count. */
export function countWords(script: string): number {
  const clean = script.replace(ALL_TOKEN_RE, ' ').trim();
  if (!clean) return 0;
  return clean.split(/\s+/).filter((w) => /\w/.test(w)).length;
}

export function countPauses(script: string) {
  const long = (script.match(LONG_RE) || []).length;
  // Remove longs first so they don't get counted as mediums/shorts
  const woLong = script.replace(LONG_RE, ' ');
  const medium = (woLong.match(MEDIUM_RE) || []).length;
  const short = (woLong.replace(MEDIUM_RE, ' ').match(SHORT_RE) || []).length;
  return { short, medium, long };
}

export function estimateDuration(
  script: string,
  voiceId: string,
  speed: number,
  targetSeconds: number,
): DurationEstimate {
  const words = countWords(script);
  const wpm = VOICE_WPM[voiceId] ?? DEFAULT_WPM;
  const safeSpeed = Math.max(0.5, Math.min(2, speed || 1));
  const { short, medium, long } = countPauses(script);

  const speech = words === 0 ? 0 : (words / (wpm * safeSpeed)) * 60;
  const pauses =
    short * PAUSE_SHORT + medium * PAUSE_MEDIUM + long * PAUSE_LONG;
  const mid = words === 0 ? 0 : speech + pauses + KLING_PADDING;

  const low = mid * 0.9;
  const high = mid * 1.1;
  const overBy = Math.max(0, high - targetSeconds);

  let fits: 'ok' | 'tight' | 'over';
  if (high > targetSeconds) fits = 'over';
  else if (targetSeconds - high < 0.4) fits = 'tight';
  else fits = 'ok';

  return { low, mid, high, words, fits, overBy };
}

/**
 * Convert composer tokens to Kling-friendly punctuation.
 * Kling lip-sync TTS has no SSML — punctuation is the only prosody lever.
 */
export function serializeForKling(script: string): string {
  return script
    .replace(LONG_RE, '. … ')
    .replace(MEDIUM_RE, '… ')
    .replace(SHORT_RE, ', ')
    .replace(LEGACY_EM_RE, '')
    .replace(/\s+([,.…])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Trim the script (token-aware) so the estimated mid duration fits the target.
 * Cuts at the latest token / sentence boundary that fits, never mid-word.
 */
export function autoTrimScript(
  script: string,
  voiceId: string,
  speed: number,
  targetSeconds: number,
): string {
  // Split into atoms: tokens, punctuation runs, and word groups
  const atoms = script.match(/\[\.{1,3}\]|\[em\]|\[\/em\]|[^\s]+|\s+/g) || [];
  let acc = '';
  let last = '';
  for (const atom of atoms) {
    const candidate = acc + atom;
    const est = estimateDuration(candidate, voiceId, speed, targetSeconds);
    if (est.fits === 'over') break;
    acc = candidate;
    if (atom.trim()) last = acc;
  }
  return (last || acc).trimEnd();
}
