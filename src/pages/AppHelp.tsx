import { Link } from 'react-router-dom';
import { GraduationCap, ArrowUpRight, Mail, Twitter, Instagram, Activity } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChatContactForm } from '@/components/app/ChatContactForm';
import { faqCategories } from '@/data/faqContent';

// Curated 5 most useful questions across categories
const QUICK_FAQ_KEYS = [
  'How do I create my first product image?',
  'How do credits work?',
  'What is a Brand Profile and why should I create one?',
  'Can I generate images in bulk?',
  'Can I use generated images commercially?',
];

const quickFaqs = QUICK_FAQ_KEYS
  .map((key) => {
    for (const cat of faqCategories) {
      const found = cat.questions.find((q) => q.q === key);
      if (found) return found;
    }
    return null;
  })
  .filter((x): x is { q: string; a: string } => x !== null);

const socialLinks = [
  { label: 'Email', href: 'mailto:hello@vovv.ai', icon: Mail },
  { label: 'Twitter', href: 'https://twitter.com/vovvai', icon: Twitter },
  { label: 'Instagram', href: 'https://instagram.com/vovv.ai', icon: Instagram },
  { label: 'Status', href: '/status', icon: Activity },
];

export default function AppHelp() {
  return (
    <div className="min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header */}
        <header className="mb-12 sm:mb-14">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Help & support
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We usually reply within a few hours.
          </p>
        </header>

        {/* Contact */}
        <section className="mb-14">
          <h2 className="text-[15px] font-medium text-foreground mb-4">Contact us</h2>
          <div className="rounded-2xl bg-muted/30 border border-border/60 p-5 sm:p-6">
            <ChatContactForm />
          </div>
        </section>

        {/* Quick answers */}
        <section className="mb-14">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[15px] font-medium text-foreground">Quick answers</h2>
            <Link
              to="/help"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              Browse all FAQs
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {quickFaqs.map((item, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border-border/60">
                <AccordionTrigger className="text-left text-sm hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Learn the basics */}
        <section className="mb-14">
          <h2 className="text-[15px] font-medium text-foreground mb-4">Learn the basics</h2>
          <Link
            to="/app/learn"
            className="group block rounded-2xl bg-muted/30 border border-border/60 p-5 sm:p-6 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-background border border-border/60 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">
                  Tutorials & guides
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Learn VOVV.AI in minutes — short, focused walkthroughs.
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </div>
          </Link>
        </section>

        {/* Other ways */}
        <section>
          <h2 className="text-[15px] font-medium text-foreground mb-4">Other ways to reach us</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto');
              return (
                <a
                  key={link.label}
                  href={link.href}
                  {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
