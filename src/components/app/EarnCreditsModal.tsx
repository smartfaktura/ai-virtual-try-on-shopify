import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Gift, Send, Copy, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

interface EarnCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CAPTION = 'Made with @VOVV.AI';

export function EarnCreditsModal({ open, onOpenChange }: EarnCreditsModalProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();
  const userEmail = user?.email || '[your VOVV.AI email]';

  const mailtoSubject = encodeURIComponent('I posted something I made with VOVV.AI!');
  const mailtoBody = encodeURIComponent(
    `Hey VOVV.AI team!\n\nI shared my AI-generated content on social media.\n\nLink to my post: [paste your link here]\n\nAdd credits to my account: ${userEmail}\n\nThanks!`
  );
  const mailtoHref = `mailto:hello@vovv.ai?subject=${mailtoSubject}&body=${mailtoBody}`;

  const copyCaption = () => {
    navigator.clipboard.writeText(CAPTION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <div className="relative">
      {/* Close button */}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-border"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header — left aligned, restrained */}
      <div className="px-6 sm:px-7 pt-6 pb-4">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 mb-3.5">
          <Gift className="w-[18px] h-[18px] text-primary" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Reward
        </p>
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
          Earn 200 free credits
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share a creation on social media & tag us
        </p>
      </div>

      {/* Steps — bordered card, divided rows */}
      <div className="px-6 sm:px-7">
        <ol className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          <Step num="1" title="Create" desc="Generate an image with any VOVV.AI tool" />

          <li className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <StepNumber num="2" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-snug">Post & tag</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  Share on Instagram or TikTok with the caption
                </p>
                <button
                  onClick={copyCaption}
                  className="mt-2.5 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-background border border-border hover:border-foreground/20 transition-colors group w-full"
                >
                  <span className="font-sans text-sm font-medium text-foreground flex-1 text-left truncate">{CAPTION}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  )}
                </button>
              </div>
            </div>
          </li>

          <Step num="3" title="Email us the link" desc="We'll add 200 credits within 24h" />
        </ol>
      </div>

      {/* CTA */}
      <div className="px-6 sm:px-7 pt-4 pb-2">
        <Button asChild size="pill" className="w-full gap-2 h-11 text-sm font-medium">
          <a href={mailtoHref}>
            <Send className="w-4 h-4" />
            Claim my credits
          </a>
        </Button>
      </div>

      {/* Fine print */}
      <p className="px-6 sm:px-7 pb-6 pt-2 text-xs text-muted-foreground text-center">
        One reward per account per month · Account must be 7+ days old
      </p>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto pb-2">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 border border-border bg-card overflow-hidden rounded-2xl shadow-xl top-[50%] translate-y-[-50%] [&>button]:hidden">
        {content}
      </DialogContent>
    </Dialog>
  );
}

/* Step number tile — soft primary tile matching /app aesthetic */
function StepNumber({ num }: { num: string }) {
  return (
    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold flex-shrink-0 tabular-nums">
      {num}
    </span>
  );
}

/* Tiny step row inside the bordered card */
function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3 p-4 sm:p-5">
      <StepNumber num={num} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-snug">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}
