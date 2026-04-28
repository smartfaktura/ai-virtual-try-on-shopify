import { useState, useMemo, Component, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbJsonLd } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/constants';
import { blogPosts } from '@/data/blogPosts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { CalendarDays, Clock, ArrowRight, Sparkles, Newspaper, AlertCircle } from 'lucide-react';

// Safe date formatter — returns null for invalid dates so we can hide the row
function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Branded gradient fallback when a post is missing a cover image
function CoverFallback({ category, aspect }: { category?: string; aspect: 'featured' | 'card' }) {
  return (
    <div
      className={`relative w-full ${
        aspect === 'featured' ? 'aspect-[16/10] sm:aspect-[2.2/1]' : 'aspect-[16/9]'
      } overflow-hidden bg-[#f5f4f1] flex items-center justify-center`}
    >
      <Sparkles className="w-10 h-10 text-foreground/20" aria-hidden />
      {category && (
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="rounded-full text-[10px] bg-white border border-[#f0efed]">
            {category}
          </Badge>
        </div>
      )}
    </div>
  );
}

// Friendly empty / no-results card
function BlogEmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  icon: Icon = Newspaper,
}: {
  title: string;
  description: string;
  primaryAction?: { label: string; onClick?: () => void; to?: string };
  secondaryAction?: { label: string; to: string };
  icon?: typeof Newspaper;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 py-16 sm:py-20 px-6 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-primary" aria-hidden />
      </div>
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">{description}</p>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
          {primaryAction &&
            (primaryAction.to ? (
              <Button asChild className="rounded-full w-full sm:w-auto">
                <Link to={primaryAction.to}>{primaryAction.label}</Link>
              </Button>
            ) : (
              <Button onClick={primaryAction.onClick} className="rounded-full w-full sm:w-auto">
                {primaryAction.label}
              </Button>
            ))}
          {secondaryAction && (
            <Button asChild variant="outline" className="rounded-full w-full sm:w-auto">
              <Link to={secondaryAction.to}>{secondaryAction.label}</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Local error boundary so a bad post doesn't crash the whole page
class BlogSectionBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error('Blog section error:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <BlogEmptyState
          icon={AlertCircle}
          title="We couldn't display these articles"
          description="Something went wrong loading this section. Try reloading the page — the rest of the blog still works."
          primaryAction={{ label: 'Reload page', onClick: () => window.location.reload() }}
        />
      );
    }
    return this.props.children;
  }
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(blogPosts.map((p) => p.category)));
    return cats;
  }, []);

  const sorted = useMemo(
    () => [...blogPosts].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()),
    []
  );

  const filtered = activeCategory
    ? sorted.filter((p) => p.category === activeCategory)
    : sorted;

  const [featured, ...rest] = filtered;
  const hasAnyPosts = sorted.length > 0;
  const hasFiltered = filtered.length > 0;

  const blogListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'VOVV.AI Blog',
    description: 'Insights on AI product photography, visual content strategy, and e-commerce growth.',
    url: `${SITE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'VOVV.AI',
      url: SITE_URL,
    },
    blogPost: sorted.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      datePublished: p.publishDate,
      author: { '@type': 'Organization', name: p.author },
      url: `${SITE_URL}/blog/${p.slug}`,
    })),
  };

  return (
    <PageLayout>
      <SEOHead
        title="VOVV.AI Blog — AI Photography, E-commerce Tips & Visual Strategy"
        description="Insights on AI product photography, visual content strategy, and e-commerce growth from the VOVV.AI team."
        canonical={`${SITE_URL}/blog`}
      />
      <JsonLd data={blogListJsonLd} />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Blog', path: '/blog' }])} />

      <section className="bg-[#FAFAF8] pt-20 sm:pt-32 pb-16 sm:pb-24 overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60 mb-4">
              Journal
            </p>
            <h1 className="text-[2rem] sm:text-5xl lg:text-[3.5rem] font-semibold text-foreground tracking-[-0.025em] mb-4 sm:mb-5 leading-[1.1] px-2">
              Notes on AI photography
            </h1>
            <p className="text-[15px] sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              Insights on AI product photography, visual content strategy, and e-commerce growth.
            </p>
          </div>

          {/* Category filters — wrap on mobile, no horizontal scroll */}
          {hasAnyPosts && (
            <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-12">
              <button
                onClick={() => setActiveCategory(null)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-medium transition-colors border ${
                  !activeCategory
                    ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                    : 'bg-white text-foreground/70 border-[#f0efed] hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-medium transition-colors border ${
                    activeCategory === cat
                      ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                      : 'bg-white text-foreground/70 border-[#f0efed] hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {!hasAnyPosts && (
            <BlogEmptyState
              title="New stories are on the way"
              description="We're working on fresh insights about AI product photography and visual content. Check back soon — or try VOVV.AI in the meantime."
              primaryAction={{ label: 'Back to home', to: '/' }}
              secondaryAction={{ label: 'Try VOVV.AI free', to: '/auth' }}
            />
          )}

          {hasAnyPosts && !hasFiltered && (
            <BlogEmptyState
              title={`No posts in ${activeCategory} yet`}
              description="We haven't published in this category yet. Browse all articles or check back soon for new stories."
              primaryAction={{ label: 'Show all posts', onClick: () => setActiveCategory(null) }}
            />
          )}

          {hasFiltered && (
            <BlogSectionBoundary>
              {/* Featured post */}
              {featured && (
                <Link to={`/blog/${featured.slug}`} className="block group mb-8 sm:mb-12">
                  <article className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-[#f0efed] shadow-sm hover:shadow-md transition-all">
                    <div className="relative">
                      {featured.coverImage ? (
                        <div className="relative w-full aspect-[16/10] sm:aspect-[2.2/1] overflow-hidden">
                          <ShimmerImage
                            src={featured.coverImage}
                            alt={featured.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <CoverFallback category={featured.category} aspect="featured" />
                      )}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                        <Badge className="rounded-full text-[10px] bg-white/95 backdrop-blur text-foreground border border-[#f0efed] shadow-sm">
                          Featured
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5 sm:p-10 lg:p-12">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:gap-x-4 sm:gap-y-2 mb-3 sm:mb-4 text-[11px] sm:text-[12px]">
                        <span className="font-semibold uppercase tracking-[0.18em] sm:tracking-[0.2em] text-foreground/60">
                          {featured.category}
                        </span>
                        {formatDate(featured.publishDate) && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <CalendarDays className="w-3 h-3" />
                            {formatDate(featured.publishDate)}
                          </span>
                        )}
                        {featured.readTime && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {featured.readTime}
                          </span>
                        )}
                      </div>
                      <h2 className="text-[1.375rem] sm:text-3xl lg:text-[2.25rem] font-semibold text-foreground tracking-[-0.02em] mb-3 sm:mb-4 leading-[1.2]">
                        {featured.title}
                      </h2>
                      <p className="text-muted-foreground text-[14px] sm:text-base leading-relaxed mb-5 sm:mb-6 max-w-2xl line-clamp-3">
                        {featured.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </article>
                </Link>
              )}

              {/* Post grid */}
              {rest.length > 0 && (
                <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
                  {rest.map((post) => (
                    <Link key={post.slug} to={`/blog/${post.slug}`} className="block group">
                      <article className="relative h-full border border-[#f0efed] rounded-2xl bg-white hover:shadow-md transition-all overflow-hidden">
                        {post.coverImage ? (
                          <div className="w-full aspect-[16/9] overflow-hidden">
                            <ShimmerImage
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <CoverFallback category={post.category} aspect="card" />
                        )}
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2.5 sm:mb-3 text-[11px]">
                            <span className="font-semibold uppercase tracking-[0.18em] text-foreground/60">
                              {post.category}
                            </span>
                            {post.readTime && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {post.readTime}
                              </span>
                            )}
                          </div>
                          <h2 className="text-[1.0625rem] sm:text-xl font-semibold text-foreground tracking-[-0.01em] mb-2 leading-snug">
                            {post.title}
                          </h2>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                            Read article <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </BlogSectionBoundary>
          )}

          {/* Dark CTA — site standard */}
          <div className="mt-12 sm:mt-20 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#1a1a2e] p-7 sm:p-14 text-center">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/[0.04] rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/[0.03] rounded-full blur-3xl" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-3 sm:mb-4">
                Get started
              </p>
              <h3 className="text-[1.5rem] sm:text-[2rem] font-semibold text-white tracking-[-0.02em] mb-3 leading-[1.2]">
                See AI photography in action
              </h3>
              <p className="text-white/60 text-[14px] sm:text-base mb-7 sm:mb-8 max-w-md mx-auto">
                20 free credits, no credit card. Generate your first product image in under 60 seconds.
              </p>
              <Button asChild size="lg" className="rounded-full px-8 font-semibold bg-white text-[#1a1a2e] hover:bg-white/90 w-full sm:w-auto shadow-lg">
                <Link to="/auth">Start free →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
