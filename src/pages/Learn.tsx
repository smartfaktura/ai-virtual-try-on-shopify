import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, Search, Sparkles, X } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLearnRead, makeKey } from '@/hooks/useLearnRead';
import {
  LEARN_GUIDES,
  LEARN_TRACKS,
  LEARN_COMING_SOON,
  getGuidesByTrack,
  getRecommendedGuide,
  levelLabel,
  type LearnGuide,
  type LearnTrack,
} from '@/data/learnContent';

type Filter = 'all' | LearnTrack;

interface RowProps {
  guide: LearnGuide;
  state: 'unread' | 'read' | 'recommended';
  onOpen: (g: LearnGuide) => void;
}

function StateDot({ state }: { state: RowProps['state'] }) {
  if (state === 'read') {
    return (
      <span
        aria-label="Read"
        className="flex w-5 h-5 rounded-full bg-primary/15 text-primary items-center justify-center"
      >
        <Check className="w-3 h-3" strokeWidth={3} />
      </span>
    );
  }
  if (state === 'recommended') {
    return (
      <span
        aria-label="Recommended next"
        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
      </span>
    );
  }
  return (
    <span
      aria-label="Unread"
      className="w-5 h-5 rounded-full border border-border/70"
    />
  );
}

function LearnRow({ guide, state, onOpen }: RowProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(guide)}
      aria-label={`Open guide: ${guide.title}`}
      className={cn(
        'group w-full flex items-center gap-4 py-3 px-3 -mx-3 rounded-lg text-left',
        'transition-colors hover:bg-accent/40',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )}
    >
      <StateDot state={state} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h3 className="font-semibold text-[15px] tracking-tight truncate">{guide.title}</h3>
        </div>
        <p
          title={guide.tagline}
          className="text-[13px] text-muted-foreground truncate sm:line-clamp-1 mt-0.5"
        >
          {guide.tagline}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 text-[12px] text-muted-foreground">
        <span className="tabular-nums">{guide.readMin} min</span>
        <span className="hidden sm:inline text-border">·</span>
        <span className="hidden sm:inline">{levelLabel(guide.level)}</span>
        <ChevronRight
          aria-hidden
          className="w-4 h-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </button>
  );
}

function ComingSoonRow({ label, reason }: { label: string; reason: string }) {
  return (
    <div
      aria-disabled
      className="w-full flex items-center gap-4 py-3 px-3 -mx-3 rounded-lg opacity-60 cursor-not-allowed"
    >
      <span className="w-5 h-5 rounded-full border border-dashed border-border/70" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[15px] tracking-tight">{label}</h3>
        <p className="text-[13px] text-muted-foreground mt-0.5">{reason}</p>
      </div>
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground/70">Soon</span>
    </div>
  );
}

