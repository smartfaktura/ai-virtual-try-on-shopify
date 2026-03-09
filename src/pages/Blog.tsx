import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { blogPosts } from '@/data/blogPosts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, ArrowRight, Sparkles } from 'lucide-react';

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(blogPosts.map((p) => p.category)));
    return cats;
  }, []);

  const filtered = activeCategory
    ? blogPosts.filter((p) => p.category === activeCategory)
    : blogPosts;

  const [featured, ...rest] = filtered;

  const blogListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'VOVV AI Blog',
    description: 'Insights on AI product photography, visual content strategy, and e-commerce growth.',
    url: 'https://vovvai.lovable.app/blog',
    publisher: {
      '@type': 'Organization',
      name: 'VOVV AI',
      url: 'https://vovvai.lovable.app',
    },
    blogPost: blogPosts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      datePublished: p.publishDate,
      author: { '@type': 'Organization', name: p.author },
      url: `https://vovvai.lovable.app/blog/${p.slug}`,
    })),
  };

  return (
    <PageLayout>
      <SEOHead
        title="VOVV AI Blog — AI Photography, E-commerce Tips & Visual Strategy"
        description="Insights on AI product photography, visual content strategy, and e-commerce growth from the VOVV AI team."
        canonical="https://vovvai.lovable.app/blog"
      />
      <JsonLd data={blogListJsonLd} />

      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Insights on AI product photography, visual content strategy, and e-commerce growth.
            </p>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
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
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured post */}
          {featured && (
            <Link to={`/blog/${featured.slug}`} className="block group mb-10">
              <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/[0.06] via-accent/30 to-card border border-border p-8 sm:p-10 hover:shadow-lg transition-all">
                <div className="absolute top-4 right-4">
                  <Badge className="rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20">
                    Featured
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {featured.category}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="w-3 h-3" />
                    {new Date(featured.publishDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {featured.readTime}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground group-hover:text-primary transition-colors mb-3 leading-tight">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-2xl">
                  {featured.excerpt}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </article>
            </Link>
          )}

          {/* Post grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            {rest.map((post, i) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="block group"
              >
                <article className="relative h-full border border-border rounded-2xl p-6 sm:p-7 bg-card hover:shadow-md hover:border-primary/20 transition-all overflow-hidden">
                  {/* Accent strip */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors rounded-l-2xl" />
                  <div className="pl-3">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {post.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-snug">
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

          {/* Mid-page CTA */}
          <div className="mt-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary-foreground)/0.06),transparent_50%)]" />
            <div className="relative">
              <Sparkles className="w-6 h-6 text-primary-foreground/60 mx-auto mb-3" />
              <h3 className="text-xl sm:text-2xl font-bold text-primary-foreground mb-2">
                See AI photography in action
              </h3>
              <p className="text-primary-foreground/70 text-sm mb-5 max-w-md mx-auto">
                20 free credits, no credit card. Generate your first product image in under 60 seconds.
              </p>
              <Button asChild size="lg" variant="secondary" className="rounded-full px-8 font-semibold">
                <Link to="/auth">Start Free →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
