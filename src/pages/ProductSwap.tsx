import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Search, Upload, X, Sparkles, Replace, ArrowLeft, Image as ImageLucide,
  Check, Loader2, Package, Info, ClipboardPaste, CheckCircle, XCircle, Clock,
} from 'lucide-react';
import { toast } from '@/lib/brandedToast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { useQuery } from '@tanstack/react-query';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useProductSwap, type SwapJobInfo } from '@/hooks/useProductSwap';
import { toSignedUrls } from '@/lib/signedUrl';
import { TEAM_MEMBERS, getStableStatusMessage } from '@/data/teamData';
import type { Tables } from '@/integrations/supabase/types';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { ImageLightbox } from '@/components/app/ImageLightbox';

type UserProduct = Tables<'user_products'>;
type SceneSource = 'library' | 'scratch';

const ASPECT_RATIOS = ['1:1', '3:4', '4:5', '9:16'] as const;
const PER_IMAGE_COST = 6;

interface LibraryPickerItem {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: string;
}

export default function ProductSwap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { balance: credits, setBalanceFromServer, refreshBalance: refreshCredits } = useCredits();
  const { upload, isUploading } = useFileUpload();
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);

  // ── Scene state ───────────────────────────────────────────────────────
  const initialScene = searchParams.get('scene');
  const [sceneSource, setSceneSource] = useState<SceneSource>(initialScene ? 'scratch' : 'library');
  const [sceneUrl, setSceneUrl] = useState<string | null>(initialScene);
  const [sceneTitle, setSceneTitle] = useState<string>(initialScene ? 'Uploaded scene' : '');
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryVisibleCount, setLibraryVisibleCount] = useState(30);

  // ── Product state ─────────────────────────────────────────────────────
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState('');
  const [productVisibleCount, setProductVisibleCount] = useState(12);

  // ── Ratios ────────────────────────────────────────────────────────────
  const [selectedRatios, setSelectedRatios] = useState<Set<string>>(new Set(['4:5']));

  // ── Generation view state ─────────────────────────────────────────────
  const [isGeneratingView, setIsGeneratingView] = useState(false);
  const [generatingJobs, setGeneratingJobs] = useState<SwapJobInfo[]>([]);
  const [jobStatuses, setJobStatuses] = useState<Record<string, { status: string; error?: string }>>({});
  const [jobResults, setJobResults] = useState<Record<string, string>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [genElapsed, setGenElapsed] = useState(0);
  const [teamIndex, setTeamIndex] = useState(0);
  const genStartRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollVersionRef = useRef(0);

  // ── Data ──────────────────────────────────────────────────────────────
  const { data: products = [] } = useQuery({
    queryKey: ['user-products'],
    queryFn: async () => {
      const { data } = await supabase.from('user_products').select('*').order('created_at', { ascending: false });
      return (data || []) as UserProduct[];
    },
    enabled: !!user,
  });

  const { data: libraryItems = [], isLoading: libraryLoading } = useQuery({
    queryKey: ['product-swap-library-items'],
    queryFn: async () => {
      const [fsResult, jobsResult] = await Promise.all([
        supabase.from('freestyle_generations').select('id, image_url, prompt, created_at')
          .order('created_at', { ascending: false }).limit(200),
        supabase.from('generation_jobs').select('id, results, created_at, status, workflows(name), user_products(title)')
          .eq('status', 'completed').order('created_at', { ascending: false }).limit(200),
      ]);

      const items: LibraryPickerItem[] = [];
      for (const f of fsResult.data || []) {
        items.push({ id: `fs-${f.id}`, imageUrl: f.image_url, title: f.prompt?.slice(0, 40) || 'Freestyle', createdAt: f.created_at });
      }
      for (const job of jobsResult.data || []) {
        const results = job.results as unknown;
        if (!Array.isArray(results)) continue;
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          const url = typeof r === 'string' ? r : r?.url || r?.image_url;
          if (!url || url.startsWith('data:')) continue;
          const workflowName = (job.workflows as { name?: string } | null)?.name || '';
          const productTitle = (job.user_products as { title?: string } | null)?.title || '';
          items.push({
            id: `job-${job.id}-${i}`,
            imageUrl: url,
            title: workflowName || productTitle || 'Generated',
            createdAt: job.created_at,
          });
        }
      }
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const urls = await toSignedUrls(items.map(i => i.imageUrl));
      return items.map((item, idx) => ({ ...item, imageUrl: urls[idx] }));
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const filteredLibrary = libraryItems.filter(i => i.title.toLowerCase().includes(librarySearch.toLowerCase()));
  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()));

  // ── Hook ──────────────────────────────────────────────────────────────
  const { generate, isGenerating, progress } = useProductSwap();

  // ── Polling ───────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    pollVersionRef.current++;
    if (pollRef.current) { clearTimeout(pollRef.current); pollRef.current = null; }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  useEffect(() => {
    if (!isGeneratingView) return;
    const i = setInterval(() => setGenElapsed(Math.floor((Date.now() - genStartRef.current) / 1000)), 1000);
    return () => clearInterval(i);
  }, [isGeneratingView]);

  useEffect(() => {
    if (!isGeneratingView) return;
    const i = setInterval(() => setTeamIndex(p => (p + 1) % TEAM_MEMBERS.length), 4000);
    return () => clearInterval(i);
  }, [isGeneratingView]);

  const startPolling = useCallback((jobs: SwapJobInfo[]) => {
    const version = ++pollVersionRef.current;
    const jobIds = jobs.map(j => j.jobId);

    const poll = async () => {
      if (pollVersionRef.current !== version) return;
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token || SUPABASE_KEY;
      const idsFilter = jobIds.map(id => `"${id}"`).join(',');
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/generation_queue?id=in.(${idsFilter})&select=id,status,error_message,result`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }
        );
        if (!res.ok || pollVersionRef.current !== version) return;
        const rows = await res.json();
        const statuses: Record<string, { status: string; error?: string }> = {};
        const results: Record<string, string> = {};
        for (const row of rows) {
          statuses[row.id] = { status: row.status, error: row.error_message || undefined };
          const imgs = row?.result?.images;
          if (Array.isArray(imgs) && imgs[0]) results[row.id] = imgs[0];
        }
        for (const id of jobIds) if (!statuses[id]) statuses[id] = { status: 'queued' };
        setJobStatuses(statuses);
        if (Object.keys(results).length > 0) setJobResults(prev => ({ ...prev, ...results }));

        const allDone = jobIds.every(id => ['completed', 'failed', 'cancelled'].includes(statuses[id]?.status));
        if (allDone) {
          const completed = jobIds.filter(id => statuses[id]?.status === 'completed').length;
          const failed = jobIds.filter(id => statuses[id]?.status === 'failed').length;
          stopPolling();
          refreshCredits();
          if (completed > 0) toast.success(`${completed} swap${completed > 1 ? 's' : ''} ready! ${failed > 0 ? `(${failed} failed)` : ''}`);
          else toast.error('All generations failed. Credits have been refunded.');
          return;
        }
      } catch { /* keep polling */ }
      if (pollVersionRef.current === version) pollRef.current = setTimeout(poll, 3000);
    };
    poll();
  }, [refreshCredits, stopPolling]);

  // ── Derived ───────────────────────────────────────────────────────────
  const totalImages = selectedProductIds.size * selectedRatios.size;
  const totalCost = totalImages * PER_IMAGE_COST;
  const canGenerate = !!sceneUrl && selectedProductIds.size > 0 && selectedRatios.size > 0 && !isGenerating;

  // ── Handlers ──────────────────────────────────────────────────────────
  const toggleProduct = (id: string) => {
    const next = new Set(selectedProductIds);
    if (next.has(id)) next.delete(id);
    else if (next.size < 10) next.add(id);
    setSelectedProductIds(next);
  };

  const toggleRatio = (r: string) => {
    const next = new Set(selectedRatios);
    if (next.has(r)) next.delete(r);
    else next.add(r);
    setSelectedRatios(next);
  };

  const pickLibrary = (item: LibraryPickerItem) => {
    setSceneUrl(item.imageUrl);
    setSceneTitle(item.title);
  };

  const handleSceneFile = useCallback(async (file: File) => {
    const url = await upload(file);
    if (url) { setSceneUrl(url); setSceneTitle('Uploaded scene'); }
  }, [upload]);

  // Clipboard paste support for scene upload
  useEffect(() => {
    if (sceneSource !== 'scratch' || sceneUrl) return;
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handleSceneFile(file);
          return;
        }
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [sceneSource, sceneUrl, handleSceneFile]);

  const handleGenerate = async () => {
    if (!canGenerate || !sceneUrl) return;
    if (totalCost > credits) { setNoCreditsOpen(true); return; }

    const selected = products.filter(p => selectedProductIds.has(p.id));
    const result = await generate({
      sceneImageUrl: sceneUrl,
      sceneTitle: sceneTitle || 'scene',
      products: selected.map(p => ({ id: p.id, imageUrl: p.image_url || '', title: p.title })),
      ratios: Array.from(selectedRatios),
    });

    if (result && result.jobs.length > 0) {
      if (result.newBalance !== null) setBalanceFromServer(result.newBalance);
      setGeneratingJobs(result.jobs);
      setJobStatuses(Object.fromEntries(result.jobs.map(j => [j.jobId, { status: 'queued' }])));
      setJobResults({});
      genStartRef.current = Date.now();
      setGenElapsed(0);
      setTeamIndex(0);
      setIsGeneratingView(true);
      startPolling(result.jobs);
    }
  };

  // ── Generating view helpers ───────────────────────────────────────────
  const genCompletedCount = Object.values(jobStatuses).filter(s => s.status === 'completed').length;
  const genFailedCount = Object.values(jobStatuses).filter(s => s.status === 'failed').length;
  const genTotalCount = generatingJobs.length;
  const genAllDone = genTotalCount > 0 && Object.values(jobStatuses).every(s => ['completed', 'failed', 'cancelled'].includes(s.status));
  const genProgressPercent = genTotalCount > 0 ? (genCompletedCount / genTotalCount) * 100 : 0;
  const estimatedTotal = genTotalCount * 8;
  const formatTime = (s: number) => { const m = Math.floor(s / 60); const sec = s % 60; return m > 0 ? `${m}m ${sec}s` : `${sec}s`; };
  const currentMember = TEAM_MEMBERS[teamIndex % TEAM_MEMBERS.length];

  // ── Generating view ───────────────────────────────────────────────────
  if (isGeneratingView) {
    const resultEntries = generatingJobs.map(job => ({ job, url: jobResults[job.jobId] })).filter(e => !!e.url) as Array<{ job: SwapJobInfo; url: string }>;
    const resultUrls = resultEntries.map(e => e.url);

    return (
      <div className="min-h-screen">
        <SEOHead title={genAllDone && genCompletedCount > 0 ? 'Your swapped scenes' : 'Swapping products…'} description="Your product swaps are being created." />
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
          <div className="text-center space-y-3">
            {sceneUrl && (
              <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border border-border bg-muted">
                <img src={getOptimizedUrl(sceneUrl, { quality: 70 })} alt={sceneTitle} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                {genAllDone && genCompletedCount > 0 ? 'Your swapped scenes' : 'Swapping Products…'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {genAllDone && genCompletedCount > 0
                  ? `${genCompletedCount} scene${genCompletedCount !== 1 ? 's' : ''} ready`
                  : `Generating ${genTotalCount} scene${genTotalCount !== 1 ? 's' : ''} with the same composition`}
              </p>
            </div>
          </div>

          {!genAllDone && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {genCompletedCount} of {genTotalCount} complete
                    {genFailedCount > 0 && <span className="text-destructive ml-1">({genFailedCount} failed)</span>}
                  </span>
                  <span className="font-mono text-muted-foreground">{formatTime(genElapsed)}</span>
                </div>
                <Progress value={Math.max(genProgressPercent, 5)} className="h-2 [&>div]:transition-all [&>div]:duration-1000 [&>div]:ease-linear" />
                <p className="text-xs text-muted-foreground">Est. {formatTime(Math.round(estimatedTotal * 0.8))} – {formatTime(Math.round(estimatedTotal * 1.2))} total</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Products</p>
                <div className="flex flex-wrap gap-2">
                  {generatingJobs.map(job => {
                    const s = jobStatuses[job.jobId];
                    const status = s?.status || 'queued';
                    return (
                      <div key={job.jobId} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                        status === 'completed' ? 'border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400'
                        : status === 'failed' ? 'border-destructive/30 bg-destructive/5 text-destructive'
                        : status === 'processing' ? 'border-primary/30 bg-primary/5 text-primary'
                        : 'border-border bg-muted/30 text-muted-foreground'}`}>
                        {status === 'completed' ? <CheckCircle className="w-4 h-4" /> : status === 'failed' ? <XCircle className="w-4 h-4" /> : status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                        <Package className="w-3.5 h-3.5" />
                        <span className="font-medium truncate max-w-[160px]">{job.productTitle}</span>
                        {job.ratio !== '1:1' && <span className="text-xs opacity-60">{job.ratio}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <Avatar className="w-8 h-8 border border-border">
                  <AvatarImage src={getOptimizedUrl(currentMember.avatar, { quality: 60 })} alt={currentMember.name} />
                  <AvatarFallback className="text-xs">{currentMember.name[0]}</AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground italic">
                  {currentMember.name} is {getStableStatusMessage(currentMember, teamIndex).toLowerCase()}
                </p>
              </div>
            </div>
          )}

          {!genAllDone && (
            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={() => { stopPolling(); setIsGeneratingView(false); toast.info('Generation continues in the background. Check your library for results.'); }} className="text-muted-foreground">
                Continue in background
              </Button>
            </div>
          )}

          {genAllDone && genCompletedCount > 0 && (
            <div className="space-y-6">
              {resultUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {resultEntries.map((entry, idx) => (
                    <button key={entry.job.jobId} type="button" onClick={() => setLightboxIndex(idx)}
                      className="group relative rounded-xl overflow-hidden border border-border bg-muted text-left transition-all hover:border-primary/50 hover:shadow-md">
                      <div className="aspect-square overflow-hidden">
                        <img src={getOptimizedUrl(entry.url, { quality: 75 })} alt={entry.job.productTitle}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 flex items-center gap-1.5 text-xs text-white">
                        <Package className="w-3.5 h-3.5" />
                        <span className="font-medium truncate">{entry.job.productTitle}</span>
                        {entry.job.ratio !== '1:1' && <span className="opacity-70 ml-auto">{entry.job.ratio}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {genFailedCount > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  {genFailedCount} swap{genFailedCount !== 1 ? 's' : ''} failed and credits were refunded
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button size="pill" onClick={() => {
                  setIsGeneratingView(false); setGeneratingJobs([]); setJobStatuses({}); setJobResults({});
                }}>
                  <Sparkles className="w-4 h-4 mr-2" />Generate more
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setIsGeneratingView(false); navigate('/app/library'); }}>
                  View in Library
                </Button>
              </div>
            </div>
          )}

          {genAllDone && genCompletedCount === 0 && (
            <div className="text-center space-y-3">
              <p className="text-sm text-destructive">All generations failed. Credits have been refunded.</p>
              <Button variant="outline" onClick={() => setIsGeneratingView(false)}>Try Again</Button>
            </div>
          )}
        </div>

        {lightboxIndex !== null && resultUrls.length > 0 && (
          <ImageLightbox
            images={resultUrls}
            currentIndex={lightboxIndex}
            open={lightboxIndex !== null}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
            onDownload={(idx) => {
              const url = resultUrls[idx]; if (!url) return;
              const a = document.createElement('a');
              a.href = url.includes('?') ? `${url}&download=` : `${url}?download=`;
              a.download = '';
              document.body.appendChild(a); a.click(); a.remove();
            }}
            onEdit={(idx) => {
              const url = resultUrls[idx]; if (!url) return;
              setLightboxIndex(null);
              navigate(`/app/freestyle?editImage=${encodeURIComponent(url)}&imageRole=edit`);
            }}
            onGenerateAngles={(idx) => {
              const url = resultUrls[idx]; if (!url) return;
              setLightboxIndex(null);
              navigate(`/app/perspectives?source=${encodeURIComponent(url)}`);
            }}
            productName={generatingJobs[lightboxIndex]?.productTitle}
          />
        )}
      </div>
    );
  }

  // ── Setup view ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <SEOHead title="Product Swap" description="Keep the exact scene and swap in any product from your library." />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/workflows')} className="gap-1.5 -ml-2 mb-1">
            <ArrowLeft className="w-4 h-4" />Visual Studio
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Replace className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Product Swap</h1>
              <p className="text-sm text-muted-foreground">
                Keep the exact scene — camera, lighting, background — and only swap in a different product
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Scene */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
            Choose the scene to keep
          </h2>

          {/* Source toggle */}
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: 'library', title: 'From Library', description: 'Pick a previous generation', icon: ImageLucide },
              { id: 'scratch', title: 'Upload Image', description: 'Use any image as the scene', icon: Upload },
            ] as const).map(opt => (
              <button key={opt.id} type="button"
                onClick={() => { setSceneSource(opt.id); setSceneUrl(null); setSceneTitle(''); }}
                className={`p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                  sceneSource === opt.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}>
                <div className="space-y-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    sceneSource === opt.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <opt.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{opt.title}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected scene preview */}
          {sceneUrl && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
              <img src={getOptimizedUrl(sceneUrl, { quality: 70 })} alt={sceneTitle} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Scene ready ✓</p>
                <p className="text-xs text-muted-foreground truncate">{sceneTitle}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setSceneUrl(null); setSceneTitle(''); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Library picker */}
          {sceneSource === 'library' && !sceneUrl && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search generated images..." value={librarySearch}
                  onChange={e => { setLibrarySearch(e.target.value); setLibraryVisibleCount(30); }} className="pl-9" />
              </div>
              {libraryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                  {filteredLibrary.slice(0, libraryVisibleCount).map(item => (
                    <div key={item.id} onClick={() => pickLibrary(item)}
                      className="relative rounded-xl border-2 p-1.5 cursor-pointer transition-all border-border hover:border-primary/50">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={getOptimizedUrl(item.imageUrl, { quality: 60 })} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-1 px-0.5">{item.title}</p>
                    </div>
                  ))}
                </div>
              )}
              {!libraryLoading && filteredLibrary.length > libraryVisibleCount && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" onClick={() => setLibraryVisibleCount(c => c + 30)}>
                    Load more ({filteredLibrary.length - libraryVisibleCount} remaining)
                  </Button>
                </div>
              )}
              {!libraryLoading && filteredLibrary.length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-sm">
                  No generated images found yet.
                </p>
              )}
            </div>
          )}

          {/* Scratch upload */}
          {sceneSource === 'scratch' && !sceneUrl && (
            <label
              onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file?.type.startsWith('image/')) handleSceneFile(file); }}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
              {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Upload the scene image</p>
                    <p className="text-xs text-muted-foreground">Drag & drop, paste, or click to browse</p>
                    <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/60 mt-1.5">
                      <ClipboardPaste className="w-3 h-3" />⌘V / Ctrl+V to paste from clipboard
                    </p>
                  </div>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" disabled={isUploading}
                onChange={(e) => { const file = e.target.files?.[0]; if (file) handleSceneFile(file); }} />
            </label>
          )}
        </section>

        {/* Step 2: Products */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
            Choose products to swap in
          </h2>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Each selected product becomes its own image, placed into the exact same scene above. The <span className="font-medium text-foreground">primary product image</span> is used as the visual reference.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={productSearch}
              onChange={e => { setProductSearch(e.target.value); setProductVisibleCount(12); }} className="pl-9" />
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant={selectedProductIds.size > 0 ? 'default' : 'secondary'}>
              {selectedProductIds.size} selected
            </Badge>
            <span className="text-xs text-muted-foreground">(max 10)</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
            {filteredProducts.slice(0, productVisibleCount).map(product => {
              const isSelected = selectedProductIds.has(product.id);
              return (
                <div key={product.id} onClick={() => toggleProduct(product.id)}
                  className={`relative rounded-xl border-2 p-1.5 cursor-pointer transition-all ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}>
                  <div className="absolute top-1.5 left-1.5 z-10 bg-background/90 rounded shadow-sm p-0.5">
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleProduct(product.id)} />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    {product.image_url ? (
                      <img src={getOptimizedUrl(product.image_url, { quality: 60 })} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                    )}
                  </div>
                  <p className="text-[10px] font-medium truncate mt-1">{product.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{product.product_type}</p>
                </div>
              );
            })}
          </div>
          {filteredProducts.length > productVisibleCount && (
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setProductVisibleCount(c => c + 12)}>
                Load more ({filteredProducts.length - productVisibleCount} remaining)
              </Button>
            </div>
          )}
          {filteredProducts.length === 0 && (
            <p className="text-center text-muted-foreground py-4 text-sm">
              No products found. <button className="text-primary underline" onClick={() => navigate('/app/products/new')}>Add one</button>
            </p>
          )}
        </section>

        {/* Step 3: Ratios */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</span>
            Aspect ratios
          </h2>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map(r => (
              <button key={r} onClick={() => toggleRatio(r)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedRatios.has(r) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                }`}>{r}</button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            For maximum scene fidelity, pick the ratio closest to your source scene.
          </p>
        </section>

        {/* Quality note */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            Every swap runs on <span className="font-semibold text-foreground">High Quality</span> ({PER_IMAGE_COST} credits/image) so the scene composition holds tight.
          </p>
        </div>

        {/* Generate bar */}
        <div className="sticky bottom-2 sm:bottom-4 z-50 max-w-3xl mx-auto">
          <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{totalImages}</span> images ·{' '}
                <span className="font-semibold text-foreground">{totalCost}</span> credits
              </div>
              {selectedProductIds.size > 0 && (
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                  {selectedProductIds.size} product{selectedProductIds.size !== 1 ? 's' : ''} × {selectedRatios.size} ratio{selectedRatios.size !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <Button size="pill" onClick={handleGenerate} disabled={!canGenerate || totalCost > credits} className="shadow-lg shadow-primary/10 w-full sm:w-auto">
              {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate {totalImages} image{totalImages !== 1 ? 's' : ''}</>}
            </Button>
          </div>
          {isGenerating && progress > 0 && <Progress value={progress} className="mt-2 h-1.5 rounded-full" />}
        </div>
      </div>

      <NoCreditsModal open={noCreditsOpen} onClose={() => setNoCreditsOpen(false)} category="fallback" />
    </div>
  );
}
