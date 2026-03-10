import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Lightbulb, Sparkles, Camera } from 'lucide-react';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const teamAvatar = (file: string) => getOptimizedUrl(getLandingAssetUrl(`team/${file}`), { quality: 50 });

interface Tip {
  icon: LucideIcon;
  text: string;
  highlight: string;
  avatar: string;
  memberName: string;
}

const TIPS: Tip[] = [
  {
    icon: Lightbulb,
    text: "Write clear, specific titles like 'Black Leather Crossbody Bag' — the AI uses your title to understand what it's generating.",
    highlight: 'Pro tip',
    avatar: teamAvatar('avatar-sophia.jpg'),
    memberName: 'Sophia',
  },
  {
    icon: Sparkles,
    text: 'Add real dimensions (e.g. height: 15cm, width: 10cm) in the description — this helps the AI scale your product realistically in scenes.',
    highlight: 'Better results',
    avatar: teamAvatar('avatar-kenji.jpg'),
    memberName: 'Kenji',
  },
  {
    icon: Camera,
    text: 'Upload a clean, well-lit photo on a plain background for the best AI generations. Multiple angles help too.',
    highlight: 'Quick tip',
    avatar: teamAvatar('avatar-sienna.jpg'),
    memberName: 'Sienna',
  },
];

export function ProductUploadTips() {
  const [dismissed, setDismissed] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem('product-upload-tip-dismissed');
    if (stored === 'true') setDismissed(true);

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setTipIndex(dayOfYear % TIPS.length);
  }, []);

  if (dismissed) return null;

  const tip = TIPS[tipIndex];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3 shadow-sm animate-fade-in">
      <img
        src={tip.avatar}
        alt={tip.memberName}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5 border-2 border-primary/20"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          {tip.memberName} · {tip.highlight}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{tip.text}</p>
      </div>
      <button
        onClick={() => {
          setDismissed(true);
          sessionStorage.setItem('product-upload-tip-dismissed', 'true');
        }}
        className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
