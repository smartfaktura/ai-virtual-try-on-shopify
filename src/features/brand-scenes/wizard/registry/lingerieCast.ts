/**
 * Lingerie-specific cast chip libraries.
 *
 * These do not extend the global CAST_ACTIONS enum — instead they feed:
 *   - Pose suggestions: written into `cast.action_note` (free-text slot)
 *   - Camera angle / Framing / Mood: written into `cast.extras` as key/value
 *     pairs which the prompt assembler emits as cast-detail lines.
 *
 * Only surfaced when (module, sub_family) === ("fashion", "lingerie").
 */

export const LINGERIE_POSE_SUGGESTIONS: readonly string[] = [
  "Standing portrait, weight on one hip",
  "Hand on hip, shoulders back",
  "Seated on the edge of the bed",
  "Lying on linen, side profile",
  "Lying on back, head tilted to camera",
  "Kneeling on the bed, hands on thighs",
  "Stretching at the window, arms overhead",
  "Slip-strap adjust, glance down",
  "Looking over shoulder, back to camera",
  "Back-to-camera contrapposto",
  "Hands in hair, eyes closed",
  "Sitting cross-legged, leaning back on hands",
];

export const LINGERIE_CAMERA_ANGLES: ReadonlyArray<{
  value: string;
  label: string;
  directive: string;
}> = [
  { value: "eye_level", label: "Eye-level portrait", directive: "eye-level portrait, camera at subject's eyes" },
  { value: "slight_high", label: "Slight high", directive: "slight high angle, ~15° above eye-line" },
  { value: "low_three_quarter", label: "Low 3/4 hero", directive: "low 3/4 hero angle looking up at the figure" },
  { value: "profile", label: "Profile silhouette", directive: "pure side profile, silhouette-clean" },
  { value: "over_shoulder", label: "Over-shoulder", directive: "over-shoulder angle revealing back line" },
  { value: "floor_up", label: "Floor-up vertical", directive: "low floor-up vertical, elongated figure" },
  { value: "tight_bust", label: "Tight bust crop", directive: "tight crop on bust and collarbones" },
  { value: "full_wide", label: "Full-body wide", directive: "wide full-body framing with breathing room" },
];

export const LINGERIE_FRAMINGS: ReadonlyArray<{
  value: string;
  label: string;
  directive: string;
}> = [
  { value: "full_body", label: "Full body", directive: "full-body framing, feet visible" },
  { value: "three_quarter", label: "3/4 body", directive: "3/4 body crop, mid-thigh up" },
  { value: "bust_crop", label: "Bust crop", directive: "bust crop, collarbones to upper rib" },
  { value: "hip_to_knee", label: "Hip to knee", directive: "hip-to-knee crop emphasising briefs / hipline" },
  { value: "detail", label: "Detail (strap/lace)", directive: "macro detail of strap, lace or fabric texture" },
  { value: "silhouette", label: "Silhouette only", directive: "backlit silhouette, form-led" },
];

export const LINGERIE_MOODS: ReadonlyArray<{
  value: string;
  label: string;
  directive: string;
}> = [
  { value: "soft_romantic", label: "Soft romantic", directive: "soft romantic mood, warm diffused light" },
  { value: "editorial_cool", label: "Editorial cool", directive: "editorial cool mood, controlled and graphic" },
  { value: "slow_morning", label: "Slow morning", directive: "slow morning mood, unhurried daylight" },
  { value: "boudoir_cinematic", label: "Boudoir cinematic", directive: "boudoir cinematic mood, deep shadow and gold" },
  { value: "quiet_luxury", label: "Quiet luxury", directive: "quiet-luxury mood, restrained palette, refined" },
  { value: "confident_modern", label: "Confident modern", directive: "confident modern mood, clean and assured" },
];

export function isLingerie(
  module: string | undefined,
  subFamily: string | undefined,
): boolean {
  return module === "fashion" && subFamily === "lingerie";
}
