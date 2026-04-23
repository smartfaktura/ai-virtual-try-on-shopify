import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2, Download, Search, ArrowUpDown, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { mockTryOnPoses } from '@/data/mockData';
import { getOptimizedUrl } from '@/lib/imageOptimization';

// Static lookup for built-in freestyle/try-on scenes (pose_* and scene_* IDs)
const STATIC_SCENE_META = new Map<string, SceneMeta>(
  mockTryOnPoses.map((p) => [
    p.poseId,
    {
      id: p.poseId,
      name: p.name,
      category: p.category ?? 'Freestyle',
      thumbnail: (p.previewUrl as unknown as string) ?? null,
    },
  ])
);

type Window = 1 | 7 | 30 | 60 | 90 | 360;
type SortKey = 'total_uses' | 'unique_users' | 'last_used_at' | 'name';
type Dir = 'asc' | 'desc';
const PAGE_SIZE = 50;

interface PopularityRow {
  scene_id: string;
  total_uses: number;
  unique_users: number;
  uses_freestyle: number;
  uses_product_images: number;
  last_used_at: string;
  first_used_at: string;
}

interface SceneMeta {
  id: string;
  name: string;
  category: string;
  thumbnail: string | null;
}

const TRACKING_START = '2026-04-22';

// Page through the popularity RPC to bypass PostgREST's project-level 1000-row ceiling.
async function fetchAllScenePopularity(p_days: number, hardCap = 10000): Promise<PopularityRow[]> {
  const PAGE = 1000;
  const all: PopularityRow[] = [];
  let page = 0;
  while (all.length < hardCap) {
    const from = page * PAGE;
    const to = from + PAGE - 1;
    const res = await supabase.rpc('get_scene_popularity' as any, { p_days }).range(from, to);
    if (res.error) throw res.error;
    const chunk = (res.data ?? []) as PopularityRow[];
    all.push(...chunk);
    if (chunk.length < PAGE) break;
    page++;
  }
  return all;
}

async function fetchInChunks<T>(
  ids: string[],
  fetcher: (chunk: string[]) => Promise<{ data: T[] | null; error: any }>,
  chunkSize = 200,
): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const { data, error } = await fetcher(chunk);
    if (error) throw error;
    if (data) out.push(...data);
  }
  return out;
}

// Resolve metadata for a list of scene IDs. Seeds static meta first, then queries DB
// only for IDs that aren't already in the existing map.
async function resolveMetaForIds(ids: string[], existing: Map<string, SceneMeta>): Promise<Map<string, SceneMeta>> {
  const next = new Map(existing);
  const todo = ids.filter((id) => id && !next.has(id));
  if (todo.length === 0) return next;

  // 1) Static built-ins
  const remaining: string[] = [];
  for (const id of todo) {
    const s = STATIC_SCENE_META.get(id);
    if (s) next.set(id, s);
    else remaining.push(id);
  }
  if (remaining.length === 0) return next;

  // 2) Product image scenes (handle pis- prefix)
  const pisPrefixed = remaining.filter((i) => i.startsWith('pis-'));
  const customPrefixed = remaining.filter((i) => i.startsWith('custom-'));
  const rawPisIds = remaining.filter((i) => !i.startsWith('pis-') && !i.startsWith('custom-'));
  const strippedFromPrefix = pisPrefixed.map((i) => i.slice('pis-'.length));
  const pisQueryIds = Array.from(new Set([...rawPisIds, ...strippedFromPrefix]));
  const reverseKeys = new Map<string, string[]>();
  for (const id of rawPisIds) {
    const arr = reverseKeys.get(id) ?? []; arr.push(id); reverseKeys.set(id, arr);
  }
  for (const id of pisPrefixed) {
    const real = id.slice('pis-'.length);
    const arr = reverseKeys.get(real) ?? []; arr.push(id); reverseKeys.set(real, arr);
  }
  const customIds = customPrefixed.map((i) => i.slice('custom-'.length));

  const [pisData, customData] = await Promise.all([
    pisQueryIds.length
      ? fetchInChunks<any>(pisQueryIds, async (chunk) => {
          const res = await supabase
            .from('product_image_scenes')
            .select('scene_id,title,sub_category,category_collection,preview_image_url')
            .in('scene_id', chunk);
          return { data: res.data, error: res.error };
        })
      : Promise.resolve([] as any[]),
    customIds.length
      ? fetchInChunks<any>(customIds, async (chunk) => {
          const res = await supabase
            .from('custom_scenes')
            .select('id,name,category,preview_image_url,image_url')
            .in('id', chunk);
          return { data: res.data, error: res.error };
        })
      : Promise.resolve([] as any[]),
  ]);

  (pisData ?? []).forEach((s: any) => {
    const meta: SceneMeta = {
      id: s.scene_id,
      name: s.title ?? s.scene_id,
      category: s.category_collection ?? s.sub_category ?? 'Product Images',
      thumbnail: s.preview_image_url ?? null,
    };
    const keys = reverseKeys.get(s.scene_id) ?? [s.scene_id];
    for (const k of keys) {
      next.set(k, { ...meta, id: k });
    }
  });
  (customData ?? []).forEach((s: any) => {
    const prefixedId = `custom-${s.id}`;
    if (next.has(prefixedId)) return;
    next.set(prefixedId, {
      id: prefixedId,
      name: s.name ?? prefixedId,
      category: s.category ?? 'Custom',
      thumbnail: s.preview_image_url ?? s.image_url ?? null,
    });
  });

  return next;
}

