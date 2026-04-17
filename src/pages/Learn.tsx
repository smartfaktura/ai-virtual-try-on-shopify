import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LEARN_GUIDES, LEARN_SECTIONS, getGuidesBySection, type LearnGuide } from '@/data/learnContent';

function GuideCard({ guide }: { guide: LearnGuide }) {
  const navigate = useNavigate();
  const route = `/app/learn/${guide.section}/${guide.slug}`;

  return (
    <Card
      onClick={() => navigate(route)}
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col"
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-gradient-to-br from-muted to-muted/40">
        {guide.heroImage ? (
          <img
            src={guide.heroImage}
            alt={guide.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}
        <Badge
          variant="outline"
          className="absolute top-3 right-3 gap-1 text-[10px] font-medium bg-background/90 backdrop-blur-sm border-border/60"
        >
          <Clock className="w-3 h-3" />
          {guide.readMin} min
        </Badge>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base tracking-tight mb-1">{guide.title}</h3>
        <p className="text-sm text-muted-foreground leading-snug line-clamp-2 flex-1">{guide.tagline}</p>
        <div className="flex items-center gap-1 mt-3 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Read guide <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Card>
  );
}

export default function Learn() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return LEARN_GUIDES.filter(
      (g) => g.title.toLowerCase().includes(q) || g.tagline.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Learn"
        subtitle="Get the most out of VOVV.AI in minutes — short, action-oriented guides for every creation type."
      >
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <GraduationCap className="w-3.5 h-3.5" />
          {LEARN_GUIDES.length} guides
        </div>
      </PageHeader>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guides…"
          className="pl-9 rounded-full"
        />
      </div>

      {/* Filtered results */}
      {filtered && (
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
          </p>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No guides match “{query}”.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((g) => (
                <GuideCard key={`${g.section}-${g.slug}`} guide={g} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Sections */}
      {!filtered &&
        LEARN_SECTIONS.map((section) => {
          const guides = getGuidesBySection(section.id);
          if (guides.length === 0) return null;
          return (
            <section key={section.id}>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">{section.label}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{section.description}</p>
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {guides.length} guide{guides.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {guides.map((g) => (
                  <GuideCard key={`${g.section}-${g.slug}`} guide={g} />
                ))}
              </div>
            </section>
          );
        })}

      {/* Coming soon */}
      {!filtered && (
        <section>
          <h2 className="text-lg font-bold tracking-tight mb-3">Coming soon</h2>
          <div className="flex flex-wrap gap-2">
            {['Video', 'Brand Models', 'Brand Profiles', 'Creative Drops'].map((label) => (
              <Badge
                key={label}
                variant="outline"
                className="text-xs font-medium text-muted-foreground border-dashed border-border/60 px-3 py-1 rounded-full"
              >
                {label}
              </Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
