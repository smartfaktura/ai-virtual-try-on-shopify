/**
 * Backward-compatible migration for legacy Short Film drafts.
 *
 * Fills new commerce-video fields with safe defaults so old projects load
 * without missing data, while preserving the user's original choices.
 */
import type {
  ContentIntent, Platform, SoundMode, PaceMode, ProductPriority,
  EndingStyle, CommerceVideoSettings,
} from '@/types/commerceVideo';
import {
  DEFAULT_CONTENT_INTENT, DEFAULT_PLATFORM, DEFAULT_SOUND_MODE,
  DEFAULT_PACE_MODE, DEFAULT_PRODUCT_PRIORITY, DEFAULT_ENDING_STYLE,
  CLARITY_FIRST_INTENTS,
} from '@/types/commerceVideo';

/** Map legacy filmType → contentIntent if no explicit intent is present. */
function intentFromFilmType(filmType?: string | null): ContentIntent {
  switch (filmType) {
    case 'product_launch':    return 'launch_teaser';
    case 'brand_story':       return 'brand_mood_film';
    case 'fashion_campaign':  return 'campaign_editorial';
    case 'beauty_film':       return 'product_detail_film';
    case 'luxury_mood':       return 'brand_mood_film';
    case 'sports_campaign':   return 'social_content';
    case 'lifestyle_teaser':  return 'social_content';
    case 'custom':
    default:
      return DEFAULT_CONTENT_INTENT;
  }
}

/** Map legacy audioMode → SoundMode (uses richer enum). */
function soundModeFromAudioMode(audioMode?: string): SoundMode {
  switch (audioMode) {
    case 'silent':    return 'silent_first';
    case 'ambient':   return 'music_only';
    case 'music':     return 'music_plus_sfx';
    case 'voiceover': return 'voiceover_plus_music';
    case 'full_mix':  return 'full_audio';
    default:          return DEFAULT_SOUND_MODE;
  }
}

export interface LegacyDraftLike {
  step?: string;
  filmType?: string | null;
  storyStructure?: string | null;
  references?: unknown[];
  shots?: unknown[];
  settings?: Record<string, any>;
  planMode?: string;
  customRoles?: string[];
  // New commerce fields (may be missing on old drafts)
  contentIntent?: ContentIntent;
  platform?: Platform;
  soundMode?: SoundMode;
  paceMode?: PaceMode;
  productPriority?: ProductPriority;
  endingStyle?: EndingStyle;
  audienceContext?: string;
  offerContext?: string;
  clarityFirstMode?: boolean;
}

/**
 * Migrate a legacy draft state object in-place safely. Returns the same
 * object reference with new fields filled. Logs `[migrate]` events for
 * any defaulted fields so we can audit migration in production.
 */
export function migrateLegacyDraft<T extends LegacyDraftLike>(draft: T): T {
  if (!draft || typeof draft !== 'object') return draft;

  const events: string[] = [];

  if (!draft.contentIntent) {
    draft.contentIntent = intentFromFilmType(draft.filmType);
    events.push(`contentIntent=${draft.contentIntent} (from filmType=${draft.filmType ?? 'none'})`);
  }
  if (!draft.platform) {
    draft.platform = DEFAULT_PLATFORM;
    events.push(`platform=${DEFAULT_PLATFORM}`);
  }
  if (!draft.soundMode) {
    const mapped = soundModeFromAudioMode(draft.settings?.audioMode);
    draft.soundMode = mapped;
    events.push(`soundMode=${mapped} (from audioMode=${draft.settings?.audioMode ?? 'none'})`);
  }
  if (!draft.paceMode) {
    draft.paceMode = DEFAULT_PACE_MODE;
    events.push(`paceMode=${DEFAULT_PACE_MODE}`);
  }
  if (!draft.productPriority) {
    draft.productPriority = DEFAULT_PRODUCT_PRIORITY;
    events.push(`productPriority=${DEFAULT_PRODUCT_PRIORITY}`);
  }
  if (!draft.endingStyle) {
    draft.endingStyle = DEFAULT_ENDING_STYLE;
    events.push(`endingStyle=${DEFAULT_ENDING_STYLE}`);
  }
  if (typeof draft.clarityFirstMode !== 'boolean') {
    draft.clarityFirstMode = CLARITY_FIRST_INTENTS.includes(draft.contentIntent);
    events.push(`clarityFirstMode=${draft.clarityFirstMode}`);
  }

  if (events.length > 0) {
    console.info('[migrate][short-film]', events.join(' | '));
  }
  return draft;
}

/** Build a CommerceVideoSettings snapshot from a draft for logging/payloads. */
export function commerceSettingsFromDraft(draft: LegacyDraftLike): CommerceVideoSettings {
  return {
    contentIntent: draft.contentIntent ?? DEFAULT_CONTENT_INTENT,
    platform: draft.platform ?? DEFAULT_PLATFORM,
    soundMode: draft.soundMode ?? DEFAULT_SOUND_MODE,
    paceMode: draft.paceMode ?? DEFAULT_PACE_MODE,
    productPriority: draft.productPriority ?? DEFAULT_PRODUCT_PRIORITY,
    endingStyle: draft.endingStyle ?? DEFAULT_ENDING_STYLE,
    audienceContext: draft.audienceContext,
    offerContext: draft.offerContext,
    clarityFirstMode: !!draft.clarityFirstMode,
  };
}
