import { useState, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Copy, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TOKEN_GROUPS, ALL_TOKENS, type TokenEntry } from '@/data/promptTokenReference';

export default function AdminPromptTokens() {
  const [search, setSearch] = useState('');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filtered = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase();
    return ALL_TOKENS.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.example.toLowerCase().includes(q) ||
      t.usage.toLowerCase().includes(q)
    );
  }, [search]);

  const copyToken = (name: string) => {
    navigator.clipboard.writeText(`{{${name}}}`);
    toast.success(`Copied {{${name}}}`);
  };

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderTokenCard = (t: TokenEntry) => (
    <div key={t.name} className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <button
          onClick={() => copyToken(t.name)}
          className="font-mono text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
        >
          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          {`{{${t.name}}}`}
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{t.desc}</p>
      <div className="space-y-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Example value</span>
          <p className="text-xs font-mono bg-muted/50 rounded px-2 py-1 mt-0.5 text-foreground">{t.example}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Usage in prompt</span>
          <p className="text-xs font-mono bg-primary/5 rounded px-2 py-1.5 mt-0.5 text-foreground leading-relaxed">{t.usage}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 max-w-7xl mx-auto pb-20">
      {/* Sidebar nav */}
      <nav className="hidden lg:block w-52 shrink-0 sticky top-0 h-screen pt-4 overflow-y-auto">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">Token Groups</h2>
        <div className="space-y-0.5">
          {TOKEN_GROUPS.map(g => (
            <button
              key={g.id}
              onClick={() => scrollTo(g.id)}
              className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors truncate"
            >
              {g.label}
              <Badge variant="secondary" className="ml-1.5 text-[9px]">{g.tokens.length}</Badge>
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prompt Token Reference</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Click any token to copy. Use these in prompt templates — they resolve automatically per product.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens, descriptions, examples..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Search results */}
        {filtered ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{filtered.length} tokens found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(renderTokenCard)}
            </div>
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">No tokens match your search.</p>
            )}
          </div>
        ) : (
          /* All groups expanded */
          TOKEN_GROUPS.map(g => (
            <div
              key={g.id}
              ref={el => { sectionRefs.current[g.id] = el; }}
              className="scroll-mt-4"
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold mb-4 border ${g.color}`}>
                {g.label}
                <Badge variant="secondary" className="text-[10px]">{g.tokens.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {g.tokens.map(renderTokenCard)}
              </div>
            </div>
          ))
        )}

        {/* Back to top */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp className="w-3 h-3" /> Back to top
        </Button>
      </div>
    </div>
  );
}
