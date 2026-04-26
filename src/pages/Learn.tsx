import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  LEARN_TRACKS,
  getGuidesByTrack,
  type LearnGuide,
  type LearnTrack,
} from '@/data/learnContent';

function LearnRow({ guide, onOpen }: { guide: LearnGuide; onOpen: (g: LearnGuide) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(guide)}
      aria-label={`Open guide: ${guide.title}`}
      className="group relative w-full flex items-center gap-4 py-4 px-5 text-left transition-colors hover:bg-accent/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:ring-inset"
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-medium tracking-tight text-foreground truncate">
          {guide.title}
        </h3>
        <p
          title={guide.tagline}
          className="text-[13px] text-muted-foreground truncate mt-1 leading-relaxed"
        >
          {guide.tagline}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[12px] text-muted-foreground tabular-nums">{guide.readMin} min</span>
        <ChevronRight
          aria-hidden
          className="w-4 h-4 text-muted-foreground/40 transition-all group-hover:text-foreground/60 group-hover:translate-x-0.5"
        />
      </div>
    </button>
  );
}

export default function Learn() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleOpen = (g: LearnGuide) => {
    if (g.section === 'freestyle') navigate('/app/learn/freestyle');
    else navigate(`/app/learn/${g.section}/${g.slug}`);
  };

  const q = query.trim().toLowerCase();
  const matches = (g: LearnGuide) =>
    !q || g.title.toLowerCase().includes(q) || g.tagline.toLowerCase().includes(q);

  const sections = useMemo(() => {
    const seen = new Set<string>();
    return LEARN_TRACKS.map((meta) => {
      const guides = getGuidesByTrack(meta.id as LearnTrack).filter((g) => {
        const key = `${g.section}/${g.slug}`;
        if (seen.has(key)) return false;
        if (!matches(g)) return false;
        seen.add(key);
        return true;
      });
      return { meta, guides };
    }).filter((s) => s.guides.length > 0);
  }, [q]);

  const totalVisible = sections.reduce((sum, s) => sum + s.guides.length, 0);

  return (
    <div className="max-w-3xl mx-auto pt-2 pb-24 animate-in fade-in duration-300">
      {/* Hero header */}
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          Learn
        </h1>
        <p className="text-base text-muted-foreground mt-2 max-w-xl leading-relaxed">
          Short, focused guides for getting more out of VOVV.AI.
        </p>
      </header>

      {/* Explainer video — single app walkthrough */}
      <figure className="mb-12">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/50 bg-black shadow-sm">
          <iframe
            src="https://www.youtube-nocookie.com/embed/lm9ywh7Ipwc?rel=0&modestbranding=1&playsinline=1"
            title="VOVV.AI app walkthrough"
            loading="lazy"
            allow="accelerated-2d-canvas; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <figcaption className="mt-2.5 flex items-center justify-between text-[12px] text-muted-foreground">
          <span>Watch: app walkthrough</span>
          <a
            href="https://youtu.be/lm9ywh7Ipwc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Open on YouTube ↗
          </a>
        </figcaption>
      </figure>

      {/* Search */}
      <div className="relative mb-12">
        <Search
          aria-hidden
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guides"
          aria-label="Search guides"
          className="pl-11 border-transparent bg-muted/50 hover:bg-muted/70 focus-visible:bg-background focus-visible:border-border focus-visible:ring-1 focus-visible:ring-ring/40 focus-visible:ring-offset-0 transition-colors placeholder:text-muted-foreground/70"
        />
      </div>

      {totalVisible === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-sm text-muted-foreground">
            No guides match “{query}”.
          </p>
          <Button variant="ghost" size="sm" onClick={() => setQuery('')}>
            Clear search
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {sections.map(({ meta, guides }) => (
            <section key={meta.id} aria-labelledby={`track-${meta.id}`}>
              <div className="flex items-baseline justify-between mb-3 px-1">
                <h2
                  id={`track-${meta.id}`}
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {meta.label}
                </h2>
                <span className="text-[11px] text-muted-foreground/60 tabular-nums">
                  {guides.length} {guides.length === 1 ? 'guide' : 'guides'}
                </span>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/40 divide-y divide-border/40 overflow-hidden">
                {guides.map((g) => (
                  <LearnRow key={`${g.section}/${g.slug}`} guide={g} onOpen={handleOpen} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
