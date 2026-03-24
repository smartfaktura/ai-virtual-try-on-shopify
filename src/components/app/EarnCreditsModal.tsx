import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Gift, ExternalLink, Send, Copy, Check } from 'lucide-react';
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
    <>
      {/* Hero */}
      <div className="relative px-5 sm:px-6 pt-8 pb-6 text-center bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 mb-4">
          <Gift className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Unlock 200 Free Credits
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Share your best creation and get rewarded
        </p>
      </div>

      {/* Steps */}
      <div className="px-5 sm:px-6 py-5 space-y-3">
        {/* Step 1 */}
        <div className="flex items-start gap-3.5 p-3 rounded-xl bg-muted/40 border border-border/30">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
            1
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Create something stunning</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Use any VOVV.AI tool to generate a product image you love.</p>
          </div>
        </div>

        {/* Step 2 — with copy caption */}
        <div className="flex items-start gap-3.5 p-3 rounded-xl bg-muted/40 border border-border/30">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
            2
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Share & tag us</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Post it on Instagram or TikTok. Start your caption with:</p>
            <div className="mt-2 flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-background border border-border/50">
              <code className="text-xs font-medium text-foreground">{CAPTION}</code>
              <button
                onClick={copyCaption}
                className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-3.5 p-3 rounded-xl bg-muted/40 border border-border/30">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
            3
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Send us the link</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">We'll drop 200 credits into your account within 24 hours.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 sm:px-6 pb-4">
        <a
          href={mailtoHref}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-colors"
        >
          Claim My Credits
          <Send className="w-4 h-4" />
        </a>
      </div>

      {/* Instagram + fine print */}
      <div className="px-5 sm:px-6 pb-6 space-y-3">
        <a
          href="https://instagram.com/vovv.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          @vovv.ai
          <ExternalLink className="w-3 h-3" />
        </a>
        <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
          One reward per account per month. Account must be 7+ days old. We review every submission personally.
        </p>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 border-border/50 bg-card overflow-hidden rounded-2xl top-[50%] translate-y-[-50%]">
        {content}
      </DialogContent>
    </Dialog>
  );
}
