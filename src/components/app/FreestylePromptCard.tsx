import { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Package, Mountain, RatioIcon, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TEAM_MEMBERS } from '@/data/teamData';

/* ── Typing animation ── */
const PROMPT_TEXTS = [
  'A luxury skincare bottle on wet marble in soft morning light...',
  'Leather bag on a café table, golden hour, shallow depth of field...',
  'Sneakers floating mid-air against a gradient sky, studio lighting...',
  'Perfume bottle surrounded by fresh botanicals on linen cloth...',
];
const TYPING_SPEED = 45;
const PAUSE_AFTER_TYPED = 2400;
const PAUSE_AFTER_ERASED = 600;

function useTypingAnimation() {
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let charIdx = 0;
    let erasing = false;
    let promptIdx = 0;
    const tick = () => {
      const prompt = PROMPT_TEXTS[promptIdx];
      if (!erasing) {
        charIdx++;
        setText(prompt.slice(0, charIdx));
        if (charIdx >= prompt.length) { erasing = true; timeout = setTimeout(tick, PAUSE_AFTER_TYPED); return; }
        timeout = setTimeout(tick, TYPING_SPEED + Math.random() * 30);
      } else {
        charIdx--;
        setText(prompt.slice(0, charIdx));
        if (charIdx <= 0) { erasing = false; promptIdx = (promptIdx + 1) % PROMPT_TEXTS.length; timeout = setTimeout(tick, PAUSE_AFTER_ERASED); return; }
        timeout = setTimeout(tick, 18);
      }
    };
    timeout = setTimeout(tick, 800);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setShowCursor(p => !p), 530);
    return () => clearInterval(iv);
  }, []);

  return { text, showCursor };
}

/* ── Cycling chip with select animation ── */
const CHIP_DATA: { icon: typeof Package; labels: string[] }[] = [
  { icon: Package, labels: ['Skincare', 'Sneakers', 'Leather Bag', 'Perfume'] },
  { icon: Mountain, labels: ['Beach Sunset', 'Studio Light', 'Marble Surface', 'Botanical'] },
];

const RATIO_VALUES = ['1:1', '3:4', '9:16', '16:9'];

const SCENE_COLORS = [
  'linear-gradient(135deg, hsl(35 80% 55%), hsl(25 70% 40%))',
  'linear-gradient(135deg, hsl(210 60% 55%), hsl(220 50% 40%))',
  'linear-gradient(135deg, hsl(140 40% 50%), hsl(160 35% 38%))',
  'linear-gradient(135deg, hsl(280 40% 55%), hsl(300 35% 42%))',
];

function CyclingChip({ icon: Icon, labels, delay, hovered }: { icon: typeof Package; labels: string[]; delay: number; hovered: boolean }) {
  const [idx, setIdx] = useState(0);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setSelecting(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % labels.length);
        setTimeout(() => setSelecting(false), 300);
      }, 150);
    }, 2500 + delay * 400);
    return () => clearInterval(iv);
  }, [labels.length, delay]);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 h-6 px-2 rounded-full text-[9px] font-medium border transition-all duration-200',
        selecting
          ? 'border-primary/50 bg-primary/[0.12] text-primary scale-105 shadow-[0_0_8px_-2px_hsl(var(--primary)/0.3)]'
          : hovered
            ? 'border-primary/30 bg-primary/[0.08] text-primary/80'
            : 'border-border/50 bg-muted/40 text-foreground/50',
      )}
    >
      {selecting ? (
        <Check className="w-2.5 h-2.5 shrink-0 text-primary" />
      ) : (
        <Icon className="w-2.5 h-2.5 shrink-0" />
      )}
      <span className={cn('transition-opacity duration-150 truncate max-w-[60px]', selecting ? 'opacity-0' : 'opacity-100')}>
        {labels[idx]}
      </span>
    </div>
  );
}

/* ── Model avatars with real faces ── */
const AVATAR_MEMBERS = [
  TEAM_MEMBERS.find(m => m.name === 'Sophia')!,
  TEAM_MEMBERS.find(m => m.name === 'Amara')!,
  TEAM_MEMBERS.find(m => m.name === 'Luna')!,
];

function MiniAvatars({ hovered }: { hovered: boolean }) {
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setSelecting(true);
      setTimeout(() => setSelecting(false), 400);
    }, 3200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className={cn(
      'inline-flex items-center gap-0.5 h-6 px-2 rounded-full border transition-all duration-200',
      selecting
        ? 'border-primary/50 bg-primary/[0.12] scale-105 shadow-[0_0_8px_-2px_hsl(var(--primary)/0.3)]'
        : hovered ? 'border-primary/30 bg-primary/[0.08]' : 'border-border/50 bg-muted/40',
    )}>
      {AVATAR_MEMBERS.map((member, i) => (
        <img
          key={member.name}
          src={member.avatar}
          alt={member.name}
          className={cn(
            'w-3.5 h-3.5 rounded-full object-cover border border-background transition-all',
            selecting && i === 1 && 'ring-1 ring-primary/60',
          )}
          style={{ marginLeft: i > 0 ? '-3px' : 0 }}
        />
      ))}
      <span className={cn('text-[9px] font-medium ml-1 transition-colors', selecting ? 'text-primary' : hovered ? 'text-primary/70' : 'text-foreground/40')}>
        {selecting ? <Check className="w-2.5 h-2.5 text-primary" /> : 'Models'}
      </span>
    </div>
  );
}

