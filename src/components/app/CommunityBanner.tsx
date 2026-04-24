import { Instagram, Facebook, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  primary?: boolean;
}

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.369A19.791 19.791 0 0016.558 3.2a.074.074 0 00-.079.037c-.34.607-.719 1.4-.984 2.022a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.995-2.022.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.369a.07.07 0 00-.032.027C.533 9.045-.32 13.579.099 18.057a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.105 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.009c.12.099.246.198.373.292a.077.077 0 01-.006.128 12.298 12.298 0 01-1.873.891.077.077 0 00-.041.106c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.029 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.79a4.83 4.83 0 01-1-.1z"/>
  </svg>
);

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'Discord',
    href: 'https://discord.gg/ZgnSJqUyV',
    icon: <DiscordIcon className="w-4 h-4" />,
    primary: true,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/vovv.ai',
    icon: <Instagram className="w-4 h-4" />,
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@vovv.ai',
    icon: <TikTokIcon className="w-4 h-4" />,
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/vovvaistudio',
    icon: <Facebook className="w-4 h-4" />,
  },
];

export function CommunityBanner() {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground leading-snug text-sm">
            Join the community
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Get early features, tips, and connect with other creators.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 h-9 text-xs font-semibold transition-colors border',
                link.primary
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                  : 'bg-background text-foreground border-border hover:border-primary/40 hover:text-primary',
              )}
            >
              {link.icon}
              <span>{link.label}</span>
              {link.primary && <ArrowUpRight className="w-3.5 h-3.5" />}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
