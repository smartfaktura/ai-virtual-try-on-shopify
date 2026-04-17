import { Link } from 'react-router-dom';
import { GraduationCap, ArrowUpRight, Mail, Twitter, Instagram, HelpCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChatContactForm } from '@/components/app/ChatContactForm';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const avatarSophia = getOptimizedUrl(getLandingAssetUrl('team/avatar-sophia.jpg'), { quality: 60 });
const avatarKenji = getOptimizedUrl(getLandingAssetUrl('team/avatar-kenji.jpg'), { quality: 60 });
const avatarZara = getOptimizedUrl(getLandingAssetUrl('team/avatar-zara.jpg'), { quality: 60 });

const socialLinks = [
  { label: 'Email', href: 'mailto:hello@vovv.ai', icon: Mail },
  { label: 'Twitter', href: 'https://twitter.com/vovvai', icon: Twitter },
  { label: 'Instagram', href: 'https://instagram.com/vovv.ai', icon: Instagram },
];

export default function AppHelp() {
  return (
    <div className="min-h-full">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Personal hero */}
        <header className="mb-10 sm:mb-12">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex -space-x-2">
              <Avatar className="w-11 h-11 ring-2 ring-background">
                <AvatarImage src={avatarSophia} alt="Sophia" />
                <AvatarFallback className="text-xs">SC</AvatarFallback>
              </Avatar>
              <Avatar className="w-11 h-11 ring-2 ring-background">
                <AvatarImage src={avatarKenji} alt="Kenji" />
                <AvatarFallback className="text-xs">KN</AvatarFallback>
              </Avatar>
              <Avatar className="w-11 h-11 ring-2 ring-background">
                <AvatarImage src={avatarZara} alt="Zara" />
                <AvatarFallback className="text-xs">ZW</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Talk to the team
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Real humans, real fast. We usually reply within a few hours.
          </p>
        </header>

        {/* Message form */}
        <section className="mb-14">
          <p className="text-xs text-muted-foreground mb-3">What's on your mind?</p>
          <ChatContactForm />
        </section>

        {/* Self-serve (FAQs + Learn) */}
        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/help"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl bg-muted/30 border border-border/60 p-5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-background border border-border/60 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                    Browse FAQs
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Quick answers to common questions.
                  </div>
                </div>
              </div>
            </a>

            <Link
              to="/app/learn"
              className="group block rounded-2xl bg-muted/30 border border-border/60 p-5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-background border border-border/60 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                    Tutorials & guides
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Learn VOVV.AI in minutes.
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Other ways */}
        <section>
          <h2 className="text-[13px] font-medium text-muted-foreground mb-3">Other ways to reach us</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto');
              return (
                <a
                  key={link.label}
                  href={link.href}
                  {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