/* ── Scene mini thumbnails ── */
function SceneThumbnails({ hovered }: { hovered: boolean }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setSelecting(true);
      setTimeout(() => {
        setActiveIdx(i => (i + 1) % SCENE_COLORS.length);
        setTimeout(() => setSelecting(false), 300);
      }, 150);
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className={cn(
      'inline-flex items-center gap-1 h-6 px-2 rounded-full border transition-all duration-200',
      selecting
        ? 'border-primary/50 bg-primary/[0.12] scale-105'
        : hovered ? 'border-primary/30 bg-primary/[0.08]' : 'border-border/50 bg-muted/40',
    )}>
      {SCENE_COLORS.slice(0, 3).map((bg, i) => (
        <div
          key={i}
          className={cn(
            'w-3 h-3 rounded-sm transition-all duration-200',
            i === activeIdx && selecting && 'ring-1 ring-primary/60 scale-110',
          )}
          style={{ background: bg }}
        />
      ))}
      <span className={cn('text-[9px] font-medium ml-0.5 transition-colors', hovered ? 'text-primary/70' : 'text-foreground/40')}>
        Scenes
      </span>
    </div>
  );
}

/* ── Cycling ratio chip ── */
function RatioChip({ hovered }: { hovered: boolean }) {
  const [idx, setIdx] = useState(0);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setSelecting(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % RATIO_VALUES.length);
        setTimeout(() => setSelecting(false), 300);
      }, 150);
    }, 3600);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className={cn(
      'inline-flex items-center gap-1 h-6 px-2 rounded-full text-[9px] font-medium border transition-all duration-200',
      selecting
        ? 'border-primary/50 bg-primary/[0.12] text-primary scale-105'
        : hovered ? 'border-primary/30 bg-primary/[0.08] text-primary/70' : 'border-border/50 bg-muted/40 text-foreground/40',
    )}>
      {selecting ? <Check className="w-2.5 h-2.5" /> : <RatioIcon className="w-2.5 h-2.5" />}
      <span>{RATIO_VALUES[idx]}</span>
    </div>
  );
}

/* ── Main card ── */
interface Props { onSelect: () => void; mobileCompact?: boolean; }

export function FreestylePromptCard({ onSelect, mobileCompact }: Props) {
  const { text, showCursor } = useTypingAnimation();
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer',
        'hover:shadow-xl hover:-translate-y-0.5',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* ── Visual area ── */}
      <div className={cn(
        'relative w-full overflow-hidden bg-gradient-to-br from-foreground/[0.03] via-muted/60 to-primary/[0.04]',
        mobileCompact ? 'aspect-[2/3]' : 'aspect-[3/4]',
      )}>
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 0.5px, transparent 0.5px)',
          backgroundSize: '20px 20px',
        }} />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-3 sm:px-5 gap-2.5">
          <Badge variant="secondary" className="text-[9px] font-semibold tracking-wider uppercase bg-foreground/[0.06] text-foreground/60 border-0 backdrop-blur-sm px-2.5 py-0.5">
            <Sparkles className="w-2.5 h-2.5 mr-1 opacity-70" />
            Freestyle Studio
          </Badge>

          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[280px]">
            <CyclingChip icon={CHIP_DATA[0].icon} labels={CHIP_DATA[0].labels} delay={0} hovered={hovered} />
            <MiniAvatars hovered={hovered} />
            <SceneThumbnails hovered={hovered} />
            <RatioChip hovered={hovered} />
          </div>

          <div className={cn(
            'w-full max-w-[260px] rounded-xl border backdrop-blur-md transition-all duration-300',
            hovered
              ? 'border-primary/30 bg-card/90 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.15)]'
              : 'border-border/60 bg-card/70 shadow-sm',
          )}>
            <div className="px-3 py-2.5 min-h-[44px] flex items-start">
              <p className="text-[11px] leading-relaxed text-foreground/70 font-normal">
                {text}
                <span className={cn(
                  'inline-block w-[1.5px] h-3.5 ml-0.5 -mb-0.5 bg-primary/60 transition-opacity duration-100',
                  showCursor ? 'opacity-100' : 'opacity-0',
                )} />
              </p>
            </div>
            <div className="border-t border-border/40 px-3 py-1.5 flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground/50 font-medium">Describe anything</span>
              <div className={cn('w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center transition-colors', hovered && 'bg-primary/20')}>
                <Sparkles className="w-2.5 h-2.5 text-primary/60" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      <div className={cn('flex flex-col gap-1 flex-1', mobileCompact ? 'p-2' : 'p-4')}>
        <h3 className={cn('font-bold tracking-tight leading-tight', mobileCompact ? 'text-[11px]' : 'text-sm')}>
          Freestyle Studio
        </h3>
        {!mobileCompact && (
          <p className="text-xs text-muted-foreground leading-relaxed">Create any visual you imagine</p>
        )}
        <div className="pt-1 mt-auto">
          <Button
            size="sm"
            variant="outline"
            className={cn(
              'rounded-full font-semibold gap-1.5 w-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors',
              mobileCompact ? 'h-8 px-3 text-xs' : 'h-8 px-5',
            )}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
          >
            Open Studio
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
