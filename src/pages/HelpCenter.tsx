import { PageLayout } from '@/components/landing/PageLayout';
import { SEOHead } from '@/components/SEOHead';
import { SITE_URL } from '@/lib/constants';
import { Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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
      <SEOHead
        title="Help Center — VOVV.AI Support & FAQ"
        description="Find answers to common questions about VOVV.AI. Learn about Visual Studio, credits, brand profiles, and getting started with AI product photography."
        canonical={`${SITE_URL}/help`}
      />

      <div className="bg-[#FAFAF8]">
        {/* ── Hero ── */}
        <section className="pt-20 pb-12 sm:pt-28 sm:pb-16">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Help Center
            </p>
            <h1 className="text-foreground text-[2.5rem] sm:text-5xl lg:text-[3.5rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
              How can we help?
            </h1>
            <p className="max-w-xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed mb-10">
              Search answers, browse topics, or talk to a human.
            </p>

            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/70" />
              <input
                type="text"
                placeholder="Search for answers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 pl-14 pr-5 rounded-full bg-white border border-[#f0efed] text-[15px] text-foreground placeholder:text-muted-foreground/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="pb-24">
          <div className="max-w-2xl mx-auto px-6">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-[15px]">
                  No results for “{search}”. Try a different term or{' '}
                  <Link to="/contact" className="text-primary hover:underline font-medium">
                    contact support
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <div className="space-y-14">
                {filteredCategories.map((category) => (
                  <div key={category.name}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5 px-1">
                      {category.name}
                    </p>
                    <Accordion type="single" collapsible className="space-y-3">
                      {category.questions.map((item, idx) => (
                        <AccordionItem
                          key={idx}
                          value={`${category.name}-${idx}`}
                          className="bg-white rounded-2xl border border-[#f0efed] px-6 shadow-sm data-[state=open]:shadow-md transition-shadow"
                        >
                          <AccordionTrigger className="text-[#1a1a2e] text-[15px] sm:text-[17px] font-semibold py-6 hover:no-underline text-left">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-foreground/70 text-[15px] leading-relaxed pb-6">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Final dark CTA ── */}
      <section className="py-16 lg:py-28 bg-[#1a1a2e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#475569] blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#64748b] blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
            Still stuck?
          </p>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
            Talk to a human
          </h2>
          <p className="text-[#9ca3af] text-base sm:text-lg leading-relaxed mb-10">
            Our team usually replies within a couple of hours.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#1a1a2e] text-base font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto"
            >
              Contact support
              <ArrowRight size={16} />
            </Link>
            <a
              href="https://discord.gg/ZgnSJqUyV"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-white/20 text-white text-base font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              Join our Discord
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
