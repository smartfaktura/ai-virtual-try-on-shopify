/**
 * Post-processor that rewrites a compiled brand-scene directive so the
 * STORED prompt_template carries the dynamic [PRODUCT IMAGE] and (when the
 * scene has people) [MODEL IMAGE] tokens that downstream `generate-workflow`
 * already knows how to substitute.
 *
 * The live preview generation in Step 6 keeps using the un-tokenised
 * directive because it feeds a literal reference image inline. Only the
 * value persisted via `save-brand-scene` goes through this helper.
 */
export function injectReferenceTokens(
  directive: string,
  opts: { hasPeople: boolean },
): string {
  if (!directive.trim()) return directive;
  const { hasPeople } = opts;

  // 1) Prepend a small reference-tokens preamble so downstream pipelines and
  //    Gemini both understand the placeholder semantics. Idempotent.
  const preambleLines: string[] = ["REFERENCE TOKENS"];
  preambleLines.push(
    "[PRODUCT IMAGE] is the hero product / garment reference — reproduce its exact silhouette, materials, colors, and proportions. Never substitute, restyle, or hide it.",
  );
  if (hasPeople) {
    preambleLines.push(
      "[MODEL IMAGE] is the cast subject reference — match identity, build, and skin tone. The person wears or holds [PRODUCT IMAGE] as the hero piece.",
    );
  }
  const preamble = preambleLines.join("\n") + "\n";

  let out = directive;

  // 2) Rewrite SUBJECT / PRODUCT FOCUS bodies so the model sees the tokens
  //    inline rather than only in the preamble. Conservative string-level
  //    edits — we never rewrite headers or punctuation.
  out = out.replace(
    /\bHero garment\b/g,
    "Hero garment from [PRODUCT IMAGE]",
  );
  out = out.replace(
    /\bHero piece\b/g,
    "Hero piece from [PRODUCT IMAGE]",
  );
  out = out.replace(
    /\bthe product\b/g,
    "the product from [PRODUCT IMAGE]",
  );

  if (hasPeople) {
    out = out.replace(/\bthe model\b/g, "the person from [MODEL IMAGE]");
    out = out.replace(/\bthe subject\b/g, "the person from [MODEL IMAGE]");
    out = out.replace(/\bthe cast\b/g, "the cast from [MODEL IMAGE]");
  }

  // Avoid double-tagging if the source already had the tokens.
  out = out
    .replace(/\[PRODUCT IMAGE\] from \[PRODUCT IMAGE\]/g, "[PRODUCT IMAGE]")
    .replace(/\[MODEL IMAGE\] from \[MODEL IMAGE\]/g, "[MODEL IMAGE]");

  return `${preamble}\n${out}`;
}
