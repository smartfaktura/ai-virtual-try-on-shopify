// Google Tag Manager dataLayer helpers for VOVV.AI funnel tracking.
// Container GTM-P29VVFW3 is loaded in index.html.
//
// These helpers run in PARALLEL with existing gtag.js (GA4 + Google Ads) and
// Meta Pixel — they do NOT replace or duplicate them. No `page_view` is pushed
// (GTM Conversion Linker + GA4 already handle that).
//
// Privacy contract: only internal IDs, category strings, plan names, numeric
// values, currency codes, and window.location.href are pushed. Never emails,
// names, product titles, file names, prompts, or raw image URLs.

declare global {
  interface Window {
    dataLayer: any[];
  }
}

const DEBUG = import.meta.env.DEV;

// ---------- Storage with safe fallback ----------
// If localStorage / sessionStorage is unavailable (private mode, quota,
// SecurityError), fall back to in-memory Sets so dedup still works for the
// page lifetime and tracking never throws.
const memDedupPersistent = new Set<string>();
const memDedupSession = new Map<string, number>();

function localGet(key: string): string | null {
  try {
    const v = localStorage.getItem(key);
    if (v !== null) return v;
  } catch { /* ignore */ }
  return memDedupPersistent.has(key) ? '1' : null;
}
function localSet(key: string): void {
  try {
    localStorage.setItem(key, String(Date.now()));
    return;
  } catch { /* ignore */ }
  memDedupPersistent.add(key);
}
function sessionGetTs(key: string): number | null {
  try {
    const v = sessionStorage.getItem(key);
    if (v !== null) return Number(v);
  } catch { /* ignore */ }
  return memDedupSession.get(key) ?? null;
}
function sessionSetTs(key: string, ts: number): void {
  try {
    sessionStorage.setItem(key, String(ts));
    return;
  } catch { /* ignore */ }
  memDedupSession.set(key, ts);
}

// ---------- Core push ----------
function rawPush(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.debug('[GTM]', payload.event, payload);
    }
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.warn('[GTM] push failed', err);
    }
  }
}

const STORAGE_PREFIX = 'gtm:';
const SESSION_PREFIX = 'gtm-session:';

function fireOncePersistent(dedupKey: string, payload: Record<string, unknown>): boolean {
  const storeKey = `${STORAGE_PREFIX}${dedupKey}`;
  if (localGet(storeKey)) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.debug('[GTM] dedup skip', payload.event, dedupKey);
    }
    return false;
  }
  localSet(storeKey);
  rawPush(payload);
  return true;
}

function fireOnceSession(dedupKey: string, ttlMs: number, payload: Record<string, unknown>): boolean {
  const storeKey = `${SESSION_PREFIX}${dedupKey}`;
  const now = Date.now();
  const last = sessionGetTs(storeKey);
  if (last !== null && now - last < ttlMs) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.debug('[GTM] session dedup skip', payload.event, dedupKey);
    }
    return false;
  }
  sessionSetTs(storeKey, now);
  rawPush(payload);
  return true;
}

function upper(currency: string | null | undefined, fallback = 'USD'): string {
  return (currency || fallback).toUpperCase();
}

// ---------- 1. sign_up ----------
export function gtmSignUp(userId: string, method: 'email' | 'google' | string): void {
  if (!userId) return;
  fireOncePersistent(`signup:${userId}`, {
    event: 'sign_up',
    user_id: userId,
    method,
  });
}

// ---------- 2. product_uploaded ----------
export function gtmProductUploaded(args: {
  userId: string;
  productId: string;
  productCategory?: string | null;
}): void {
  const { userId, productId, productCategory } = args;
  if (!userId || !productId) return;
  fireOncePersistent(`product:${productId}`, {
    event: 'product_uploaded',
    user_id: userId,
    product_id: productId,
    ...(productCategory ? { product_category: productCategory } : {}),
  });
}

// ---------- 3. first_generation_started ----------
// Fires once per user, on the first successfully enqueued generation job.
// Caller must only invoke after the backend has returned a real generation_id.
export function gtmFirstGenerationStarted(args: {
  userId: string;
  productId?: string | null;
  generationId: string;
  visualType: string;
}): void {
  const { userId, productId, generationId, visualType } = args;
  if (!userId || !generationId) return;
  fireOncePersistent(`firstgen-started:${userId}`, {
    event: 'first_generation_started',
    user_id: userId,
    ...(productId ? { product_id: productId } : {}),
    generation_id: generationId,
    visual_type: visualType,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
  });
}

// ---------- 4. first_generation_completed ----------
// Fires once per user, only when a live generation completes with results.
// MUST NOT be invoked for historical jobs loaded from the database.
export function gtmFirstGenerationCompleted(args: {
  userId: string;
  productId?: string | null;
  generationId: string;
  visualType: string;
  resultCount: number;
}): void {
  const { userId, productId, generationId, visualType, resultCount } = args;
  if (!userId || !generationId || resultCount <= 0) return;
  fireOncePersistent(`firstgen-completed:${userId}`, {
    event: 'first_generation_completed',
    user_id: userId,
    ...(productId ? { product_id: productId } : {}),
    generation_id: generationId,
    visual_type: visualType,
    result_count: resultCount,
  });
}

// ---------- 5. pricing_page_view ----------
const PRICING_TTL_MS = 15 * 60 * 1000;
export function gtmPricingPageView(args: { userId?: string | null; path: string }): void {
  const { userId, path } = args;
  fireOnceSession(`pricing:${path}`, PRICING_TTL_MS, {
    event: 'pricing_page_view',
    ...(userId ? { user_id: userId } : {}),
    page_location: typeof window !== 'undefined' ? window.location.href : path,
  });
}

// ---------- 6. checkout_started ----------
// Caller must invoke only after Stripe has returned a session id.
export function gtmCheckoutStarted(args: {
  userId: string;
  checkoutId: string;
  planName: string;
  value: number;
  currency: string;
}): void {
  const { userId, checkoutId, planName, value, currency } = args;
  if (!userId || !checkoutId) return;
  fireOncePersistent(`checkout:${checkoutId}`, {
    event: 'checkout_started',
    user_id: userId,
    checkout_id: checkoutId,
    plan_name: planName,
    value,
    currency: upper(currency),
  });
}

// ---------- 7. subscription_purchase ----------
// Caller MUST verify a *new* transaction_id (preferring invoice → session →
// subscription) — never fire just because subscription_status === 'active'.
export function gtmSubscriptionPurchase(args: {
  userId: string;
  transactionId: string;
  planName: string;
  value: number;
  currency: string;
}): void {
  const { userId, transactionId, planName, value, currency } = args;
  if (!userId || !transactionId) return;
  fireOncePersistent(`purchase:${transactionId}`, {
    event: 'subscription_purchase',
    user_id: userId,
    transaction_id: transactionId,
    plan_name: planName,
    value,
    currency: upper(currency),
  });
}

/** Pick the strongest available identifier for a Stripe purchase. */
export function pickTransactionId(opts: {
  invoiceId?: string | null;
  sessionId?: string | null;
  subscriptionId?: string | null;
}): string | null {
  return opts.invoiceId || opts.sessionId || opts.subscriptionId || null;
}
