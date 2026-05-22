export type ReferenceIntent =
  | "replicate"
  | "location"
  | "composition"
  | "vibe";

/**
 * Returns the additive prefix that tells the generator how to treat the
 * uploaded reference image. Empty string when no reference is present.
 */
export function buildReferenceDirective(
  intent: ReferenceIntent | undefined,
): string {
  switch (intent) {
    case "replicate":
      return "REFERENCE: Do not alter subject, pose, framing, or environment. Insert the product as a faithful in-place addition matching the scene's existing lighting.";
    case "location":
      return "REFERENCE: Keep the reference location and environment. Replace the cast and product per the directives below.";
    case "composition":
      return "REFERENCE: Keep the reference framing, camera angle, and lighting. Swap the subject per the directives below.";
    case "vibe":
      return "REFERENCE: Loose inspiration only — match mood and color temperature, generate everything else fresh.";
    default:
      return "";
  }
}
