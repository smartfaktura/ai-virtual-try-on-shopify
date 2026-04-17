import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  LEARN_GUIDES,
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
      className="group w-full flex items-center gap-4 py-3 px-3 -mx-3 rounded-lg text-left transition-colors hover:bg-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[15px] tracking-tight truncate">{guide.title}</h3>
        <p title={guide.tagline} className="text-[13px] text-muted-foreground truncate mt-0.5">
          {guide.tagline}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 text-[12px] text-muted-foreground">
        <span className="tabular-nums">{guide.readMin} min</span>
        <ChevronRight
          aria-hidden
          className="w-4 h-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5"
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
      // Each guide appears in only its first matching track to avoid duplicates
      const guides = getGuidesByTrack(meta.id as LearnTrack)
        .filter((g) => {
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
    <div className="space-y-8 pb-20 animate-in fade-in duration-300">
      <PageHeader title="Learn" subtitle="Short guides for getting more out of VOVV.AI.">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides…"
            className="pl-9 rounded-md h-10"
            aria-label="Search guides"
          />
        </div>
      </PageHeader>

      {totalVisible === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-sm text-muted-foreground">No guides match “{query}”.</p>
          <Button variant="ghost" size="sm" onClick={() => setQuery('')}>
            Clear search
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map(({ meta, guides }) => (
            <section key={meta.id} aria-labelledby={`track-${meta.id}`}>
              <h2
                id={`track-${meta.id}`}
                className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2"
              >
                {meta.label}
              </h2>
              <div className="divide-y divide-border/40 border-t border-b border-border/40">
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
