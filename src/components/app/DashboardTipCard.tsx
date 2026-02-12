import { useState, useEffect } from 'react';
import { Lightbulb, X, Sparkles, Calendar, Palette } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const teamAvatar = (file: string) => getOptimizedUrl(getLandingAssetUrl(`team/${file}`), { width: 80, quality: 50 });

interface Tip {
  icon: LucideIcon;
  text: string;
  highlight: string;
  avatar: string;
  memberName: string;
}

const TIPS: Tip[] = [
  {
    icon: Calendar,
    text: 'Schedule monthly Creative Drops to automate fresh visuals for your store.',
    highlight: 'Automate your content',
    avatar: teamAvatar('avatar-kenji.jpg'),
    memberName: 'Kenji',
  },
  {
    icon: Palette,
    text: 'Add a Brand Profile to keep all your product visuals consistent across campaigns.',
    highlight: 'Stay on brand',
    avatar: teamAvatar('avatar-sienna.jpg'),
    memberName: 'Sienna',
  },
  {
    icon: Sparkles,
    text: 'Virtual Try-On now supports 40+ diverse AI models with unique poses and environments.',
    highlight: 'New feature',
    avatar: teamAvatar('avatar-zara.jpg'),
    memberName: 'Zara',
  },
  {
    icon: Lightbulb,
    text: 'Use Workflows to generate complete visual sets — ads, listings, and hero images — in one click.',
    highlight: 'Work smarter',
    avatar: teamAvatar('avatar-omar.jpg'),
    memberName: 'Omar',
  },
];

export function DashboardTipCard() {
  const [dismissed, setDismissed] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem('dashboard-tip-dismissed');
    if (stored === 'true') setDismissed(true);

    // Rotate tip based on day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setTipIndex(dayOfYear % TIPS.length);
  }, []);

  if (dismissed) return null;

  const tip = TIPS[tipIndex];
  const TipIcon = tip.icon;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3 shadow-sm animate-fade-in">
      <img
        src={tip.avatar}
        alt={tip.memberName}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5 border-2 border-primary/20"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{tip.memberName} · {tip.highlight}</p>
        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{tip.text}</p>
      </div>
      <button
        onClick={() => {
          setDismissed(true);
          sessionStorage.setItem('dashboard-tip-dismissed', 'true');
        }}
        className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
