import { useMemo } from 'react';
import { Bug, Check, X, ShieldAlert, Zap, Sparkles, Wrench, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const TIERS = [
  {
    label: 'Critical',
    credits: 500,
    icon: ShieldAlert,
    examples: 'Auth bypass, billing/credit miscalculation, data leak between users, payment broken',
  },
  {
    label: 'High',
    credits: 200,
    icon: Zap,
    examples: 'Workflow completely broken, generation never starts, file upload broken, refund not issued',
  },
  {
    label: 'Medium',
    credits: 75,
    icon: Wrench,
    examples: "Sidebar/nav broken, modal won't close, stats show wrong number, broken link",
  },
  {
    label: 'Low / UX',
    credits: 25,
    icon: Sparkles,
    examples: 'Typos, minor visual glitch, copy improvement, contrast issue',
  },
];

const QUALIFIES = [
  'Credits deducted but no generation delivered (and no auto-refund within 10 min)',
  'Credits deducted incorrectly (charged 12 when display said 6)',
  "Cannot access your own data, or can access another user's data",
  'Login / signup / password reset broken',
  'Stripe payment succeeded but plan/credits not updated after 10 min',
  'Workflow step completely unusable on Chrome / Safari / Firefox latest',
  'Security issue (XSS, CSRF, exposed endpoint, leaked key, RLS gap)',
  'Broken admin actions on your own resources (delete, rename, download)',
];

const DOES_NOT_QUALIFY = [
  'AI generation quality complaints — "model looks weird", "wrong color", "hands look bad", "didn\'t follow my prompt". AI output is probabilistic',
  'Style or aesthetic disagreements (subjective)',
  'Watermark or artifact in a single generation — only qualifies if reproducible across many runs and clearly a pipeline bug',
  'Slow generation unless consistently >10 min and reproducible',
  'Feature requests (use the feedback channel instead)',
  'Issues caused by browser extensions or ad blockers',
  'Already reported by someone else (first reporter wins)',
  'Anything requiring you to break ToS (account sharing, scraping)',
];

export default function BugBounty() {
  const { user } = useAuth();
  const userEmail = user?.email || '';

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent('Bug Report — VOVV.AI');
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    const body = encodeURIComponent(
      `Hey VOVV.AI team,

I found a bug on the platform.

— What happened:
[describe the bug]

— Steps to reproduce:
1. 
2. 
3. 

— What you expected:
[expected behavior]

— What actually happened:
[actual behavior]

— Screenshot / screen recording:
[paste link or attach to this email]

— Severity (your guess): Critical / High / Medium / Low

— Account email: ${userEmail}
— URL where it happened: 
— Browser / device: ${ua}

Thanks!`
    );
    return `mailto:hello@vovv.ai?subject=${subject}&body=${body}`;
  }, [userEmail]);

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-24 lg:-mt-8 -mb-4 sm:-mb-6 lg:-mb-8 min-h-[calc(100vh-3.5rem)] bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-12 pt-24 lg:pt-16 pb-20 animate-in fade-in duration-500">
        {/* Hero */}
        <header className="mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Bug Bounty
          </p>
          <h1 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.08]">
            Help us make VOVV.AI better
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mt-4 max-w-[60ch]">
            Find a real platform bug, report it, and earn credits when we confirm it
          </p>
        </header>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            How it works
          </h2>
          <ol className="rounded-3xl border border-[#f0efed] bg-white divide-y divide-[#f0efed] overflow-hidden shadow-sm">
            {[
              { title: 'Find a bug', desc: 'Spot something on the platform that\'s genuinely broken — not a creative preference.' },
              { title: 'Report it', desc: 'Email hello@vovv.ai with steps to reproduce, a screenshot, and your account email.' },
              { title: 'Get rewarded', desc: 'Once we confirm and triage, we\'ll add credits to your account within a few business days.' },
            ].map((s, i) => (
              <li key={i} className="flex items-start gap-4 p-5 sm:p-6">
                <span className="flex-shrink-0 w-7 h-7 rounded-full border border-[#f0efed] bg-[#FAFAF8] text-foreground/70 text-[12px] font-semibold flex items-center justify-center mt-0.5 tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[15px] font-medium text-foreground leading-snug">{s.title}</p>
                  <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Reward tiers */}
        <section className="mb-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Reward tiers
          </h2>
          <div className="rounded-3xl border border-[#f0efed] bg-white divide-y divide-[#f0efed] overflow-hidden shadow-sm">
            {TIERS.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="flex items-start gap-4 p-5 sm:p-6">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mt-0.5">
                    <Icon className="w-[18px] h-[18px] text-primary" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[15px] font-semibold text-foreground">{t.label}</p>
                      <p className="text-[13px] font-semibold text-primary tabular-nums whitespace-nowrap">
                        +{t.credits} credits
                      </p>
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{t.examples}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[12px] text-muted-foreground/70 mt-3 leading-relaxed px-1">
            One reward per unique confirmed bug · First reporter wins · VOVV team decides severity
          </p>
        </section>

        {/* Qualifies / Doesn't */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-[#f0efed] bg-white p-6 sm:p-7 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/80 mb-4 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-primary" />
              What qualifies
            </p>
            <ul className="space-y-3">
              {QUALIFIES.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[14px] text-foreground/90 leading-relaxed">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-[#f0efed] bg-white p-6 sm:p-7 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
              What doesn't qualify
            </p>
            <ul className="space-y-3">
              {DOES_NOT_QUALIFY.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[14px] text-muted-foreground leading-relaxed">
                  <X className="w-4 h-4 text-muted-foreground/70 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How to submit */}
        <section className="mb-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            What to include in your report
          </h2>
          <div className="rounded-3xl border border-[#f0efed] bg-white p-6 sm:p-7 shadow-sm">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {[
                'Clear steps to reproduce',
                'Screenshot or short screen recording',
                'What you expected vs what happened',
                'URL where it happened',
                'Your account email',
                'Browser & device (e.g. Chrome 131 / macOS)',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[14px] text-foreground/90 leading-relaxed">
                  <span className="mt-[9px] w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-14">
          <div className="rounded-3xl border border-[#f0efed] bg-white p-6 sm:p-8 shadow-sm">
            <p className="text-[13px] font-medium text-foreground/80 mb-1">Found a bug?</p>
            <p className="text-[13px] text-muted-foreground mb-5">
              Send it to <span className="text-foreground font-medium">hello@vovv.ai</span> — we'll get back within a few business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="gap-2 rounded-full font-medium h-[3.25rem] px-7 shadow-lg shadow-primary/25">
                <a href={mailtoHref}>
                  <Mail className="w-4 h-4" />
                  Report a bug
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
