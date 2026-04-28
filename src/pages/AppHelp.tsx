import { Link } from 'react-router-dom';
import { GraduationCap, ArrowUpRight, ArrowRight, HelpCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader } from '@/components/app/PageHeader';
import { ChatContactForm } from '@/components/app/ChatContactForm';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const avatarSophia = getOptimizedUrl(getLandingAssetUrl('team/avatar-sophia.jpg'), { quality: 60 });
const avatarKenji = getOptimizedUrl(getLandingAssetUrl('team/avatar-kenji.jpg'), { quality: 60 });
const avatarZara = getOptimizedUrl(getLandingAssetUrl('team/avatar-zara.jpg'), { quality: 60 });

const socialLinks = [
  { label: 'Email', href: 'mailto:hello@vovv.ai' },
  { label: 'Discord', href: 'https://discord.gg/ZgnSJqUyV' },
  { label: 'Twitter', href: 'https://twitter.com/vovvai' },
  { label: 'Instagram', href: 'https://instagram.com/vovv.ai' },
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
        title="Help"
        subtitle="Real humans, real fast — we usually reply within a few hours"
      >
        <div className="max-w-3xl space-y-4 sm:space-y-6">
          {/* Team avatars — small intro chip */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <Avatar className="w-8 h-8 ring-2 ring-background">
                <AvatarImage src={avatarSophia} alt="Sophia" />
                <AvatarFallback className="text-xs">S</AvatarFallback>
              </Avatar>
              <Avatar className="w-8 h-8 ring-2 ring-background">
                <AvatarImage src={avatarKenji} alt="Kenji" />
                <AvatarFallback className="text-xs">K</AvatarFallback>
              </Avatar>
              <Avatar className="w-8 h-8 ring-2 ring-background">
                <AvatarImage src={avatarZara} alt="Zara" />
                <AvatarFallback className="text-xs">Z</AvatarFallback>
              </Avatar>
            </div>
            <p className="text-xs text-muted-foreground">Sophia, Kenji & Zara — your support crew</p>
          </div>

          {/* Form */}
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <ChatContactForm variant="spacious" />
          </section>

          {/* Quiet helpers */}
          <section className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <a
              href="/help"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 px-5 py-4 border-b border-border hover:bg-muted/40 transition-colors"
            >
              <HelpCircle className="w-[18px] h-[18px] text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.75} />
              <div className="flex-1">
                <div className="text-[15px] text-foreground">Browse FAQs</div>
                <div className="text-[13px] text-muted-foreground mt-0.5">Quick answers to common questions</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>

            <a
              href="https://discord.gg/ZgnSJqUyV"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 px-5 py-4 border-b border-border hover:bg-muted/40 transition-colors"
            >
              <DiscordIcon className="w-[18px] h-[18px] text-muted-foreground group-hover:text-foreground transition-colors" />
              <div className="flex-1">
                <div className="text-[15px] text-foreground">Join our Discord</div>
                <div className="text-[13px] text-muted-foreground mt-0.5">Chat with the team & other creators</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>

            <Link
              to="/app/learn"
              className="group flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
            >
              <GraduationCap className="w-[18px] h-[18px] text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.75} />
              <div className="flex-1">
                <div className="text-[15px] text-foreground">Tutorials & guides</div>
                <div className="text-[13px] text-muted-foreground mt-0.5">Learn VOVV.AI in minutes</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </Link>
          </section>

          {/* Footer */}
          <footer className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2">
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
          </footer>
        </div>
      </PageHeader>
    </div>
  );
}
