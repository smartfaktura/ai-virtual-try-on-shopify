import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Search, Upload, X, Sparkles, ArrowLeft, Image as ImageLucide,
  Loader2, Package, ClipboardPaste, CheckCircle, XCircle, Clock,
  Pencil, Download, Coins, ArrowRight,
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
import { downloadDropAsZip } from '@/lib/dropDownload';
import { TEAM_MEMBERS, getStableStatusMessage } from '@/data/teamData';
import type { Tables } from '@/integrations/supabase/types';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { CatalogStepper, type StepDef } from '@/components/app/catalog/CatalogStepper';
import { PageHeader } from '@/components/app/PageHeader';
import { cn } from '@/lib/utils';

type UserProduct = Tables<'user_products'>;
type SceneSource = 'library' | 'scratch' | null;

const RATIO_OPTIONS = ['1:1', '3:4', '4:5', '9:16'] as const;
type RatioOption = typeof RATIO_OPTIONS[number];
const PER_IMAGE_COST = 6;
const MAX_PRODUCTS = 50;

const STEP_DEFS: StepDef[] = [
  { number: 1, label: 'Scene', icon: ImageLucide },
  { number: 2, label: 'Products', icon: Package },
  { number: 3, label: 'Review', icon: Sparkles },
];

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
  const [sceneSource, setSceneSource] = useState<SceneSource>(initialScene ? 'scratch' : null);
  const [sceneUrl, setSceneUrl] = useState<string | null>(initialScene);
  const [sceneTitle, setSceneTitle] = useState<string>(initialScene ? 'Uploaded scene' : '');
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryVisibleCount, setLibraryVisibleCount] = useState(10);

  // ── Product state ─────────────────────────────────────────────────────
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState('');
  const [productVisibleCount, setProductVisibleCount] = useState(10);

  // ── Ratio (auto-detected from scene; not user-selectable) ─────────────
  const [detectedRatio, setDetectedRatio] = useState<RatioOption>('4:5');

  // ── Wizard step ───────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

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

  // ── SessionStorage persistence (survives Vite HMR reloads) ────────────
  // Hide floating support chat on this route
  useEffect(() => {
    document.body.setAttribute('data-hide-studio-chat', 'true');
    return () => document.body.removeAttribute('data-hide-studio-chat');
  }, []);

  const STORAGE_KEY = 'product-swap-wizard';
  const didHydrateRef = useRef(false);
  useEffect(() => {
    if (didHydrateRef.current) return;
    didHydrateRef.current = true;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.sceneUrl) { setSceneUrl(s.sceneUrl); setSceneTitle(s.sceneTitle || ''); setSceneSource(s.sceneSource || null); }
      if (Array.isArray(s.selectedProductIds)) setSelectedProductIds(new Set(s.selectedProductIds));
      if (s.currentStep === 1 || s.currentStep === 2 || s.currentStep === 3) setCurrentStep(s.currentStep);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    if (!didHydrateRef.current) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        sceneUrl, sceneTitle, sceneSource,
        selectedProductIds: Array.from(selectedProductIds),
        currentStep,
      }));
    } catch { /* ignore */ }
  }, [sceneUrl, sceneTitle, sceneSource, selectedProductIds, currentStep]);

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
          const dateLabel = new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const rawTitle = productTitle || workflowName || '';
          const title = (!rawTitle || rawTitle === 'Product Visuals') ? `Library · ${dateLabel}` : rawTitle;
          items.push({
            id: `job-${job.id}-${i}`,
            imageUrl: url,
            title,
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

  // ── Auto-detect closest ratio when scene changes ──────────────────────
  useEffect(() => {
    if (!sceneUrl) return;
    const img = new Image();
    img.onload = () => {
      const r = img.naturalWidth / img.naturalHeight;
      const ratioMap: Record<RatioOption, number> = { '1:1': 1, '3:4': 3 / 4, '4:5': 4 / 5, '9:16': 9 / 16 };
      let best: RatioOption = '4:5';
      let bestDiff = Infinity;
      for (const [k, v] of Object.entries(ratioMap) as [RatioOption, number][]) {
        const diff = Math.abs(Math.log(r / v));
        if (diff < bestDiff) { bestDiff = diff; best = k; }
      }
      setDetectedRatio(best);
    };
    img.src = sceneUrl;
  }, [sceneUrl]);



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
  const totalImages = selectedProductIds.size;
  const totalCost = totalImages * PER_IMAGE_COST;
  const canGenerate = !!sceneUrl && selectedProductIds.size > 0 && !isGenerating;

  // ── Handlers ──────────────────────────────────────────────────────────
  const toggleProduct = (id: string) => {
    const next = new Set(selectedProductIds);
    if (next.has(id)) next.delete(id);
    else if (next.size < MAX_PRODUCTS) next.add(id);
    setSelectedProductIds(next);
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
      ratios: [detectedRatio],
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
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      startPolling(result.jobs);
    }
  };

  // ── Generating view helpers ───────────────────────────────────────────
  const genCompletedCount = Object.values(jobStatuses).filter(s => s.status === 'completed').length;
  const genFailedCount = Object.values(jobStatuses).filter(s => s.status === 'failed').length;
  const genTotalCount = generatingJobs.length;
  const genAllDone = genTotalCount > 0 && Object.values(jobStatuses).every(s => ['completed', 'failed', 'cancelled'].includes(s.status));
  const genProgressPercent = genTotalCount > 0 ? (genCompletedCount / genTotalCount) * 100 : 0;
  const estimatedTotal = genTotalCount * 30;
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
                      <div key={job.jobId} className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl border text-sm transition-all ${
                        status === 'completed' ? 'border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400'
                        : status === 'failed' ? 'border-destructive/30 bg-destructive/5 text-destructive'
                        : status === 'processing' ? 'border-primary/30 bg-primary/5 text-primary'
                        : 'border-border bg-muted/30 text-muted-foreground'}`}>
                        <div className={`w-8 h-8 rounded-lg overflow-hidden bg-muted/60 shrink-0 ${status === 'processing' ? 'ring-2 ring-primary/40 ring-offset-1 ring-offset-background animate-pulse' : ''}`}>
                          {job.productImageUrl ? (
                            <img src={getOptimizedUrl(job.productImageUrl, { quality: 60 })} alt={job.productTitle} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-3.5 h-3.5 opacity-60" /></div>
                          )}
                        </div>
                        <span className="font-medium truncate max-w-[160px]">{job.productTitle}</span>
                        {job.ratio !== '1:1' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/5 opacity-70">{job.ratio}</span>}
                        {status === 'completed' ? <CheckCircle className="w-4 h-4 ml-auto" /> : status === 'failed' ? <XCircle className="w-4 h-4 ml-auto" /> : status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin ml-auto" /> : <Clock className="w-4 h-4 ml-auto opacity-60" />}
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
                        <span className="font-medium truncate">{entry.job.productTitle}</span>
                        {entry.job.ratio !== '1:1' && <span className="opacity-70 ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/15">{entry.job.ratio}</span>}
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
                  // Iterative loop: keep the scene, clear products, jump back to product picking
                  setSelectedProductIds(new Set());
                  setCurrentStep(2);
                  setIsGeneratingView(false); setGeneratingJobs([]); setJobStatuses({}); setJobResults({});
                }}>
                  <Sparkles className="w-4 h-4 mr-2" />Swap more products
                </Button>
                {resultEntries.length >= 2 && (
                  <Button
                    variant="outline"
                    size="pill"
                    onClick={async () => {
                      const t = toast.loading(`Packaging ${resultEntries.length} images…`);
                      try {
                        await downloadDropAsZip(
                          resultEntries.map((e) => ({
                            url: e.url,
                            workflow_name: 'Product Swap',
                            product_title: e.job.productTitle,
                            scene_name: sceneTitle || 'Scene',
                          })),
                          `product-swap-${new Date().toISOString().slice(0, 10)}`,
                        );
                        toast.dismiss(t);
                        toast.success(`Downloaded ${resultEntries.length} images`);
                      } catch {
                        toast.dismiss(t);
                        toast.error('Download failed');
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />Download all ({resultEntries.length})
                  </Button>
                )}
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




  // ── Step guards ───────────────────────────────────────────────────────
  const canAdvanceFrom1 = !!sceneUrl;
  const canAdvanceFrom2 = selectedProductIds.size > 0;
  const goToStep = (s: 1 | 2 | 3) => {
    if (s === 2 && !canAdvanceFrom1) return;
    if (s === 3 && (!canAdvanceFrom1 || !canAdvanceFrom2)) return;
    setCurrentStep(s);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const selectedProducts = products.filter(p => selectedProductIds.has(p.id));
  const creditsShort = Math.max(0, totalCost - credits);
  const canAfford = credits >= totalCost;

  const canNavigateTo = (n: number) =>
    n === 1 ||
    (n === 2 && canAdvanceFrom1) ||
    (n === 3 && canAdvanceFrom1 && canAdvanceFrom2);

  // ── Setup view ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-36 overflow-x-clip max-w-full min-w-0">
      <SEOHead title="Product Swap" description="Keep the exact scene and swap in any product from your library." />

      <Button variant="ghost" size="sm" onClick={() => navigate('/app/workflows')} className="gap-1.5 -ml-2 self-start">
        <ArrowLeft className="w-4 h-4" />Visual Studio
      </Button>

      <PageHeader
        title="Product Swap"
        subtitle="Same scene, different product"
      >
        <span />
      </PageHeader>

      <CatalogStepper
        steps={STEP_DEFS}
        currentStep={currentStep}
        canNavigateTo={canNavigateTo}
        onStepClick={(s) => goToStep(s as 1 | 2 | 3)}
      />


        {/* ═══════════ STEP 1: SCENE ═══════════ */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <h2 className="text-lg font-semibold text-foreground">Pick the scene you want to reuse</h2>

            {products.length === 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl border border-dashed border-border bg-muted/30">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">No products yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">You'll need at least one product to swap into your scene</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0" onClick={() => navigate('/app/products/new')}>
                  Add product<ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}

            {/* Selected scene preview */}
            {sceneUrl && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
                <img src={getOptimizedUrl(sceneUrl, { quality: 70 })} alt={sceneTitle} className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {sceneSource === 'scratch' ? 'Uploaded image' : 'Library scene'}
                  </p>
                  {sceneTitle && sceneSource !== 'scratch' && (
                    <p className="text-xs text-muted-foreground truncate">{sceneTitle}</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setSceneUrl(null); setSceneTitle(''); }}>
                  <X className="w-4 h-4 mr-1" />Change
                </Button>
              </div>
            )}

            {/* Default view: library grid + small upload entry */}
            {!sceneUrl && sceneSource !== 'scratch' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 py-1 px-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-[18px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search generated images..." value={librarySearch}
                      onChange={e => { setLibrarySearch(e.target.value); setLibraryVisibleCount(10); }}
                      className="pl-11 pr-4 h-11 rounded-full text-sm" />
                  </div>
                  <Button variant="outline" size="pill" className="gap-1.5 shrink-0 h-11"
                    onClick={() => { setSceneSource('scratch'); setSceneUrl(null); setSceneTitle(''); }}>
                    <Upload className="w-4 h-4" />Upload
                  </Button>
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
                    <Button variant="outline" size="sm" onClick={() => setLibraryVisibleCount(c => c + 10)}>
                      Load more ({filteredLibrary.length - libraryVisibleCount} remaining)
                    </Button>
                  </div>
                )}
                {!libraryLoading && filteredLibrary.length === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    No generated images found yet
                  </p>
                )}
              </div>
            )}

            {/* Scratch upload */}
            {sceneSource === 'scratch' && !sceneUrl && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <button type="button" onClick={() => setSceneSource(null)}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" />Back to library
                </button>
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
              </div>
            )}

            {/* Detected ratio (read-only — strictly mirrors uploaded scene) */}
            {sceneUrl && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-200">
                <span>Aspect ratio</span>
                <Badge variant="secondary" className="h-5 text-[10px] font-medium">{detectedRatio}</Badge>
                <span className="opacity-60">· matched to your scene</span>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ STEP 2: PRODUCTS ═══════════ */}
        {currentStep === 2 && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h2 className="text-lg font-semibold text-foreground">Choose products to swap in</h2>

            <div className="sticky top-0 z-10 -mx-1 px-1 pt-2 pb-3 space-y-2 bg-background">

              <div className="relative py-1 px-1">
                <Search className="absolute left-[18px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search products..." value={productSearch}
                  onChange={e => { setProductSearch(e.target.value); setProductVisibleCount(10); }}
                  className="pl-11 pr-4 h-11 rounded-full text-sm" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedProductIds.size > 0 ? 'default' : 'secondary'}>
                    {selectedProductIds.size} / {MAX_PRODUCTS} selected
                  </Badge>
                  {selectedProductIds.size > 0 && (
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2"
                      onClick={() => setSelectedProductIds(new Set())}>
                      Clear
                    </Button>
                  )}
                </div>
                {filteredProducts.length > 0 && (() => {
                  const visible = filteredProducts.slice(0, productVisibleCount);
                  const allVisibleSelected = visible.length > 0 && visible.every(p => selectedProductIds.has(p.id));
                  return (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        const next = new Set(selectedProductIds);
                        if (allVisibleSelected) {
                          for (const p of visible) next.delete(p.id);
                        } else {
                          for (const p of visible) {
                            if (next.size >= MAX_PRODUCTS) break;
                            next.add(p.id);
                          }
                        }
                        setSelectedProductIds(next);
                      }}
                    >
                      {allVisibleSelected ? 'Unselect visible' : 'Select visible'}
                    </Button>
                  );
                })()}
              </div>
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
                <Button variant="outline" size="sm" onClick={() => setProductVisibleCount(c => c + 10)}>
                  Load more ({filteredProducts.length - productVisibleCount} remaining)
                </Button>
              </div>
            )}
            {filteredProducts.length === 0 && products.length > 0 && (
              <p className="text-center text-muted-foreground py-4 text-sm">
                No products match your search
              </p>
            )}
            {products.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-foreground">No products in your library yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Upload a product photo (PNG or JPG, ideally on a clean background). It becomes the reference we swap into your scene.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Button size="sm" onClick={() => navigate('/app/products/new')}>
                    Add your first product
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/app/learn')}>
                    Learn how it works
                  </Button>
                </div>
              </div>
            )}

            {/* Selected tray — matches floating bar aesthetic */}
            {selectedProducts.length > 0 && (() => {
              const DESKTOP_CAP = 8;
              const overflowDesktop = Math.max(0, selectedProducts.length - DESKTOP_CAP);
              return (
                <div className="hidden sm:block sticky bottom-24 z-20">
                  <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg px-3 py-2 flex items-center gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
                      Selected ({selectedProducts.length})
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {/* Desktop only — outer wrapper hides on mobile */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        {selectedProducts.slice(0, DESKTOP_CAP).map(p => (
                          <div key={p.id} className="relative group shrink-0">
                            <div className="w-8 h-8 rounded-md overflow-hidden border border-border bg-muted">
                              {p.image_url ? (
                                <img src={getOptimizedUrl(p.image_url, { quality: 60 })} alt={p.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><Package className="w-3 h-3 text-muted-foreground" /></div>
                              )}
                            </div>
                            <button type="button" onClick={() => toggleProduct(p.id)}
                              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-background border border-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
                              aria-label={`Remove ${p.title}`}>
                              <X className="w-2 h-2" />
                            </button>
                          </div>
                        ))}
                        {overflowDesktop > 0 && (
                          <div className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
                            +{overflowDesktop}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ═══════════ STEP 3: REVIEW ═══════════ */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <h2 className="text-lg font-semibold text-foreground">Review and generate</h2>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4 md:gap-5 items-start">
              {/* Left: summary */}
              <div className="space-y-4">
                {/* Scene card */}
                <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scene</h3>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => goToStep(1)}>
                      <Pencil className="w-3 h-3 mr-1" />Edit
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    {sceneUrl && (
                      <img src={getOptimizedUrl(sceneUrl, { quality: 70 })} alt={sceneTitle} className="w-20 h-20 rounded-lg object-cover border border-border" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {sceneSource === 'scratch' ? 'Uploaded image' : 'Library scene'}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <Badge variant="secondary" className="text-[10px] h-5">{detectedRatio}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products card */}
                <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Products ({selectedProducts.length})</h3>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => goToStep(2)}>
                      <Pencil className="w-3 h-3 mr-1" />Edit
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map(p => (
                      <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 border border-border">
                        <div className="w-8 h-8 rounded overflow-hidden bg-muted shrink-0">
                          {p.image_url ? (
                            <img src={getOptimizedUrl(p.image_url, { quality: 60 })} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-3 h-3 text-muted-foreground" /></div>
                          )}
                        </div>
                        <span className="text-xs font-medium text-foreground truncate max-w-[140px]">{p.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: cost summary */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 md:sticky md:top-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cost summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Products</span><span className="text-foreground font-medium">{selectedProducts.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Aspect ratio</span><span className="text-foreground font-medium">{detectedRatio}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Images</span><span className="text-foreground font-medium">{totalImages}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cost per image</span><span className="text-foreground font-medium">{PER_IMAGE_COST} credits</span></div>
                </div>
                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-foreground">{totalCost} credits</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Your balance</span>
                    <span className="text-muted-foreground">{credits} credits</span>
                  </div>
                  {totalCost <= credits ? (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">After generation</span>
                      <span className="text-muted-foreground">{credits - totalCost} credits</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-destructive">
                      <span>You need {creditsShort} more credit{creditsShort !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                
                {isGenerating && progress > 0 && <Progress value={progress} className="h-1.5 rounded-full" />}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ FLOATING STICKY BAR (matches Product Images aesthetic) ═══════════ */}
        <div className="sticky bottom-4 z-30 pb-[env(safe-area-inset-bottom)]">
          <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden">
            {/* Mobile: stacked */}
            <div className="flex flex-col gap-2 p-3 sm:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map(s => (
                      <div key={s} className={cn(
                        'w-1.5 h-1.5 rounded-full transition-colors',
                        s === currentStep ? 'bg-primary scale-125' : s < currentStep ? 'bg-primary/40' : 'bg-border'
                      )} />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {STEP_DEFS.find(s => s.number === currentStep)?.label}
                  </span>
                </div>
                {totalCost > 0 && (
                  <div className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted border border-border">
                    <Coins className="w-3 h-3 text-primary" />
                    <span className={cn('font-bold', canAfford ? 'text-foreground' : 'text-destructive')}>{totalCost}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <Button variant="outline" size="pill" className="flex-shrink-0"
                    onClick={() => goToStep((currentStep - 1) as 1 | 2)}>Back</Button>
                )}
                {currentStep < 3 ? (
                  <Button size="pill"
                    disabled={(currentStep === 1 && !canAdvanceFrom1) || (currentStep === 2 && !canAdvanceFrom2)}
                    onClick={() => goToStep((currentStep + 1) as 2 | 3)}
                    className="gap-1.5 flex-1">
                    Continue<ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Button size="pill"
                    disabled={isGenerating || (canAfford && !canGenerate)}
                    onClick={!canAfford ? () => setNoCreditsOpen(true) : handleGenerate}
                    className="gap-1.5 flex-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isGenerating ? 'Generating…' : !canAfford ? 'Upgrade' : `Generate ${totalImages || ''}`.trim()}
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop: single row */}
            <div className="hidden sm:flex items-center justify-between gap-3 p-3 sm:p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      s === currentStep ? 'bg-primary scale-125' : s < currentStep ? 'bg-primary/40' : 'bg-border'
                    )} />
                  ))}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {STEP_DEFS.find(s => s.number === currentStep)?.label}
                </span>
                <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                  {selectedProductIds.size > 0 && (
                    <span className="font-medium text-foreground">
                      {selectedProductIds.size} product{selectedProductIds.size !== 1 ? 's' : ''}
                    </span>
                  )}
                  {totalImages > 0 && (
                    <>
                      <span>·</span>
                      <span className="font-bold text-foreground">{totalImages} img{totalImages !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
              </div>

              {totalCost > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted border border-border">
                    <Coins className="w-3.5 h-3.5 text-primary" />
                    <span className={cn('font-bold', canAfford ? 'text-foreground' : 'text-destructive')}>{totalCost}</span>
                    <span className="text-muted-foreground">cr</span>
                  </div>
                  {!canAfford && <span className="text-xs text-destructive font-medium">Not enough credits</span>}
                </div>
              )}

              <div className="flex items-center gap-2 flex-shrink-0">
                {currentStep > 1 && (
                  <Button variant="outline" size="pill" onClick={() => goToStep((currentStep - 1) as 1 | 2)}>Back</Button>
                )}
                {currentStep < 3 ? (
                  <Button size="pill"
                    disabled={(currentStep === 1 && !canAdvanceFrom1) || (currentStep === 2 && !canAdvanceFrom2)}
                    onClick={() => goToStep((currentStep + 1) as 2 | 3)}
                    className="gap-1.5">
                    Continue<ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Button size="pill"
                    disabled={isGenerating || (canAfford && !canGenerate)}
                    onClick={!canAfford ? () => setNoCreditsOpen(true) : handleGenerate}
                    className="gap-1.5">
                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {isGenerating ? 'Generating…' : !canAfford ? 'Upgrade for more credits' : `Generate ${totalImages} image${totalImages !== 1 ? 's' : ''}`}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>



      <NoCreditsModal open={noCreditsOpen} onClose={() => setNoCreditsOpen(false)} category="fallback" />
    </div>
  );
}
