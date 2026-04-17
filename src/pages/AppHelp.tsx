import { Link } from 'react-router-dom';
import { GraduationCap, ArrowUpRight, ArrowRight, HelpCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChatContactForm } from '@/components/app/ChatContactForm';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const avatarSophia = getOptimizedUrl(getLandingAssetUrl('team/avatar-sophia.jpg'), { quality: 60 });
const avatarKenji = getOptimizedUrl(getLandingAssetUrl('team/avatar-kenji.jpg'), { quality: 60 });
const avatarZara = getOptimizedUrl(getLandingAssetUrl('team/avatar-zara.jpg'), { quality: 60 });

const socialLinks = [
  { label: 'Email', href: 'mailto:hello@vovv.ai' },
  { label: 'Twitter', href: 'https://twitter.com/vovvai' },
  { label: 'Instagram', href: 'https://instagram.com/vovv.ai' },
];

export default function AppHelp() {
  return (
    <div className="min-h-full">
      <div className="max-w-xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        {/* Hero */}
        <header className="mb-14">
          <div className="flex -space-x-3 mb-6">
            <Avatar className="w-12 h-12 ring-[3px] ring-background">
              <AvatarImage src={avatarSophia} alt="Sophia" />
              <AvatarFallback className="text-xs">S</AvatarFallback>
            </Avatar>
            <Avatar className="w-12 h-12 ring-[3px] ring-background">
              <AvatarImage src={avatarKenji} alt="Kenji" />
              <AvatarFallback className="text-xs">K</AvatarFallback>
            </Avatar>
            <Avatar className="w-12 h-12 ring-[3px] ring-background">
              <AvatarImage src={avatarZara} alt="Zara" />
              <AvatarFallback className="text-xs">Z</AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            Talk to the team
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Real humans, real fast. We usually reply within a few hours.
          </p>
        </header>

        {/* Form */}
        <section className="mb-16">
          <ChatContactForm variant="spacious" />
        </section>

        {/* Quiet helpers */}
        <section className="mb-14 border-t border-border/60">
          <a
            href="/help"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 py-5 border-b border-border/60 -mx-2 px-2 rounded-lg hover:bg-muted/40 transition-colors"
          >
            <HelpCircle className="w-[18px] h-[18px] text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.75} />
            <div className="flex-1">
              <div className="text-[15px] text-foreground">Browse FAQs</div>
              <div className="text-[13px] text-muted-foreground mt-0.5">Quick answers to common questions</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </a>

          <Link
            to="/app/learn"
            className="group flex items-center gap-4 py-5 border-b border-border/60 -mx-2 px-2 rounded-lg hover:bg-muted/40 transition-colors"
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
        <footer className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
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
    </div>
  );
}