export default function Learn() {
  const navigate = useNavigate();
  const { isRead, readCount, lastOpened } = useLearnRead();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const searchRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K → focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const recommended = useMemo(() => getRecommendedGuide(isRead), [isRead, readCount]);
  const recommendedKey = makeKey(recommended.section, recommended.slug);

  const lastGuide = useMemo(() => {
    if (!lastOpened) return null;
    return LEARN_GUIDES.find((g) => makeKey(g.section, g.slug) === lastOpened) ?? null;
  }, [lastOpened]);

  const total = LEARN_GUIDES.length;
  const progressPct = Math.round((readCount / total) * 100);

  const handleOpen = (g: LearnGuide) => {
    if (g.section === 'freestyle') navigate(`/app/learn/freestyle`);
    else navigate(`/app/learn/${g.section}/${g.slug}`);
  };

  // Build filtered/grouped data
  const q = query.trim().toLowerCase();
  const matches = (g: LearnGuide) =>
    !q ||
    g.title.toLowerCase().includes(q) ||
    g.tagline.toLowerCase().includes(q) ||
    g.tracks.some((t) => t.toLowerCase().includes(q));

  const visibleTracks = (filter === 'all' ? LEARN_TRACKS.map((t) => t.id) : [filter]) as LearnTrack[];

  const sections = visibleTracks
    .map((trackId) => {
      const meta = LEARN_TRACKS.find((t) => t.id === trackId)!;
      const guides = getGuidesByTrack(trackId).filter(matches);
      return { trackId, meta, guides };
    })
    .filter((s) => s.guides.length > 0);

  const totalVisible = sections.reduce((sum, s) => sum + s.guides.length, 0);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-300">
      <PageHeader
        title="Learn"
        subtitle="Short, action-oriented guides for getting more out of VOVV.AI."
      >
        {/* Progress + search + filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search guides…"
                className="pl-9 pr-16 rounded-full h-10"
                aria-label="Search guides"
              />
              <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5 font-mono">
                ⌘K
              </kbd>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
              <span>
                {readCount} of {total} read
              </span>
              <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-none">
            {(['all', ...LEARN_TRACKS.map((t) => t.id)] as Filter[]).map((id) => {
              const active = filter === id;
              const label = id === 'all' ? 'All' : LEARN_TRACKS.find((t) => t.id === id)?.label;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={cn(
                    'flex-shrink-0 text-[12px] font-medium rounded-full px-3 py-1.5 border transition-colors',
                    active
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-muted-foreground border-border/60 hover:text-foreground hover:border-border'
                  )}
                >
                  {label}
                </button>
              );
            })}
            {/* Mobile read progress */}
            <span className="sm:hidden ml-auto flex-shrink-0 text-[11px] text-muted-foreground tabular-nums pl-2">
              {readCount}/{total}
            </span>
          </div>
        </div>
      </PageHeader>

      {/* Continue learning */}
      {lastGuide && !query && filter === 'all' && (
        <button
          type="button"
          onClick={() => handleOpen(lastGuide)}
          className="w-full flex items-center gap-3 text-left text-[13px] text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest">Continue</span>
          <span className="text-border">·</span>
          <span className="truncate">{lastGuide.title}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}

      {/* Recommended hero row */}
      {!query && filter === 'all' && (
        <section
          aria-labelledby="recommended-heading"
          className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-background p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 id="recommended-heading" className="text-[10px] font-semibold uppercase tracking-widest text-primary">
              Recommended for you
            </h2>
            <Sparkles className="w-3.5 h-3.5 text-primary/70" aria-hidden />
          </div>
          <button
            type="button"
            onClick={() => handleOpen(recommended)}
            className="group w-full text-left flex items-start sm:items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight truncate">{recommended.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 sm:line-clamp-1">{recommended.tagline}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 text-[12px] text-muted-foreground">
              <span className="tabular-nums">{recommended.readMin} min</span>
              <ChevronRight
                aria-hidden
                className="w-5 h-5 text-foreground transition-transform group-hover:translate-x-1"
              />
            </div>
          </button>
        </section>
      )}

      {/* Sections */}
      {totalVisible === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-sm text-muted-foreground">
            No guides match {q ? `“${query}”` : 'this filter'}.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setFilter('all');
            }}
            className="gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map(({ trackId, meta, guides }) => (
            <section key={trackId} aria-labelledby={`track-${trackId}`}>
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <h2
                    id={`track-${trackId}`}
                    className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    {meta.label}
                  </h2>
                  <p className="text-[13px] text-muted-foreground/80 mt-1">{meta.description}</p>
                </div>
                <span className="text-[11px] text-muted-foreground/70 tabular-nums">
                  {guides.length} guide{guides.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="divide-y divide-border/40 border-t border-b border-border/40">
                {guides.map((g) => {
                  const key = makeKey(g.section, g.slug);
                  const read = isRead(g.section, g.slug);
                  const state: RowProps['state'] = read
                    ? 'read'
                    : key === recommendedKey
                      ? 'recommended'
                      : 'unread';
                  return <LearnRow key={key} guide={g} state={state} onOpen={handleOpen} />;
                })}
              </div>
            </section>
          ))}

          {/* Coming soon */}
          {!query && filter === 'all' && (
            <section aria-labelledby="track-coming-soon">
              <div className="flex items-baseline justify-between mb-3">
                <h2
                  id="track-coming-soon"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Coming soon
                </h2>
                <span className="text-[11px] text-muted-foreground/70 tabular-nums">
                  {LEARN_COMING_SOON.length}
                </span>
              </div>
              <div className="divide-y divide-border/40 border-t border-b border-border/40">
                {LEARN_COMING_SOON.map((c) => (
                  <ComingSoonRow key={c.label} label={c.label} reason={c.reason} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
