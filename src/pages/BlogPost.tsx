import { useParams, Link, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState, useMemo } from 'react';
import { PageLayout } from '@/components/landing/PageLayout';
import { BlogMarkdownImage } from '@/components/app/BlogMarkdownImage';
import { ShimmerImage } from '@/components/ui/shimmer-image';
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
        return <>{children}</>;
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
      name: 'VOVV.AI',
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
        title={`${post.title} | VOVV.AI Blog`}
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

      <article id="blog-article" className="bg-[#FAFAF8]">
        {/* Hero header — editorial cream */}
        <div className="relative bg-[#FAFAF8] border-b border-[#f0efed]">
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-36 pb-14 sm:pb-20">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[12px] text-muted-foreground mb-10">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <span className="text-[#d6d4d0]">/</span>
              <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <span className="text-[#d6d4d0]">/</span>
              <span className="text-foreground/60 truncate max-w-[200px]">{post.title}</span>
            </nav>

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60 mb-4">
              {post.category}
            </p>

            <h1 className="text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem] font-semibold text-foreground tracking-[-0.025em] sm:tracking-[-0.03em] mb-6 leading-[1.08]">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-3 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-foreground/[0.06] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-foreground/70" />
                </span>
                <span className="font-medium text-foreground text-xs">{post.author}</span>
              </span>
              <span className="text-foreground/25">·</span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {new Date(post.publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="text-foreground/25">·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>

        {/* Hero image — natural aspect, no forced crop, no overflow */}
        {post.coverImage && (
          <div className="max-w-[760px] mx-auto px-4 sm:px-6 -mt-6 sm:-mt-10 relative z-10">
            <div className="rounded-2xl overflow-hidden border border-[#f0efed] shadow-sm bg-[#f5f4f1]">
              <ShimmerImage
                src={getOptimizedUrl(post.coverImage, { quality: 80 })}
                alt={post.title}
                wrapperClassName="!h-auto"
                className="block w-full h-auto max-h-[60vh] object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        )}

        {/* Inline TOC */}
        {headings.length > 2 && (
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
            <div className="border border-[#f0efed] rounded-2xl bg-white shadow-sm p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60 mb-3 flex items-center gap-2">
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
                        ? 'text-foreground bg-foreground/[0.04] font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]'
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
          <div className="mt-14 pt-8 border-t border-[#f0efed]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60 mb-3">Topics</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full text-xs bg-white border-[#f0efed] hover:bg-foreground/[0.03] transition-colors">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Dark CTA — matches site pattern */}
          <div className="mt-14 relative overflow-hidden rounded-2xl bg-[#1a1a2e] p-8 sm:p-12 text-center">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/[0.04] rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/[0.03] rounded-full blur-3xl" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
                Get started
              </p>
              <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-[-0.02em] mb-3">
                Ready to try AI product photography?
              </h3>
              <p className="text-white/60 text-sm sm:text-base mb-8 max-w-md mx-auto">
                Get 20 free credits — no credit card required. See the difference in seconds.
              </p>
              <Button asChild size="lg" className="rounded-full px-8 font-semibold bg-white text-[#1a1a2e] hover:bg-white/90 shadow-lg">
                <Link to="/auth">Start free →</Link>
              </Button>
            </div>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60 mb-5">More from the blog</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/blog/${r.slug}`}
                    className="group relative border border-[#f0efed] rounded-2xl p-5 hover:shadow-md transition-all bg-white"
                  >
                    <Badge variant="secondary" className="rounded-full text-[10px] mb-3 bg-foreground/[0.05] border-0">
                      {r.category}
                    </Badge>
                    <p className="text-sm font-semibold text-foreground group-hover:text-foreground/80 transition-colors line-clamp-2 leading-snug mb-2">
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
