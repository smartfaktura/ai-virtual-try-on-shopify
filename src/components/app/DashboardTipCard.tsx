import { useState, useEffect } from 'react';
import { Lightbulb, X, Sparkles, Calendar, Palette } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import avatarKenji from '@/assets/team/avatar-kenji.jpg';
import avatarSienna from '@/assets/team/avatar-sienna.jpg';
import avatarZara from '@/assets/team/avatar-zara.jpg';
import avatarOmar from '@/assets/team/avatar-omar.jpg';

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
    avatar: avatarKenji,
    memberName: 'Kenji',
  },
  {
    icon: Palette,
    text: 'Add a Brand Profile to keep all your product visuals consistent across campaigns.',
    highlight: 'Stay on brand',
    avatar: avatarSienna,
    memberName: 'Sienna',
  },
  {
    icon: Sparkles,
    text: 'Virtual Try-On now supports 40+ diverse AI models with unique poses and environments.',
    highlight: 'New feature',
    avatar: avatarZara,
    memberName: 'Zara',
  },
  {
    icon: Lightbulb,
    text: 'Use Workflows to generate complete visual sets — ads, listings, and hero images — in one click.',
    highlight: 'Work smarter',
    avatar: avatarOmar,
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
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <TipIcon className="w-4.5 h-4.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{tip.highlight}</p>
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
