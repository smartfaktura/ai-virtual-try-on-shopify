import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Gift, ExternalLink, Sparkles, Share2, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EarnCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  {
    num: 1,
    icon: Sparkles,
    title: 'Create something stunning',
    desc: 'Use any VOVV.AI tool to generate a product image you love.',
  },
  {
    num: 2,
    icon: Share2,
    title: 'Share & tag us',
    desc: 'Post it on Instagram or TikTok. Start your caption with "Made with @VOVV.AI".',
  },
  {
    num: 3,
    icon: Send,
    title: 'Send us the link',
    desc: 'We\'ll drop 50 credits into your account within 24 hours.',
  },
];

export function EarnCreditsModal({ open, onOpenChange }: EarnCreditsModalProps) {
  const { user } = useAuth();
  const userEmail = user?.email || '[your VOVV.AI email]';

  const mailtoSubject = encodeURIComponent('I posted something I made with VOVV.AI!');
  const mailtoBody = encodeURIComponent(
    `Hey VOVV.AI team!\n\nI shared my AI-generated content on social media.\n\nLink to my post: [paste your link here]\n\nAdd credits to my account: ${userEmail}\n\nThanks!`
  );
  const mailtoHref = `mailto:hello@vovv.ai?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 border-border/50 bg-card overflow-hidden rounded-2xl">
        {/* Hero */}
        <div className="relative px-6 pt-8 pb-6 text-center bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-transparent">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400/15 mb-4">
            <Gift className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Unlock 50 Free Credits
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Share your best creation and get rewarded
          </p>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex items-start gap-3.5 p-3 rounded-xl bg-muted/40 border border-border/30"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 text-xs font-bold flex-shrink-0 mt-0.5">
                {step.num}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-4">
          <a
            href={mailtoHref}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm transition-colors"
          >
            Claim My Credits
            <Send className="w-4 h-4" />
          </a>
        </div>

        {/* Instagram + fine print */}
        <div className="px-6 pb-6 space-y-3">
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
      </DialogContent>
    </Dialog>
  );
}
