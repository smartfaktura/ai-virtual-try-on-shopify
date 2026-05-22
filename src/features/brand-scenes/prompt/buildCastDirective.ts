import type {
  CastAction,
  CastAge,
  CastGender,
  CastInteraction,
  CastPreset,
  CastVibe,
} from "../wizard/constants/cast";
import { WARDROBE_COLORS, type WardrobeColor } from "../wizard/constants/scene";

export interface CastInput {
  preset: CastPreset;
  gender?: CastGender[];
  age?: CastAge[];
  vibe?: CastVibe;
  interaction?: CastInteraction;
  action?: CastAction;
  note?: string;
  wardrobe_color?: WardrobeColor;
  wardrobe_custom?: string;
}

const PRESET_PEOPLE: Record<CastPreset, string> = {
  solo: "one person",
  two: "two people",
  group: "a group of three or more people",
  hands: "hands only — no face or body visible",
  none: "no people — product hero shot",
  replicate: "(replicate reference subjects exactly)",
};

const INTERACTION: Record<CastInteraction, string> = {
  wearing: "wearing the product",
  holding: "holding the product",
  using: "actively using the product",
  beside: "placed naturally beside the product",
  hero: "product as the sole hero — no contact required",
};

const ACTION: Record<CastAction, string> = {
  still: "still and composed",
  walking: "walking through frame",
  motion: "captured mid-motion",
  seated: "seated naturally",
  candid: "a candid in-between moment",
};

/**
 * Emits a single directive line describing the scene's subjects and how they
 * relate to the product. Used by both wizard and reference flows; the
 * reference prefix is added separately by `buildReferenceDirective`.
 */
export function buildCastDirective(cast: CastInput): string {
  if (cast.preset === "replicate") {
    return "Cast: do not alter subjects, pose, or framing from the reference.";
  }

  const parts: string[] = [];
  const subjectBits: string[] = [];

  if (cast.preset === "none") {
    parts.push("Cast: no people in frame, product is the hero.");
  } else if (cast.preset === "hands") {
    subjectBits.push(PRESET_PEOPLE.hands);
  } else {
    // person presets
    const descriptors: string[] = [];
    if (cast.age?.length) descriptors.push(cast.age.join("/"));
    if (cast.gender?.length) descriptors.push(cast.gender.join("/"));
    if (cast.vibe) descriptors.push(`${cast.vibe} vibe`);
    const head =
      descriptors.length > 0
        ? `${PRESET_PEOPLE[cast.preset]} (${descriptors.join(", ")})`
        : PRESET_PEOPLE[cast.preset];
    subjectBits.push(head);
  }

  if (subjectBits.length) parts.push(`Cast: ${subjectBits.join(", ")}.`);

  if (cast.interaction && cast.preset !== "none") {
    parts.push(`Interaction: ${INTERACTION[cast.interaction]}.`);
  } else if (cast.interaction === "hero") {
    parts.push(`Interaction: ${INTERACTION.hero}.`);
  }

  if (cast.action) parts.push(`Energy: ${ACTION[cast.action]}.`);

  const wardrobe =
    cast.wardrobe_custom ??
    WARDROBE_COLORS.find((w) => w.value === cast.wardrobe_color)?.directive;
  if (wardrobe) parts.push(`Wardrobe: ${wardrobe}.`);

  if (cast.note?.trim()) parts.push(`Note: ${cast.note.trim()}.`);

  return parts.join(" ");
}
