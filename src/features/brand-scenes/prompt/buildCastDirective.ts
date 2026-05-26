import type {
  CastAction,
  CastAge,
  CastGender,
  CastInteraction,
  CastPreset,
  CastVibe,
} from "../wizard/constants/cast";
import { WARDROBE_COLORS, type WardrobeColor } from "../wizard/constants/scene";
import {
  BODY_PART_FOCUS,
  GAZE_DIRECTIONS,
  GROUP_DYNAMICS,
  HANDS_ON_PRODUCT,
  metaX,
  type BodyPartFocus,
  type GazeDirection,
  type GroupDynamic,
  type HandsOnProduct,
  type Diversity,
} from "../wizard/constants/sceneExtras";

export interface CastInput {
  preset: CastPreset;
  gender?: CastGender[];
  age?: CastAge[];
  vibe?: CastVibe;
  interaction?: CastInteraction;
  action?: CastAction;
  action_note?: string;
  note?: string;
  wardrobe_color?: WardrobeColor;
  wardrobe_custom?: string;
  body_part_focus?: BodyPartFocus;
  gaze?: GazeDirection;
  group_dynamic?: GroupDynamic;
  hands_on_product?: HandsOnProduct;
  diversity?: Diversity;
  model_ref?: { name?: string } | undefined;
  model_refs?: Array<{ name?: string; gender?: string; ageRange?: string }> | undefined;
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
  pouring: "captured mid-pour — liquid streaming from the product",
  plating: "plating or serving the dish onto the surface",
  cutting: "cutting or slicing the dish, knife mid-motion",
  garnishing: "garnishing the dish with fresh herbs or finishing touches",
  dipping: "dipping the product, motion frozen at the edge of the dip",
  steaming: "freshly served, gentle steam rising from the dish",
};

const ACTION: Record<CastAction, string> = {
  standing: "standing upright with weight balanced naturally",
  seated: "seated naturally",
  crossed_legs: "seated with legs crossed",
  leaning: "leaning casually against a surface",
  kneeling: "in a low kneeling or crouched pose",
  walking: "walking through frame",
  motion: "captured mid-motion",
  jumping: "captured mid-jump with both feet off the ground",
  still: "still and composed",
  candid: "a candid in-between moment",
};

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
    const descriptors: string[] = [];
    if (!cast.model_ref) {
      if (cast.age?.length) descriptors.push(cast.age.join("/"));
      if (cast.gender?.length) descriptors.push(cast.gender.join("/"));
    }
    if (cast.vibe) descriptors.push(`${cast.vibe} vibe`);
    // Phase 7n — `cast.diversity` retired. Ethnicity now flows via
    // `cast.extras.ethnicity` and is emitted by assembleSceneDirective.
    const head =
      descriptors.length > 0
        ? `${PRESET_PEOPLE[cast.preset]} (${descriptors.join(", ")})`
        : PRESET_PEOPLE[cast.preset];
    subjectBits.push(head);
  }

  if (subjectBits.length) parts.push(`Cast: ${subjectBits.join(", ")}.`);

  if (cast.model_ref && cast.preset !== "none" && cast.preset !== "hands") {
    parts.push(
      `Featured model: use the person from [MODEL IMAGE] exactly — preserve face, skin tone, hair, build, and proportions across all variations.`,
    );
    const extras = (cast.model_refs ?? []).slice(1);
    if (extras.length > 0) {
      const descs = extras
        .map((m) => {
          const bits = [m?.name].filter(Boolean) as string[];
          const meta = [m?.gender, m?.ageRange].filter(Boolean).join("/");
          return meta ? `${bits.join("")} (${meta})` : bits.join("");
        })
        .filter(Boolean);
      if (descs.length > 0) {
        parts.push(
          `Additional anchor${descs.length > 1 ? "s" : ""}: ${descs.join(", ")} — cast a distinct person matching each description; do not duplicate the primary face.`,
        );
      }
    }
  }


  if (cast.interaction && cast.preset !== "none") {
    parts.push(`Interaction: ${INTERACTION[cast.interaction]}.`);
  } else if (cast.interaction === "hero") {
    parts.push(`Interaction: ${INTERACTION.hero}.`);
  }

  const hands = metaX(HANDS_ON_PRODUCT, cast.hands_on_product);
  if (hands) parts.push(`Hands: ${hands.directive}.`);

  if (cast.action_note?.trim()) {
    parts.push(`Pose: ${cast.action_note.trim()}.`);
  } else if (cast.action) {
    parts.push(`Pose: ${ACTION[cast.action]}.`);
  }

  const bodyPart = metaX(BODY_PART_FOCUS, cast.body_part_focus);
  if (bodyPart) parts.push(`Body-part focus: ${bodyPart.label.toLowerCase()}.`);

  const gaze = metaX(GAZE_DIRECTIONS, cast.gaze);
  if (gaze) parts.push(`Gaze: ${gaze.label.toLowerCase()}.`);

  if (cast.group_dynamic && (cast.preset === "two" || cast.preset === "group")) {
    const gd = metaX(GROUP_DYNAMICS, cast.group_dynamic)!;
    parts.push(`Group dynamic: ${gd.label.toLowerCase()}.`);
  }

  const wardrobe =
    cast.wardrobe_custom ??
    WARDROBE_COLORS.find((w) => w.value === cast.wardrobe_color)?.directive;
  if (wardrobe) parts.push(`Wardrobe: ${wardrobe}.`);

  if (cast.note?.trim()) parts.push(`Note: ${cast.note.trim()}.`);

  return parts.join(" ");
}