export default function SceneUsage() {
  const { isRealAdmin, isLoading: adminLoading } = useIsAdmin();

  const [windowDays, setWindowDays] = useState<Window>(90);
  const [rows, setRows] = useState<PopularityRow[]>([]);
  const [risers, setRisers] = useState<Array<{ scene_id: string; delta: number; current: number }>>([]);
  const [meta, setMeta] = useState<Map<string, SceneMeta>>(new Map());
  const [uniqueUsers, setUniqueUsers] = useState<number | null>(null);
  const [mainLoading, setMainLoading] = useState(true);
  const [uniqueUsersLoading, setUniqueUsersLoading] = useState(true);
  const [uniqueUsersFailed, setUniqueUsersFailed] = useState(false);
  const [risersLoading, setRisersLoading] = useState(true);
  const [risersFailed, setRisersFailed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('total_uses');
  const [sortDir, setSortDir] = useState<Dir>('desc');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const metaRef = useRef(meta);
  metaRef.current = meta;
  const inflightMetaRef = useRef<Set<string>>(new Set());

  // Reset pagination when filters/sort/window change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [windowDays, search, sortKey, sortDir]);

  // Progressive load: main popularity first, then secondary queries in parallel (non-blocking).
  useEffect(() => {
    if (!isRealAdmin) return;
    let cancelled = false;

    setMainLoading(true);
    setUniqueUsersLoading(true);
    setUniqueUsersFailed(false);
    setRisersLoading(true);
    setRisersFailed(false);

    // 1) Main popularity — unblocks the table + main KPIs (paged to bypass 1000-row cap)
    (async () => {
      try {
        const all = await fetchAllScenePopularity(windowDays);
        if (cancelled) return;
        setRows(all);
      } catch (err: any) {
        console.error('[SceneUsage] main popularity failed', err);
        if (!cancelled) {
          setRows([]);
          toast.error(err?.message ?? 'Failed to load scene usage');
        }
      } finally {
        if (!cancelled) setMainLoading(false);
      }
    })();

    // 2) Unique users KPI — independent
    (async () => {
      try {
        const uniqRes = await supabase.rpc('get_scene_unique_user_count' as any, { p_days: windowDays });
        if (uniqRes.error) throw uniqRes.error;
        if (cancelled) return;
        setUniqueUsers(Number(uniqRes.data ?? 0));
      } catch (err: any) {
        console.error('[SceneUsage] unique users failed', err);
        if (!cancelled) {
          setUniqueUsers(null);
          setUniqueUsersFailed(true);
        }
      } finally {
        if (!cancelled) setUniqueUsersLoading(false);
      }
    })();

    // 3) Risers — independent, also resolves its own meta
    (async () => {
      try {
        const [last7Res, prior14Res] = await Promise.all([
          supabase.rpc('get_scene_popularity' as any, { p_days: 7 }).range(0, 499),
          supabase.rpc('get_scene_popularity' as any, { p_days: 14 }).range(0, 499),
        ]);
        if (last7Res.error) throw last7Res.error;
        if (prior14Res.error) throw prior14Res.error;
        const last7 = (last7Res.data ?? []) as PopularityRow[];
        const prior14 = (prior14Res.data ?? []) as PopularityRow[];
        const last7Map = new Map(last7.map((r) => [r.scene_id, Number(r.total_uses)]));
        const prior14Map = new Map(prior14.map((r) => [r.scene_id, Number(r.total_uses)]));
        const allIds = new Set([...last7Map.keys(), ...prior14Map.keys()]);
        const computedRisers = Array.from(allIds).map((id) => {
          const cur = last7Map.get(id) ?? 0;
          const prev14 = prior14Map.get(id) ?? 0;
          const prev7 = Math.max(0, prev14 - cur);
          return { scene_id: id, delta: cur - prev7, current: cur };
        }).filter((r) => r.current > 0).sort((a, b) => b.delta - a.delta).slice(0, 10);

        if (cancelled) return;
        setRisers(computedRisers);

        const riserIds = computedRisers.map((r) => r.scene_id).filter((id) => !metaRef.current.has(id));
        if (riserIds.length) {
          try {
            const nextMeta = await resolveMetaForIds(riserIds, metaRef.current);
            if (!cancelled) setMeta(nextMeta);
          } catch (metaErr) {
            console.error('[SceneUsage] riser meta failed', metaErr);
          }
        }
      } catch (err: any) {
        console.error('[SceneUsage] risers failed', err);
        if (!cancelled) {
          setRisers([]);
          setRisersFailed(true);
        }
      } finally {
        if (!cancelled) setRisersLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isRealAdmin, windowDays]);

  // Build enriched/filtered using whatever meta is available; missing entries fall back to id.
  const enriched = useMemo(() => {
    return rows.map((r) => {
      const m = meta.get(r.scene_id);
      const source: 'freestyle' | 'product_images' | 'both' =
        r.uses_freestyle > 0 && r.uses_product_images > 0 ? 'both'
        : r.uses_freestyle > 0 ? 'freestyle' : 'product_images';
      return {
        ...r,
        name: m?.name ?? r.scene_id,
        category: m?.category ?? '—',
        thumbnail: m?.thumbnail ?? null,
        source,
      };
    });
  }, [rows, meta]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? enriched.filter((r) => r.name.toLowerCase().includes(q) || r.scene_id.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)) : enriched;
    return [...list].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortKey === 'last_used_at') return (new Date(a.last_used_at).getTime() - new Date(b.last_used_at).getTime()) * dir;
      const av = Number(a[sortKey]); const bv = Number(b[sortKey]);
      return (av - bv) * dir;
    });
  }, [enriched, search, sortKey, sortDir]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  // Lazy-load metadata for visible slice — dedupe & avoid duplicate in-flight requests
  useEffect(() => {
    if (visible.length === 0) return;
    const missing = Array.from(new Set(
      visible
        .map((v) => v.scene_id)
        .filter((id) => id && !metaRef.current.has(id) && !inflightMetaRef.current.has(id))
    ));
    if (missing.length === 0) return;
    let cancelled = false;
    missing.forEach((id) => inflightMetaRef.current.add(id));
    (async () => {
      try {
        const nextMeta = await resolveMetaForIds(missing, metaRef.current);
        if (!cancelled) setMeta(nextMeta);
      } catch (err: any) {
        console.error('[SceneUsage] meta resolve failed', err);
      } finally {
        missing.forEach((id) => inflightMetaRef.current.delete(id));
      }
    })();
    return () => { cancelled = true; };
  }, [visible]);

  const totals = useMemo(() => {
    const totalGens = enriched.reduce((s, r) => s + Number(r.total_uses), 0);
    const totalFs = enriched.reduce((s, r) => s + Number(r.uses_freestyle), 0);
    const totalPi = enriched.reduce((s, r) => s + Number(r.uses_product_images), 0);
    return { scenes: enriched.length, totalGens, totalFs, totalPi };
  }, [enriched]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'name' ? 'asc' : 'desc'); }
  }

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
    } finally {
      // Brief flag for UX; meta resolves via the visible-effect above
      setTimeout(() => setLoadingMore(false), 200);
    }
  }

  function exportCsv() {
    const header = ['scene_id', 'name', 'category', 'source', 'total_uses', 'unique_users', 'uses_freestyle', 'uses_product_images', 'first_used_at', 'last_used_at'];
    const lines = [header.join(',')];
    for (const r of filtered) {
      const cells = [r.scene_id, r.name, r.category, r.source, r.total_uses, r.unique_users, r.uses_freestyle, r.uses_product_images, r.first_used_at, r.last_used_at]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`);
      lines.push(cells.join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `scene-performance-${windowDays}d.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (adminLoading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!isRealAdmin) return <Navigate to="/app" replace />;

  const remaining = Math.max(0, filtered.length - visibleCount);

  return (
    <div className="space-y-6">
      <PageHeader title="Scene & Shot Performance" subtitle={`Tracking accurate from ${TRACKING_START}. Older rows without a canonical scene id are excluded.`}>
        <div className="flex flex-wrap items-center gap-2">
          {([1, 7, 30, 60, 90, 360] as Window[]).map((d) => (
            <Button key={d} size="sm" variant={windowDays === d ? 'default' : 'outline'} onClick={() => setWindowDays(d)}>{d}d</Button>
          ))}
          <div className="flex-1" />
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search scenes…" className="pl-8 w-56" />
          </div>
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 border">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Scenes used</div>
            <div className="text-2xl font-semibold mt-1">{mainLoading ? '—' : totals.scenes.toLocaleString()}</div>
          </Card>
          <Card className="p-4 border">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Total generations</div>
            <div className="text-2xl font-semibold mt-1">{mainLoading ? '—' : totals.totalGens.toLocaleString()}</div>
          </Card>
          <Card className="p-4 border">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Freestyle / Product Images</div>
            <div className="text-2xl font-semibold mt-1">{mainLoading ? '—' : `${totals.totalFs.toLocaleString()} / ${totals.totalPi.toLocaleString()}`}</div>
          </Card>
          <Card className="p-4 border">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Unique users</div>
            <div className="text-2xl font-semibold mt-1">
              {uniqueUsersLoading ? '—' : uniqueUsersFailed || uniqueUsers === null ? '—' : uniqueUsers.toLocaleString()}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main table */}
          <Card className="border overflow-hidden">
            {mainLoading ? (
              <div className="p-12 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">No scene usage in the selected window yet.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="text-left px-3 py-2 w-14">Thumb</th>
                        <th className="text-left px-3 py-2"><button className="inline-flex items-center gap-1" onClick={() => toggleSort('name')}>Scene <ArrowUpDown className="w-3 h-3" /></button></th>
                        <th className="text-left px-3 py-2">Source</th>
                        <th className="text-right px-3 py-2"><button className="inline-flex items-center gap-1" onClick={() => toggleSort('total_uses')}>Uses <ArrowUpDown className="w-3 h-3" /></button></th>
                        <th className="text-right px-3 py-2"><button className="inline-flex items-center gap-1" onClick={() => toggleSort('unique_users')}>Users <ArrowUpDown className="w-3 h-3" /></button></th>
                        <th className="text-right px-3 py-2"><button className="inline-flex items-center gap-1" onClick={() => toggleSort('last_used_at')}>Last used <ArrowUpDown className="w-3 h-3" /></button></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((r) => (
                        <tr key={r.scene_id} className="border-t hover:bg-muted/20">
                          <td className="px-3 py-2">
                            {r.thumbnail ? (
                              <img src={getOptimizedUrl(r.thumbnail, { width: 80, quality: 60 })} alt="" className="w-8 h-10 rounded object-cover bg-muted" loading="lazy" />
                            ) : (
                              <div className="w-8 h-10 rounded bg-muted" />
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-medium">{r.name}</div>
                            <div className="text-xs text-muted-foreground">{r.category} · <span className="font-mono">{r.scene_id}</span></div>
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="secondary" className="capitalize">{r.source.replace('_', ' ')}</Badge>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{Number(r.total_uses).toLocaleString()}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{Number(r.unique_users).toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-muted-foreground">{r.last_used_at ? formatDistanceToNow(new Date(r.last_used_at), { addSuffix: true }) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between gap-3 px-3 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
                  <div>Showing {visible.length.toLocaleString()} of {filtered.length.toLocaleString()}</div>
                  {remaining > 0 && (
                    <Button size="sm" variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                      {loadingMore ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                      Load more ({remaining.toLocaleString()} remaining)
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Risers rail */}
          <Card className="border p-4 h-fit">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm font-medium">Top risers (7d vs prior 7d)</div>
            </div>
            {risersLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : risersFailed ? (
              <div className="text-xs text-muted-foreground">Couldn't load risers.</div>
            ) : risers.length === 0 ? (
              <div className="text-xs text-muted-foreground">No movement yet.</div>
            ) : (
              <ul className="space-y-2">
                {risers.map((r) => {
                  const m = meta.get(r.scene_id);
                  return (
                    <li key={r.scene_id} className="flex items-center gap-2 text-sm">
                      {m?.thumbnail ? (
                        <img src={getOptimizedUrl(m.thumbnail, { width: 80, quality: 60 })} alt="" className="w-7 h-9 rounded object-cover bg-muted" loading="lazy" />
                      ) : (
                        <div className="w-7 h-9 rounded bg-muted" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-xs font-medium">{m?.name ?? r.scene_id}</div>
                        <div className="text-[10px] text-muted-foreground">{r.current} this week</div>
                      </div>
                      <Badge variant={r.delta >= 0 ? 'default' : 'secondary'} className="text-[10px]">
                        {r.delta >= 0 ? '+' : ''}{r.delta}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </PageHeader>
    </div>
  );
}
