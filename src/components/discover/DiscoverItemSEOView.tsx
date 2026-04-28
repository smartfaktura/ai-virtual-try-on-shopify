import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { Button } from '@/components/ui/button';
import { SITE_URL } from '@/lib/constants';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { DiscoverBreadcrumbs } from './DiscoverBreadcrumbs';
import { DiscoverCard, type DiscoverItem } from '@/components/app/DiscoverCard';
import { FAMILY_ID_TO_NAME } from '@/lib/discoverTaxonomy';
import { getItemUrlPath } from '@/lib/slugUtils';
import type { DiscoverPreset } from '@/hooks/useDiscoverPresets';

interface DiscoverItemSEOViewProps {
  preset: DiscoverPreset;
  relatedItems: DiscoverItem[];
  isAuthenticated: boolean;
  onRelatedClick?: (item: DiscoverItem) => void;
}

/** Trim a string at a word boundary so it never exceeds maxLen. */
function truncateAtWord(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  const cut = s.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

/** Convert slug-like strings ("beauty-skincare") into "Beauty Skincare". */
function humanize(s: string): string {
  return s
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}

function buildMetaDescription(preset: DiscoverPreset): string {
  const familyLabel = FAMILY_ID_TO_NAME[preset.category] || preset.category;
  const tmpl =
    `${preset.title} — AI-generated ${familyLabel} product visual created with VOVV.AI. ` +
    `Explore the visual style, prompt, tags, and related product photography examples.`;
  return truncateAtWord(tmpl, 158);
}

function buildPageTitle(preset: DiscoverPreset): string {
  const familyLabel = FAMILY_ID_TO_NAME[preset.category] || preset.category;
  return `${preset.title} — AI ${familyLabel} Visual | VOVV.AI`;
}

const PROMPT_CLAMP = 280;

export function DiscoverItemSEOView({
  preset,
  relatedItems,
  isAuthenticated,
  onRelatedClick,
}: DiscoverItemSEOViewProps) {
  const familyLabel = FAMILY_ID_TO_NAME[preset.category] || preset.category;
  const slug = preset.slug || preset.id;
  const canonicalUrl = `${SITE_URL}/discover/${slug}`;
  const ctaHref = isAuthenticated
    ? `/app/discover/${slug}`
    : `/auth?redirect=${encodeURIComponent(`/app/discover/${slug}`)}`;

  const [promptExpanded, setPromptExpanded] = useState(false);

  // Build chip metadata (only render entries with values). Quality removed per UX direction.
  const chips: Array<{ label: string; value: string }> = [
    { label: 'Category', value: familyLabel },
    ...(preset.subcategory
      ? [{ label: 'Sub-type', value: humanize(preset.subcategory) }]
      : []),
    ...(preset.scene_name ? [{ label: 'Scene', value: preset.scene_name }] : []),
    ...(preset.model_name ? [{ label: 'Model', value: preset.model_name }] : []),
    ...(preset.workflow_name ? [{ label: 'Workflow', value: preset.workflow_name }] : []),
    { label: 'Aspect ratio', value: preset.aspect_ratio },
  ];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Discover', href: '/discover' },
    { label: familyLabel, href: `/discover?category=${preset.category}` },
    { label: preset.title },
  ];

  // JSON-LD payloads
  const imageObjectLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: preset.title,
    description: preset.prompt?.slice(0, 500) || preset.title,
    contentUrl: preset.image_url,
    thumbnailUrl: preset.image_url,
    url: canonicalUrl,
    creator: {
      '@type': 'Organization',
      name: 'VOVV.AI',
      url: SITE_URL,
    },
    creditText: 'Generated with VOVV.AI',
    datePublished: preset.created_at,
    license: `${SITE_URL}/terms`,
    representativeOfPage: true,
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((b, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: b.label,
      ...(b.href ? { item: `${SITE_URL}${b.href}` } : {}),
    })),
  };

  const heroImage = getOptimizedUrl(preset.image_url, { quality: 90 });
  const promptText = preset.prompt ?? '';
  const isPromptLong = promptText.length > PROMPT_CLAMP;
  const visiblePrompt =
    !isPromptLong || promptExpanded
      ? promptText
      : truncateAtWord(promptText, PROMPT_CLAMP);

  return (
    <>
      <SEOHead
        title={buildPageTitle(preset)}
        description={buildMetaDescription(preset)}
        canonical={canonicalUrl}
        ogImage={preset.image_url}
        ogType="article"
      />
      <JsonLd data={imageObjectLd} />
      <JsonLd data={breadcrumbLd} />

      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Breadcrumbs */}
        <DiscoverBreadcrumbs items={breadcrumbs} />

        {/* H1 + intro */}
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {familyLabel}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            {preset.title}
          </h1>
        </header>

        {/* Hero image — fits the viewport like Pexels; info appears on scroll */}
        <figure className="rounded-2xl overflow-hidden bg-muted/30 flex items-center justify-center max-h-[calc(100vh-12rem)]">
          <img
            src={heroImage}
            alt={`${preset.title} — AI ${familyLabel} visual generated with VOVV.AI`}
            loading="eager"
            decoding="async"
            className="w-auto h-auto max-w-full max-h-[calc(100vh-12rem)] object-contain block"
          />
        </figure>

        {/* Metadata chips */}
        <section aria-labelledby="visual-details" className="space-y-3">
          <h2 id="visual-details" className="sr-only">Visual details</h2>
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-foreground/80"
              >
                <span className="text-muted-foreground">{c.label}:</span>
                <span className="font-medium">{c.value}</span>
              </span>
            ))}
          </div>
        </section>

        {/* Prompt (truncated with Show more) */}
        {promptText && (
          <section aria-labelledby="visual-prompt" className="space-y-3">
            <h2
              id="visual-prompt"
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              Prompt
            </h2>
            <div className="rounded-lg bg-muted/40 border border-border/40 p-4 sm:p-5 text-sm font-mono leading-relaxed whitespace-pre-wrap text-foreground/85">
              {visiblePrompt}
            </div>
            {isPromptLong && (
              <button
                type="button"
                onClick={() => setPromptExpanded((v) => !v)}
                className="text-xs font-medium text-foreground/70 hover:text-foreground underline underline-offset-4"
              >
                {promptExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </section>
        )}

        {/* Tags */}
        {preset.tags && preset.tags.length > 0 && (
          <section aria-labelledby="visual-tags" className="space-y-3">
            <h2
              id="visual-tags"
              className="text-sm font-medium tracking-tight text-foreground"
            >
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {preset.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/discover?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center rounded-full bg-muted/60 px-3 py-1 text-xs text-foreground/80 hover:bg-muted transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA — branded button matching public discover modal */}
        <section className="space-y-3 text-center">
          <div className="max-w-md mx-auto">
            <Button
              asChild
              className="w-full h-[3.25rem] rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
            >
              <Link to={ctaHref}>
                {isAuthenticated ? (
                  'Open in Visual Studio'
                ) : (
                  <>
                    <span className="sm:hidden">Try this for free</span>
                    <span className="hidden sm:inline">Create account to recreate this</span>
                  </>
                )}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          <p className="text-[13px] text-muted-foreground/75 leading-relaxed max-w-md mx-auto">
            {isAuthenticated
              ? 'Open this style in Visual Studio and apply it to your own product photos'
              : 'Sign up to access prompts, scenes and generate AI fashion photography'}
          </p>
        </section>

        {/* Related visuals */}
        {relatedItems.length > 0 && (
          <section aria-labelledby="related-visuals" className="space-y-4">
            <div className="flex items-end justify-between">
              <h2
                id="related-visuals"
                className="text-xl font-semibold tracking-tight text-foreground"
              >
                Related visuals
              </h2>
              <Link
                to={`/discover?category=${preset.category}`}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                Explore more {familyLabel.toLowerCase()}
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {relatedItems.slice(0, 8).map((item) => {
                const relatedPath = getItemUrlPath(item);
                return (
                  <Link
                    key={item.type === 'preset' ? `p-${item.data.id}` : `s-${item.data.poseId}`}
                    to={relatedPath}
                    onClick={(e) => {
                      if (onRelatedClick) {
                        e.preventDefault();
                        onRelatedClick(item);
                      }
                    }}
                    className="block"
                  >
                    <DiscoverCard
                      item={item}
                      onClick={() => onRelatedClick?.(item)}
                      hideLabels
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
