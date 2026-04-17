import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { HelpCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState, useMemo } from 'react';
import { faqCategories } from '@/data/faqContent';

export default function HelpCenter() {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return faqCategories;
    const term = search.toLowerCase();
    return faqCategories
      .map((cat) => ({
        ...cat,
        questions: cat.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(term) || q.a.toLowerCase().includes(term)
        ),
      }))
      .filter((cat) => cat.questions.length > 0);
  }, [search]);

  return (
    <PageLayout>
      <SEOHead title="Help Center — VOVV.AI Support & FAQ" description="Find answers to common questions about VOVV.AI. Learn about Visual Studio, credits, brand profiles, and getting started with AI product photography." canonical={`${SITE_URL}/help`} />
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            Help Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            How can we help?
          </h1>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No results found for "{search}". Try a different search term or{' '}
                <a href="/contact" className="text-primary hover:underline">
                  contact support
                </a>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredCategories.map((category) => (
                <div key={category.name}>
                  <h2 className="text-lg font-semibold text-foreground mb-4">{category.name}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, idx) => (
                      <AccordionItem key={idx} value={`${category.name}-${idx}`}>
                        <AccordionTrigger className="text-left text-sm">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-16 p-8 rounded-2xl bg-muted/50 border border-border">
            <h3 className="font-semibold text-foreground mb-2">Still need help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our support team typically responds within 2 hours during business hours.
            </p>
            <a href="/contact">
              <button className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Contact Support
              </button>
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
