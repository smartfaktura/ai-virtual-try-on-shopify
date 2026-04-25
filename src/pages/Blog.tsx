import { useState, useMemo, Component, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
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
      } overflow-hidden bg-gradient-to-br from-primary/15 via-accent/40 to-card flex items-center justify-center`}
    >
      <Sparkles className="w-10 h-10 text-primary/30" aria-hidden />
      {category && (
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="rounded-full text-[10px]">
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

      <section className="py-12 sm:py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
              Blog
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Insights on AI product photography, visual content strategy, and e-commerce growth.
            </p>
          </div>

          {/* Category filters — only render when there's data to filter */}
          {hasAnyPosts && (
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0 mb-8 sm:mb-12 overflow-x-auto sm:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex sm:flex-wrap sm:justify-center gap-2 w-max sm:w-auto">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    !activeCategory
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      activeCategory === cat
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No posts at all */}
          {!hasAnyPosts && (
            <BlogEmptyState
              title="New stories are on the way"
              description="We're working on fresh insights about AI product photography and visual content. Check back soon — or try VOVV.AI in the meantime."
              primaryAction={{ label: 'Try VOVV.AI free', to: '/auth' }}
              secondaryAction={{ label: 'Back to home', to: '/' }}
            />
          )}

          {/* Filter returns nothing */}
          {hasAnyPosts && !hasFiltered && (
            <BlogEmptyState
              title={`No posts in ${activeCategory} yet`}
              description="We haven't published in this category yet. Browse all articles or check back soon for new stories."
              primaryAction={{ label: 'Show all posts', onClick: () => setActiveCategory(null) }}
            />
          )}

          {/* Featured + grid (wrapped so render errors don't crash the page) */}
          {hasFiltered && (
            <BlogSectionBoundary>
              {/* Featured post */}
              {featured && (
                <Link to={`/blog/${featured.slug}`} className="block group mb-8 sm:mb-10">
                  <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/[0.06] via-accent/30 to-card border border-border hover:shadow-lg transition-all">
                    {/* Featured cover image with overlay badge */}
                    <div className="relative">
                      {featured.coverImage ? (
                        <div className="relative w-full aspect-[16/10] sm:aspect-[2.2/1] overflow-hidden">
                          <ShimmerImage
                            src={featured.coverImage}
                            alt={featured.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            aspectRatio="16/10"
                          />
                        </div>
                      ) : (
                        <CoverFallback category={featured.category} aspect="featured" />
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className="rounded-full text-[10px] bg-background/90 backdrop-blur text-primary border border-primary/20">
                          Featured
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5 sm:p-8 lg:p-10">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {featured.category}
                        </Badge>
                        {formatDate(featured.publishDate) && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="w-3 h-3" />
                            {formatDate(featured.publishDate)}
                          </span>
                        )}
                        {featured.readTime && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {featured.readTime}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-colors mb-3 leading-tight">
                        {featured.title}
                      </h2>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-2xl line-clamp-3">
                        {featured.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
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
                      <article className="relative h-full border border-border rounded-2xl bg-card hover:shadow-md hover:border-primary/20 transition-all overflow-hidden">
                        {post.coverImage ? (
                          <div className="w-full aspect-[16/9] overflow-hidden">
                            <ShimmerImage
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                              aspectRatio="16/9"
                            />
                          </div>
                        ) : (
                          <CoverFallback category={post.category} aspect="card" />
                        )}
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                            <Badge variant="secondary" className="rounded-full text-xs">
                              {post.category}
                            </Badge>
                            {post.readTime && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {post.readTime}
                              </span>
                            )}
                          </div>
                          <h2 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-snug">
                            {post.title}
                          </h2>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
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

          {/* Mid-page CTA — always visible */}
          <div className="mt-10 sm:mt-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 sm:p-8 lg:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary-foreground)/0.06),transparent_50%)]" />
            <div className="relative">
              <Sparkles className="w-6 h-6 text-primary-foreground/60 mx-auto mb-3" />
              <h3 className="text-xl sm:text-2xl font-bold text-primary-foreground mb-2 px-2">
                See AI photography in action
              </h3>
              <p className="text-primary-foreground/70 text-sm mb-5 max-w-md mx-auto px-2">
                20 free credits, no credit card. Generate your first product image in under 60 seconds.
              </p>
              <Button asChild size="lg" variant="secondary" className="rounded-full px-8 font-semibold w-full sm:w-auto">
                <Link to="/auth">Start Free →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
