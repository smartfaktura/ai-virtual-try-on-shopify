/**
 * Lightweight commerce-video telemetry.
 *
 * Writes to `video_projects.settings_json.commerce_telemetry` so we don't
 * need a schema change. All functions are best-effort and never throw.
 */
import { supabase } from '@/integrations/supabase/client';
import type { PreflightResult } from './preflight';
import type {
  ContentIntent,
  Platform,
  SoundMode,
  PaceMode,
  ProductPriority,
  EndingStyle,
} from '@/types/commerceVideo';

export interface ProjectMetadata {
  contentIntent?: ContentIntent | null;
  platform?: Platform;
  soundMode?: SoundMode;
  paceMode?: PaceMode;
  productPriority?: ProductPriority;
  endingStyle?: EndingStyle;
  clarityFirst?: boolean;
  shotCount?: number;
  totalDurationSec?: number;
  preflight?: PreflightResult;
}

export interface ShotMetadata {
  shotIndex: number;
  role: string;
  durationSec: number;
  fidelityFlags?: Record<string, string | boolean | undefined>;
  referenceStrategy?: string[];
}

export interface NormalizationEvent {
  type: 'migrate_legacy' | 'audio_layers_default' | 'truncate_prompt' | 'fallback_planner';
  detail?: Record<string, unknown>;
}

interface TelemetryBlob {
  project?: ProjectMetadata;
  shots?: ShotMetadata[];
  events?: (NormalizationEvent & { at: string })[];
  updatedAt?: string;
}

async function readBlob(projectId: string): Promise<TelemetryBlob> {
  try {
    const { data } = await supabase
      .from('video_projects')
      .select('settings_json')
      .eq('id', projectId)
      .maybeSingle();
    const settings = (data?.settings_json as Record<string, unknown> | null) || {};
    return ((settings.commerce_telemetry as TelemetryBlob) || {}) as TelemetryBlob;
  } catch {
    return {};
  }
}

async function writeBlob(projectId: string, blob: TelemetryBlob): Promise<void> {
  try {
    const { data } = await supabase
      .from('video_projects')
      .select('settings_json')
      .eq('id', projectId)
      .maybeSingle();
    const settings = ((data?.settings_json as Record<string, unknown>) || {});
    settings.commerce_telemetry = { ...blob, updatedAt: new Date().toISOString() };
    await supabase
      .from('video_projects')
      .update({ settings_json: settings as never })
      .eq('id', projectId);
  } catch (err) {
    console.warn('[commerce-telemetry] write failed', err);
  }
}

export async function logProjectMetadata(projectId: string | null, meta: ProjectMetadata): Promise<void> {
  if (!projectId) return;
  const blob = await readBlob(projectId);
  blob.project = { ...(blob.project || {}), ...meta };
  await writeBlob(projectId, blob);
}

export async function logShotMetadata(projectId: string | null, shots: ShotMetadata[]): Promise<void> {
  if (!projectId || !shots.length) return;
  const blob = await readBlob(projectId);
  blob.shots = shots;
  await writeBlob(projectId, blob);
}

export async function logNormalizationEvent(projectId: string | null, ev: NormalizationEvent): Promise<void> {
  if (!projectId) return;
  const blob = await readBlob(projectId);
  blob.events = [...(blob.events || []), { ...ev, at: new Date().toISOString() }].slice(-50);
  await writeBlob(projectId, blob);
}
