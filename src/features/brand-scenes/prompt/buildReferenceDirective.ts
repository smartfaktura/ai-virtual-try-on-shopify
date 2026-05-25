export type ReferenceIntent =
  | "replicate"
  | "location"
  | "composition"
  | "vibe";

/**
 * Returns the additive prefix that tells the generator how to treat the
 * uploaded reference image. Empty string when no reference is present.
 *
 * The returned block is emitted in the REFERENCE section, which is placed
 * at the very top of the assembled prompt (right after ROLE) so the model
 * treats it as the dominant constraint rather than a trailing afterthought.
 */
export function buildReferenceDirective(
  intent: ReferenceIntent | undefined,
): string {
  switch (intent) {
    case "replicate":
      return [
        "REFERENCE IMAGE — REPLICATE EXACTLY (highest priority).",
        "Do not alter subject, pose, framing, lighting, or environment from the attached reference.",
        "Insert the product as a faithful in-place addition that matches the scene's existing lighting, perspective, and color temperature.",
      ].join(" ");
    case "location":
      return [
        "REFERENCE IMAGE — LOCATION LOCK (highest priority).",
        "The attached reference IS the environment. Use it as the literal backdrop:",
        "preserve the architecture, geometry, perspective, surfaces, color palette,",
        "and the direction and quality of light exactly as in the reference.",
        "Place the cast and product physically INSIDE this exact location — standing",
        "on the same floor, lit by the same lights, with the same walls, structures,",
        "and depth visible around and behind them.",
        "Match the reference's wide framing so the environment reads clearly;",
        "do NOT crop into a tight headshot or paste the subject onto a generic background.",
        "The product and people are the only elements that change —",
        "everything else (room, lighting, color, depth) comes from the reference image.",
      ].join(" ");
    case "composition":
      return [
        "REFERENCE IMAGE — COMPOSITION LOCK (highest priority).",
        "Keep the reference framing, camera angle, focal length, and lighting exactly.",
        "Swap the subject per the directives below; the layout and light stay identical.",
      ].join(" ");
    case "vibe":
      return [
        "REFERENCE IMAGE — VIBE / MOOD BOARD (high priority).",
        "Loose inspiration only: match the overall mood, color temperature, and finish.",
        "Generate the subject, scene, and framing fresh per the directives below.",
      ].join(" ");
    default:
      return "";
  }
}
