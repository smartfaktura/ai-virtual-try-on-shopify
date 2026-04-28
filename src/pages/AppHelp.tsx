import { Link } from 'react-router-dom';
import { GraduationCap, ArrowUpRight, ArrowRight, HelpCircle, Clock, Mail, Lock } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { ChatContactForm } from '@/components/app/ChatContactForm';
import founderImg from '@/assets/founder-tomas.jpg';

const socialLinks = [
  { label: 'Email', href: 'mailto:hello@vovv.ai' },
  { label: 'Discord', href: 'https://discord.gg/ZgnSJqUyV' },
  { label: 'Twitter', href: 'https://twitter.com/vovvai' },
  { label: 'Instagram', href: 'https://instagram.com/vovv.ai' },
];

const expectations = [
  { icon: Clock, label: 'Reply time', value: 'A few hours, weekdays' },
  { icon: Mail, label: 'Where it goes', value: 'Straight to our team' },
  { icon: Lock, label: 'Privacy', value: 'Stays between us' },
];

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.369A19.791 19.791 0 0016.558 3.2a.074.074 0 00-.079.037c-.34.607-.719 1.4-.984 2.022a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.995-2.022.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.369a.07.07 0 00-.032.027C.533 9.045-.32 13.579.099 18.057a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.105 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.009c.12.099.246.198.373.292a.077.077 0 01-.006.128 12.298 12.298 0 01-1.873.891.077.077 0 00-.041.106c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.029 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export default function AppHelp() {
  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Help & Support"
        subtitle="A real team of pros behind every reply — usually within a few hours on weekdays"
      >
        <div className="max-w-3xl space-y-6">
          {/* Form card with personal founder note */}
          <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-start gap-4 px-5 sm:px-6 py-5 sm:py-6 border-b border-border bg-muted/30">
              <img
                src={founderImg}
                alt="Tomas Simkus, founder of VOVV.AI"
                className="w-14 h-14 rounded-full object-cover ring-1 ring-border shadow-sm shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  A note from the founder
                </p>
                <p className="text-[14px] leading-relaxed text-foreground mt-2">
                  Hey — I'm Tomas, founder of VOVV.AI. Whatever you send here lands straight with our team of pros. We'll get back to you personally, usually within a few hours, with a real answer — not a canned reply.
                </p>
                <p className="text-[12px] italic text-muted-foreground mt-2">
                  — Tomas, founder
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* What to expect */}
              <div className="rounded-xl border border-border bg-background mb-5 overflow-hidden">
                <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border">
                  {expectations.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex-1 flex items-center gap-3 px-4 py-3">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {label}
                        </p>
                        <p className="text-[13px] font-medium text-foreground mt-0.5 truncate">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <ChatContactForm variant="spacious" />
            </div>
          </section>

          {/* Quiet helpers */}
          <section className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <a
              href="/help"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 px-5 sm:px-6 py-4 border-b border-border hover:bg-muted/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <HelpCircle className="w-[18px] h-[18px] text-primary" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">Browse FAQs</div>
                <div className="text-xs text-muted-foreground mt-0.5">Quick answers to the things people ask most</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>

            <a
              href="https://discord.gg/ZgnSJqUyV"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 px-5 sm:px-6 py-4 border-b border-border hover:bg-muted/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <DiscordIcon className="w-[18px] h-[18px] text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">Join our Discord</div>
                <div className="text-xs text-muted-foreground mt-0.5">Hang out with the team and other creators</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>

            <Link
              to="/app/learn"
              className="group flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-muted/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <GraduationCap className="w-[18px] h-[18px] text-primary" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">Tutorials & guides</div>
                <div className="text-xs text-muted-foreground mt-0.5">Short walkthroughs for every Visual Type</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </Link>
          </section>

          {/* Footer */}
          <footer className="space-y-2 pt-2">
            <p className="text-xs text-muted-foreground">
              Prefer email? Write directly to{' '}
              <a href="mailto:hello@vovv.ai" className="text-foreground hover:underline underline-offset-2">
                hello@vovv.ai
              </a>
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {socialLinks.map((link, i) => {
                const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto');
                return (
                  <span key={link.label} className="inline-flex items-center gap-1.5">
                    {i > 0 && <span className="text-muted-foreground/40">·</span>}
                    <a
                      href={link.href}
                      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </span>
                );
              })}
            </div>
          </footer>
        </div>
      </PageHeader>
    </div>
  );
}
