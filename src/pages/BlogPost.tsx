import { useParams, Link, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { getBlogPostBySlug, getRelatedPosts } from '@/data/blogPosts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, ArrowLeft, ArrowRight } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const related = getRelatedPosts(post.slug, 3);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishDate,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'VOVV AI',
      url: 'https://vovvai.lovable.app',
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

      <article className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <Badge variant="secondary" className="rounded-full text-xs mb-4">
              {post.category}
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
              <span>{post.author}</span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-li:leading-relaxed prose-table:text-sm">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="mt-10 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/10 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Ready to try AI product photography?
            </h3>
            <p className="text-muted-foreground text-sm mb-5">
              Get 20 free credits — no credit card required.
            </p>
            <Button asChild className="rounded-full px-8">
              <Link to="/auth">Start Free</Link>
            </Button>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-16">
              <h3 className="text-lg font-semibold text-foreground mb-6">More from the blog</h3>
              <div className="grid gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/blog/${r.slug}`}
                    className="group flex items-center justify-between border border-border rounded-xl p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {r.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.readTime}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors ml-4" />
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
