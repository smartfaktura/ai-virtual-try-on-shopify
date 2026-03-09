import { useParams, Link, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { getBlogPostBySlug, getRelatedPosts } from '@/data/blogPosts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('blog-article');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!post) return <Navigate to="/blog" replace />;

  const related = getRelatedPosts(post.slug, 3);
  const defaultImage = 'https://vovvai.lovable.app/favicon.png';

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    image: defaultImage,
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'VOVV AI',
      url: 'https://vovvai.lovable.app',
      logo: { '@type': 'ImageObject', url: defaultImage },
    },
    mainEntityOfPage: `https://vovvai.lovable.app/blog/${post.slug}`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://vovvai.lovable.app' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://vovvai.lovable.app/blog' },
      { '@type': 'ListItem', position: 3, name: post.title },
    ],
  };

  return (
    <PageLayout>
      <SEOHead
        title={`${post.title} | VOVV AI Blog`}
        description={post.metaDescription}
        canonical={`https://vovvai.lovable.app/blog/${post.slug}`}
        ogType="article"
      />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article id="blog-article">
        {/* Hero header */}
        <div className="relative bg-gradient-to-br from-primary/[0.06] via-accent/30 to-background border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-12 sm:pb-16">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <span className="text-border">/</span>
              <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <span className="text-border">/</span>
              <span className="text-foreground/70 truncate max-w-[200px]">{post.title}</span>
            </nav>

            <Badge variant="secondary" className="rounded-full text-xs mb-5 bg-primary/10 text-primary border-primary/20">
              {post.category}
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground tracking-tight mb-6 leading-[1.15]">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {/* Author chip */}
              <span className="inline-flex items-center gap-2 bg-card border border-border rounded-full pl-1 pr-3 py-1">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </span>
                <span className="font-medium text-foreground text-xs">{post.author}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                {new Date(post.publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="blog-content prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-li:leading-relaxed prose-table:text-sm">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Topics</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full text-xs bg-muted/50 hover:bg-muted transition-colors">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-14 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-10 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary-foreground)/0.08),transparent_60%)]" />
            <div className="relative">
              <h3 className="text-xl sm:text-2xl font-bold text-primary-foreground mb-2">
                Ready to try AI product photography?
              </h3>
              <p className="text-primary-foreground/70 text-sm mb-6 max-w-md mx-auto">
                Get 20 free credits — no credit card required. See the difference in seconds.
              </p>
              <Button asChild size="lg" variant="secondary" className="rounded-full px-8 font-semibold">
                <Link to="/auth">Start Free →</Link>
              </Button>
            </div>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-16">
              <h3 className="text-lg font-semibold text-foreground mb-6">More from the blog</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/blog/${r.slug}`}
                    className="group border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all bg-card"
                  >
                    <Badge variant="secondary" className="rounded-full text-[10px] mb-3 bg-muted">
                      {r.category}
                    </Badge>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                      {r.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.readTime}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back */}
          <div className="mt-10">
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> All articles
            </Link>
          </div>
        </div>
      </article>
    </PageLayout>
  );
}
