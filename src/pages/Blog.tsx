import { useState } from 'react';
import { PageLayout } from '@/components/landing/PageLayout';
import { Newspaper, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const topics = [
  'AI Photography',
  'E-commerce Tips',
  'Brand Strategy',
  'Product Styling',
  'Visual Trends',
  'Case Studies',
  'Platform Updates',
];

export default function Blog() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('You\'re on the list!', { description: 'We\'ll notify you when we publish our first post.' });
    setEmail('');
  };

  return (
    <PageLayout>
      <section className="py-28 sm:py-36">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Newspaper className="w-4 h-4" />
            Blog
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
            Coming Soon
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            We're crafting in-depth articles on AI-powered product photography, e-commerce visual strategy, and creative workflows. Be the first to read them.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto mb-10">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" className="rounded-full px-6 gap-2">
              <Send className="w-4 h-4" />
              Notify Me
            </Button>
          </form>

          <div>
            <p className="text-sm text-muted-foreground mb-3">Topics we'll cover</p>
            <div className="flex flex-wrap justify-center gap-2">
              {topics.map((topic) => (
                <Badge key={topic} variant="secondary" className="rounded-full">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
