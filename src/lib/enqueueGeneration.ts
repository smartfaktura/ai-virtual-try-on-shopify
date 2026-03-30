import { supabase } from '@/integrations/supabase/client';

const ENQUEUE_URL = () => `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enqueue-generation`;

const MIN_GAP_MS = 300;
const MAX_RETRIES = 6;

export interface EnqueuePayload {
  jobType: string;
  payload: Record<string, unknown>;
  imageCount: number;
  quality?: string;
  hasModel?: boolean;
  hasScene?: boolean;
  resolution?: string;
  additionalProductCount?: number;
  skipWake?: boolean;
  [key: string]: unknown;
}

export interface EnqueueResult {
  jobId: string;
  newBalance: number;
  [key: string]: unknown;
}

export type EnqueueError =
  | { type: 'rate_limit'; message: string; retryable: false }
  | { type: 'insufficient_credits'; message: string; retryable: false }
  | { type: 'fatal'; message: string; retryable: false }
  | { type: 'network'; message: string; retryable: false };

/**
 * Enqueue a single generation job with retry + backoff for transient errors.
 * Returns the result on success, or an error descriptor on failure.
 */
export async function enqueueWithRetry(
  body: EnqueuePayload,
  token: string,
): Promise<EnqueueResult | EnqueueError> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(ENQUEUE_URL(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return await response.json();
      }

      const err = await response.json().catch(() => ({}));
      const errMsg = String(err.error || err.message || '');

      const isTransient =
        response.status === 429 ||
        response.status === 502 ||
        response.status === 503 ||
        errMsg.toLowerCase().includes('too many requests') ||
        errMsg.toLowerCase().includes('burst') ||
        errMsg.toLowerCase().includes('concurrent');

      if (isTransient && attempt < MAX_RETRIES - 1) {
        const retryAfter = err.retry_after_seconds
          ? Number(err.retry_after_seconds)
          : Math.pow(2, attempt + 1);
        const jitter = Math.random() * 1000;
        console.warn(`[enqueue] Transient error, retry ${attempt + 1}/${MAX_RETRIES - 1} in ${retryAfter}s`);
        await new Promise(r => setTimeout(r, retryAfter * 1000 + jitter));
        continue;
      }

      if (response.status === 402) {
        return { type: 'insufficient_credits', message: err.error || 'Insufficient credits', retryable: false };
      }

      if (isTransient) {
        return { type: 'rate_limit', message: errMsg || 'Rate limit exceeded', retryable: false };
      }

      return { type: 'fatal', message: err.error || 'Failed to enqueue', retryable: false };
    } catch (fetchErr) {
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        continue;
      }
      console.error('[enqueue] Network error:', fetchErr);
      return { type: 'network', message: 'Network error', retryable: false };
    }
  }
  return { type: 'fatal', message: 'Max retries exceeded', retryable: false };
}

/** Check if a result is an error */
export function isEnqueueError(r: EnqueueResult | EnqueueError): r is EnqueueError {
  return 'type' in r && 'retryable' in r;
}

/** Send a wakeOnly request to trigger the queue processor */
export function sendWake(token: string): void {
  fetch(ENQUEUE_URL(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ wakeOnly: true }),
  }).catch(() => {});
}

/** Get an auth token, returns null if not available */
export async function getAuthToken(): Promise<string | null> {
  const { data: session } = await supabase.auth.getSession();
  return session?.session?.access_token || null;
}

/**
 * Enforce minimum gap between enqueue calls.
 * Call this between sequential enqueue calls in a batch loop.
 */
export function paceDelay(index: number): Promise<void> {
  if (index === 0) return Promise.resolve();
  return new Promise(r => setTimeout(r, MIN_GAP_MS));
}
