import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Gift, Send, Copy, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

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
        className="absolute top-4 right-4 z-10 p-1.5 rounded-full hover:bg-muted/60 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Header */}
      <div className="px-6 pt-7 pb-5 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-3">
          <Gift className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Earn 200 Free Credits
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Share a creation on social media & tag us
        </p>
      </div>

      {/* Steps — clean numbered list */}
      <div className="px-6 space-y-4">
        <Step num="1" title="Create" desc="Generate an image with any VOVV.AI tool." />
        
        <div>
          <Step num="2" title="Post & tag" desc="Share on Instagram or TikTok with:" />
          <button
            onClick={copyCaption}
            className="mt-2 ml-9 flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-muted/50 border border-border/40 hover:bg-muted transition-colors group w-[calc(100%-2.25rem)]"
          >
            <code className="text-[13px] font-semibold text-foreground flex-1 text-left">{CAPTION}</code>
            {copied ? (
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            )}
          </button>
        </div>

        <Step num="3" title="Email us the link" desc="We'll add 200 credits within 24h." />
      </div>

      {/* CTA */}
      <div className="px-6 pt-5 pb-4">
        <a
          href={mailtoHref}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-colors"
        >
          Claim My Credits
          <Send className="w-4 h-4" />
        </a>
      </div>

      {/* Fine print */}
      <p className="px-6 pb-5 text-[10px] text-muted-foreground/50 text-center leading-relaxed">
        One reward per account per month · Account must be 7+ days old
      </p>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] overflow-y-auto pb-2">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 border-border/50 bg-card overflow-hidden rounded-2xl top-[50%] translate-y-[-50%] [&>button]:hidden">
        {content}
      </DialogContent>
    </Dialog>
  );
}

/* Tiny step row */
function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex-shrink-0 mt-0.5">
        {num}
      </span>
      <p className="text-sm text-foreground leading-snug">
        <span className="font-semibold">{title}</span>
        <span className="text-muted-foreground"> — {desc}</span>
      </p>
    </div>
  );
}
