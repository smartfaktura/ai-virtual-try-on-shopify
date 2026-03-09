import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { blogPosts } from '@/data/blogPosts';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, ArrowRight } from 'lucide-react';

export default function Blog() {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Insights on AI product photography, visual content strategy, and e-commerce growth.
            </p>
          </div>

          <div className="space-y-6">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="block group"
              >
                <article className="border border-border rounded-2xl p-6 sm:p-8 bg-card hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Badge variant="secondary" className="rounded-full text-xs">
                      {post.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(post.publishDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
