import { useParams, Link, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState, useMemo } from 'react';
import { PageLayout } from '@/components/landing/PageLayout';
import { BlogMarkdownImage } from '@/components/app/BlogMarkdownImage';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL } from '@/lib/constants';
import { getBlogPostBySlug, getRelatedPosts } from '@/data/blogPosts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, ArrowLeft, Sparkles, Quote, Lightbulb, BookOpen } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { Components } from 'react-markdown';

function extractHeadings(markdown: string): { id: string; text: string }[] {
  const lines = markdown.split('\n');
  const headings: { id: string; text: string }[] = [];
  lines.forEach((line) => {
    const match = line.match(/^## (.+)/);
    if (match) {
      const text = match[1].replace(/[*_`]/g, '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      headings.push({ id, text });
    }
  });
  return headings;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;
  const [progress, setProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState('');

  const headings = useMemo(() => (post ? extractHeadings(post.content) : []), [post]);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('blog-article');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)));

      // Track active heading
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = document.getElementById(headings[i].id);
        if (heading && heading.getBoundingClientRect().top <= 120) {
          setActiveHeading(headings[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (!post) return <Navigate to="/blog" replace />;

  const related = getRelatedPosts(post.slug, 3);
  const defaultImage = `${SITE_URL}/favicon.png`;

  let h2Counter = 0;

  const markdownComponents: Components = {
    h2: ({ children }) => {
      h2Counter++;
      const text = String(children).replace(/[*_`]/g, '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const num = String(h2Counter).padStart(2, '0');
      return (
        <h2 id={id} className="blog-h2-numbered group">
          <span className="blog-h2-number">{num}</span>
          <span>{children}</span>
        </h2>
      );
    },
    h3: ({ children }) => (
      <h3 className="blog-h3-pill">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="blog-blockquote">
        <Quote className="blog-blockquote-icon" />
        <div>{children}</div>
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="blog-table-wrapper">
        <table>{children}</table>
      </div>
    ),
    p: ({ children }) => {
      // Unwrap image-only paragraphs to avoid <div> inside <p>
      const childArray = Array.isArray(children) ? children : [children];
      const hasImage = childArray.some(
        (child: any) => child?.type === 'img' || child?.props?.node?.tagName === 'img'
      );
      if (hasImage) {
        return <div className="my-6">{children}</div>;
      }

      // Key takeaway detection
      if (typeof children === 'object' && Array.isArray(children)) {
        const first = children[0];
        if (first && typeof first === 'object' && 'props' in first && first.props?.children) {
          const strongText = String(first.props.children);
          if (strongText.toLowerCase().startsWith('key takeaway')) {
            return (
              <div className="blog-callout">
                <Lightbulb className="blog-callout-icon" />
                <div><strong>{first.props.children}</strong>{children.slice(1)}</div>
              </div>
            );
          }
        }
      }
      return <p>{children}</p>;
    },
    img: ({ src, alt }) => (
      <BlogMarkdownImage src={src} alt={alt || ''} />
    ),
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    image: post.coverImage || defaultImage,
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'VOVV AI',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: defaultImage },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title },
    ],
  };

  return (
    <PageLayout>
      <SEOHead
        title={`${post.title} | VOVV AI Blog`}
        description={post.metaDescription}
        canonical={`${SITE_URL}/blog/${post.slug}`}
        ogType="article"
      />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article id="blog-article">
        {/* Hero header — dramatic */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/[0.08] via-accent/40 to-background border-b border-border">
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/[0.06] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-14 sm:pb-20">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-10">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <span className="text-border">/</span>
              <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <span className="text-border">/</span>
              <span className="text-foreground/70 truncate max-w-[200px]">{post.title}</span>
            </nav>

            <Badge variant="secondary" className="rounded-full text-xs mb-6 bg-primary/10 text-primary border-primary/20 px-3 py-1">
              {post.category}
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-5 leading-[1.1]">
              {post.title}
            </h1>

            {/* Excerpt as subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 bg-card border border-border rounded-full pl-1 pr-3 py-1 shadow-sm">
                <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
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

        {/* Hero image */}
        {post.coverImage && (
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-10">
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
              <ShimmerImage
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto object-cover"
                aspectRatio="16/9"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        )}

        {/* Inline TOC — compact, centered */}
        {headings.length > 2 && (
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
            <div className="border border-border rounded-xl bg-card/50 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                In this article
              </p>
              <nav className="grid sm:grid-cols-2 gap-1">
                {headings.map((h, i) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`text-[13px] leading-snug py-1.5 px-3 rounded-md transition-all ${
                      activeHeading === h.id
                        ? 'text-foreground bg-primary/5 font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-muted-foreground/40 mr-1.5 text-[11px] font-mono">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Centered content */}
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="blog-content prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight">
            <ReactMarkdown components={markdownComponents}>{post.content}</ReactMarkdown>
          </div>

              {/* Tags */}
              <div className="mt-14 pt-8 border-t border-border">
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,hsl(var(--primary-foreground)/0.04),transparent_40%)]" />
                <div className="relative">
                  <h3 className="text-xl sm:text-2xl font-bold text-primary-foreground mb-2">
                    Ready to try AI product photography?
                  </h3>
                  <p className="text-primary-foreground/70 text-sm mb-6 max-w-md mx-auto">
                    Get 20 free credits — no credit card required. See the difference in seconds.
                  </p>
                  <Button asChild size="lg" variant="secondary" className="rounded-full px-8 font-semibold shadow-lg">
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
                        className="group relative border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-lg transition-all bg-card overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                          <Badge variant="secondary" className="rounded-full text-[10px] mb-3 bg-muted">
                            {r.category}
                          </Badge>
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                            {r.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{r.readTime}</p>
                        </div>
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
