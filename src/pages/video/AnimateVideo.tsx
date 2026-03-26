import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Loader2, Sparkles, Brain, Wand2, CheckCircle2, Image, Clapperboard, Shirt, Flower2, Gem, Watch, Lamp, UtensilsCrossed, Smartphone, Dumbbell, Pill, Eye, ScanSearch, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Shirt, Sparkles, Flower2, Gem, Watch, Lamp,
  UtensilsCrossed, Smartphone, Dumbbell, Pill,
};
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ProductContextSelector } from '@/components/app/video/ProductContextSelector';
import { MotionGoalSelector } from '@/components/app/video/MotionGoalSelector';
import { MotionRefinementPanel } from '@/components/app/video/MotionRefinementPanel';
import { PreservationRulesPanel } from '@/components/app/video/PreservationRulesPanel';
import { AudioModeSelector } from '@/components/app/video/AudioModeSelector';
import { CreditEstimateBox } from '@/components/app/video/CreditEstimateBox';
import { ValidationWarnings, type ValidationWarning } from '@/components/app/video/ValidationWarnings';
import { VideoResultsPanel, type QuickVariationPreset } from '@/components/app/video/VideoResultsPanel';
import { PRODUCT_CATEGORIES, SCENE_TYPES, getMotionGoalsForCategory, getDefaultPreservation } from '@/lib/videoMotionRecipes';
import { estimateCredits } from '@/config/videoCreditPricing';
import { InfoTooltip } from '@/components/app/video/InfoTooltip';
import { useVideoProject } from '@/hooks/useVideoProject';
import { useFileUpload } from '@/hooks/useFileUpload';
import { TEAM_MEMBERS } from '@/data/teamData';
import { toast } from 'sonner';

type AspectRatio = '9:16' | '1:1' | '16:9';
type Duration = '5' | '10';
type AudioMode = 'silent' | 'ambient';

const TIPS_TEAM = TEAM_MEMBERS.filter(m => ['Sophia', 'Kenji', 'Zara', 'Leo'].includes(m.name));
const PROGRESS_TEAM = TEAM_MEMBERS.filter(m => ['Sophia', 'Kenji', 'Luna', 'Amara', 'Yuki'].includes(m.name));

const TIPS = [
  'Our AI team analyzes your image to build the perfect motion plan.',
  'Higher preservation = more brand-safe output. Adjust per shot.',
  'Use "Specific Motion Note" for precise control over movement.',
  'Match your aspect ratio to your channel for best results.',
];

export default function AnimateVideo() {
  const navigate = useNavigate();
  const {
    pipelineStage, videoUrl, videoError, elapsedSeconds, videoStatus,
    isAnalyzing, isBuildingPrompt, isGenerating, isComplete,
    analysisResult, isAnalyzingImage, analyzeImage,
    runAnimatePipeline, resetPipeline,
  } = useVideoProject();

  const { upload, isUploading, progress: uploadProgress } = useFileUpload();

  // Upload state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Minimum 5s staged analysis experience
  const [analysisCompleteData, setAnalysisCompleteData] = useState<any>(null);
  const [uploadCompleteTime, setUploadCompleteTime] = useState<number | null>(null);
  const [uiRevealReady, setUiRevealReady] = useState(false);

  // Simulated analysis step progress (0-3) — 1500ms pacing for ~4.5s total
  const [analysisStep, setAnalysisStep] = useState(0);
  const showAnalysisUI = isAnalyzingImage || (!!imageUrl && !uiRevealReady && !hasAnalyzed);

  useEffect(() => {
    if (!showAnalysisUI) { setAnalysisStep(0); return; }
    setAnalysisStep(0);
    const iv = setInterval(() => setAnalysisStep(s => Math.min(s + 1, 3)), 1500);
    return () => clearInterval(iv);
  }, [showAnalysisUI]);

  // Gate: when backend finishes early, wait until 5s from upload before revealing
  useEffect(() => {
    if (!analysisCompleteData || !uploadCompleteTime) return;
    const elapsed = Date.now() - uploadCompleteTime;
    const remaining = Math.max(0, 5000 - elapsed);
    const timer = setTimeout(() => setUiRevealReady(true), remaining);
    return () => clearTimeout(timer);
  }, [analysisCompleteData, uploadCompleteTime]);

  // When uiRevealReady flips, apply buffered analysis data
  useEffect(() => {
    if (!uiRevealReady || !analysisCompleteData) return;
    const analysis = analysisCompleteData;
    setHasAnalyzed(true);
    if (analysis.category) { setCategory(analysis.category); setDetectedCategory(analysis.category); }
    if (analysis.ecommerce_scene_type) { setSceneType(analysis.ecommerce_scene_type); setDetectedSceneType(analysis.ecommerce_scene_type); }
    if (analysis.recommended_motion_goals?.length) { setRecommendedGoalIds(analysis.recommended_motion_goals); setMotionGoalId(analysis.recommended_motion_goals[0]); }
    if (analysis.recommended_camera_motion) setCameraMotion(analysis.recommended_camera_motion);
    if (analysis.recommended_subject_motion) setSubjectMotion(analysis.recommended_subject_motion);
    if (analysis.recommended_realism) setRealismLevel(analysis.recommended_realism);
    if (analysis.recommended_loop_style) setLoopStyle(analysis.recommended_loop_style);
    if (analysis.risk_flags?.identity_sensitive || analysis.identity_sensitive) { setPreserveIdentity(true); setPreserveOutfit(true); }
    setAnalysisCompleteData(null);
    setUploadCompleteTime(null);
  }, [uiRevealReady, analysisCompleteData]);

  // Product Context
  const [category, setCategory] = useState('fashion_apparel');
  const [sceneType, setSceneType] = useState('studio_product');
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [detectedSceneType, setDetectedSceneType] = useState<string | null>(null);

  // Motion Goal
  const [motionGoalId, setMotionGoalId] = useState('');
  const [recommendedGoalIds, setRecommendedGoalIds] = useState<string[]>([]);

  // Refinements
  const [cameraMotion, setCameraMotion] = useState('slow_push_in');
  const [subjectMotion, setSubjectMotion] = useState('minimal');
  const [realismLevel, setRealismLevel] = useState('realistic');
  const [loopStyle, setLoopStyle] = useState('none');
  const [motionIntensity, setMotionIntensity] = useState<'low' | 'medium' | 'high'>('low');

  // Preservation
  const [preserveScene, setPreserveScene] = useState(true);
  const [preserveProductDetails, setPreserveProductDetails] = useState(true);
  const [preserveIdentity, setPreserveIdentity] = useState(false);
  const [preserveOutfit, setPreserveOutfit] = useState(false);

  // Settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<Duration>('5');
  const [audioMode, setAudioMode] = useState<AudioMode>('silent');
  const [userPrompt, setUserPrompt] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycling tip index
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(iv);
  }, []);

  // Cycling avatar for progress
  const [progressAvatarIdx, setProgressAvatarIdx] = useState(0);
  useEffect(() => {
    if (!isPipelineActive) return;
    const iv = setInterval(() => setProgressAvatarIdx(i => (i + 1) % PROGRESS_TEAM.length), 3000);
    return () => clearInterval(iv);
  }, [pipelineStage, videoStatus]);

  // When category or sceneType changes, update motion goals and preservation defaults
  useEffect(() => {
    const goals = getMotionGoalsForCategory(category, sceneType);
    if (goals.length > 0 && !goals.find(g => g.id === motionGoalId)) {
      setMotionGoalId(goals[0].id);
    }
    const pres = getDefaultPreservation(category, sceneType);
    setPreserveScene(pres.preserveScene);
    setPreserveProductDetails(pres.preserveProductDetails);
    setPreserveIdentity(pres.preserveIdentity);
    setPreserveOutfit(pres.preserveOutfit);
  }, [category, sceneType]);

  // When motion goal changes, apply its defaults
  useEffect(() => {
    const goals = getMotionGoalsForCategory(category, sceneType);
    const goal = goals.find(g => g.id === motionGoalId);
    if (goal) {
      setCameraMotion(goal.defaultCameraMotion);
      setSubjectMotion(goal.subjectMotion);
      setMotionIntensity(goal.defaultIntensity);
    }
  }, [motionGoalId, category, sceneType]);

  // Auto-analyze after upload
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newWarnings: ValidationWarning[] = [];
    if (file.size > 20 * 1024 * 1024) {
      newWarnings.push({ type: 'error', message: 'Image must be under 20MB.' });
      setWarnings(newWarnings);
      return;
    }
    if (file.type === 'image/png') {
      newWarnings.push({ type: 'info', message: 'Transparent PNGs may produce edge artifacts. Consider JPG.' });
    }

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    const url = await upload(file);
    if (url) {
      setImageUrl(url);
      setWarnings(newWarnings);
      setHasAnalyzed(false);
      setUiRevealReady(false);
      setAnalysisCompleteData(null);
      setUploadCompleteTime(Date.now());
      const analysis = await analyzeImage(url);
      if (analysis) {
        // Buffer the result — the useEffect gating logic will reveal after 5s minimum
        setAnalysisCompleteData(analysis);
      }
    }
  }, [upload, analyzeImage]);

  const removeImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    setWarnings([]);
    setHasAnalyzed(false);
    setDetectedCategory(null);
    setDetectedSceneType(null);
    setRecommendedGoalIds([]);
    setAnalysisCompleteData(null);
    setUploadCompleteTime(null);
    setUiRevealReady(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = () => {
    if (!imageUrl) { toast.error('Please upload an image first'); return; }

    runAnimatePipeline({
      imageUrl,
      category, sceneType, motionGoalId,
      cameraMotion, subjectMotion, realismLevel, loopStyle, motionIntensity,
      preserveScene, preserveProductDetails, preserveIdentity, preserveOutfit,
      aspectRatio, duration, audioMode,
      userPrompt: userPrompt || undefined,
    });
  };

  const handleReuse = () => resetPipeline();
  const handleNewProject = () => {
    resetPipeline();
    removeImage();
    setUserPrompt('');
  };

  const handleQuickVariation = (preset: QuickVariationPreset) => {
    if (!imageUrl) return;
    const changes = preset.changes;
    if (changes.motionIntensity) setMotionIntensity(changes.motionIntensity as 'low' | 'medium' | 'high');
    if (changes.cameraMotion) setCameraMotion(changes.cameraMotion);
    if (changes.realismLevel) setRealismLevel(changes.realismLevel);
    if (changes.loopStyle) setLoopStyle(changes.loopStyle);

    resetPipeline();
    setTimeout(() => {
      runAnimatePipeline({
        imageUrl,
        category, sceneType, motionGoalId,
        cameraMotion: changes.cameraMotion || cameraMotion,
        subjectMotion: changes.subjectMotion || subjectMotion,
        realismLevel: changes.realismLevel || realismLevel,
        loopStyle: changes.loopStyle || loopStyle,
        motionIntensity: (changes.motionIntensity || motionIntensity) as 'low' | 'medium' | 'high',
        preserveScene, preserveProductDetails, preserveIdentity, preserveOutfit,
        aspectRatio, duration, audioMode,
        userPrompt: userPrompt || undefined,
      });
    }, 50);
  };

  // Build generation context for results panel
  const buildGenerationContext = () => {
    const catLabel = PRODUCT_CATEGORIES.find(c => c.id === category)?.label || category;
    const sceneLabel = SCENE_TYPES.find(s => s.id === sceneType)?.label || sceneType;
    const goals = getMotionGoalsForCategory(category, sceneType);
    const goalTitle = goals.find(g => g.id === motionGoalId)?.title || motionGoalId;
    const credits = estimateCredits({ workflowType: 'animate', duration, audioMode, motionRecipe: cameraMotion });
    return {
      categoryLabel: catLabel,
      sceneTypeLabel: sceneLabel,
      motionGoalTitle: goalTitle,
      cameraMotion: cameraMotion.replace(/_/g, ' '),
      subjectMotion: subjectMotion.replace(/_/g, ' '),
      duration: `${duration}s`,
      audioMode: audioMode === 'silent' ? 'Silent' : 'Ambient',
      creditsUsed: credits,
      realismLevel: realismLevel.replace(/_/g, ' '),
      loopStyle: loopStyle === 'none' ? 'None' : loopStyle.replace(/_/g, ' '),
    };
  };

  const isPipelineActive = pipelineStage !== 'idle' && pipelineStage !== 'error' && !isComplete;

  const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
    { value: '9:16', label: '9:16' },
    { value: '1:1', label: '1:1' },
    { value: '16:9', label: '16:9' },
  ];

  const getStageMessage = () => {
    if (isAnalyzing) return { text: 'Analyzing your image...', sub: 'Understanding composition and product context' };
    if (isBuildingPrompt) return { text: 'Building motion plan...', sub: 'Applying category-aware motion strategy' };
    if (videoStatus === 'creating') return { text: 'Starting generation...', sub: 'Sending to video engine' };
    return { text: 'Generating your video...', sub: `Typically 1-3 minutes • ${elapsedSeconds}s elapsed` };
  };

  const currentProgressMember = PROGRESS_TEAM[progressAvatarIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Animate Image"
        subtitle="Turn a still product image into a polished commercial video."
        backAction={{ content: 'Video', onAction: () => navigate('/app/video') }}
      >
        <div />
      </PageHeader>

      {/* ──── PRE-UPLOAD: Premium First Screen ──── */}
      {!isPipelineActive && !isComplete && !imageUrl && (
        <>
          {/* Category Chips Row */}
          <div className="flex flex-wrap gap-1.5">
            {PRODUCT_CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICON_MAP[c.icon];
              return (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border border-border bg-muted/30 text-muted-foreground"
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  {c.label}
                </span>
              );
            })}
          </div>

          {/* Two-column layout: Upload Card + How It Works */}
          <div className="grid lg:grid-cols-[1fr_320px] gap-5">
            {/* Left: Premium Upload Card */}
            <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Upload your product image</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll detect category, scene type, and recommended motion automatically.
                </p>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-3 bg-muted/5 hover:bg-muted/10 group"
              >
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium text-foreground">Click to upload</span>
                      <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP — Max 20 MB</p>
                    </div>
                  </>
                )}
              </button>
            </div>

            {/* Right: How It Works + Best Results */}
            <div className="space-y-4">
              {/* How It Works */}
              <div className="rounded-2xl border border-border bg-card shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">How it works</h3>
                <div className="space-y-3">
                  {[
                    { icon: Upload, label: 'Upload your image', sub: 'Any product or campaign photo' },
                    { icon: Brain, label: 'VOVV detects context', sub: 'Category, scene type & motion' },
                    { icon: Wand2, label: 'Choose realistic motion', sub: 'Camera, subject & intensity' },
                    { icon: Clapperboard, label: 'Generate video', sub: 'Polished commercial animation' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <step.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground leading-tight">{step.label}</p>
                        <p className="text-xs text-muted-foreground">{step.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Results Tips */}
              <div className="rounded-2xl border border-border bg-card shadow-sm p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Best results</h3>
                <ul className="space-y-2">
                  {[
                    'Use clean, sharp product or campaign images',
                    'Keep the main subject clearly visible',
                    'Works best with one primary focus',
                    'Well-lit photos produce smoother motion',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Smart Assistant Tip (moved below) */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-4">
            <div className="flex -space-x-2 shrink-0">
              {TIPS_TEAM.map((m) => (
                <img
                  key={m.name}
                  src={m.avatar}
                  alt={m.name}
                  className="w-7 h-7 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground/70">VOVV.AI Studio</p>
              <p className="text-sm text-muted-foreground truncate" key={tipIndex}>
                {TIPS[tipIndex]}
              </p>
            </div>
          </div>
        </>
      )}

      {/* ──── POST-UPLOAD: Form with image preview + settings ──── */}
      {!isPipelineActive && !isComplete && imageUrl && (
        <div className="space-y-5">
          {/* Upload preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Upload Image</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30 max-w-sm">
              <img src={imagePreview!} alt="Upload" className="w-full aspect-square object-contain" />
              <button onClick={removeImage} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background">
                <X className="h-4 w-4" />
              </button>
              {isUploading && (
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <Progress value={uploadProgress} className="h-1" />
                </div>
              )}
            </div>
          </div>

          <ValidationWarnings warnings={warnings} />

          {/* Rich analysis loading state */}
          {isAnalyzingImage && (
            <div className="space-y-5">
              {/* Image preview + step progress */}
              <div className="grid sm:grid-cols-[200px_1fr] gap-4 rounded-2xl border border-border bg-card shadow-sm p-5">
                {/* Left: uploaded image with inline badge */}
                <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30">
                  {imagePreview && <img src={imagePreview} alt="Uploaded" className="w-full aspect-square object-contain" />}
                  <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    Image uploaded
                  </div>
                </div>

                {/* Right: step-based progress */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Understanding your image</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Detecting category, scene type, and realistic motion opportunities.</p>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { icon: CheckCircle2, label: 'Image uploaded' },
                      { icon: ScanSearch, label: 'Detecting category' },
                      { icon: Eye, label: 'Detecting scene type' },
                      { icon: Zap, label: 'Preparing motion recommendations' },
                    ].map((step, i) => {
                      const done = analysisStep > i;
                      const active = analysisStep === i;
                      return (
                        <div key={i} className="flex items-center gap-2.5">
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          ) : active ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                          )}
                          <span className={cn('text-sm', done ? 'text-foreground' : active ? 'text-foreground font-medium' : 'text-muted-foreground/60')}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detection preview fields */}
                  <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Detection Preview</p>
                    {[
                      { label: 'Category', ready: analysisStep > 1 },
                      { label: 'Scene type', ready: analysisStep > 2 },
                      { label: 'Motion goals', ready: analysisStep > 3 },
                    ].map((field) => (
                      <div key={field.label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{field.label}</span>
                        {field.ready ? (
                          <span className="text-foreground font-medium">detected</span>
                        ) : (
                          <span className="text-muted-foreground/50 italic">detecting…</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-muted-foreground">Usually takes a few seconds</p>
                </div>
              </div>

              {/* Dynamic assistant card */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-4">
                <div className="flex -space-x-2 shrink-0">
                  {TIPS_TEAM.map((m) => (
                    <img key={m.name} src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full border-2 border-background object-cover" />
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground/70">VOVV.AI Studio</p>
                  <p className="text-sm text-muted-foreground">We're detecting category, scene type, and the most realistic motion options for this image.</p>
                </div>
              </div>

              {/* Skeleton placeholders for upcoming sections */}
              <div className="space-y-4">
                {/* Product Context skeleton */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                </div>
                {/* Recommended Motion skeleton */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <Skeleton className="h-4 w-36" />
                  <div className="space-y-2">
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                  </div>
                </div>
                {/* Settings skeleton */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16 rounded-md" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show form sections after analysis */}
          {!isAnalyzingImage && (
            <>
              <ProductContextSelector
                category={category}
                sceneType={sceneType}
                onCategoryChange={setCategory}
                onSceneTypeChange={setSceneType}
                detectedCategory={detectedCategory}
                detectedSceneType={detectedSceneType}
              />

              <MotionGoalSelector
                category={category}
                sceneType={sceneType}
                selectedGoalId={motionGoalId}
                onChange={setMotionGoalId}
                recommendedGoalIds={recommendedGoalIds}
              />

              <MotionRefinementPanel
                cameraMotion={cameraMotion}
                subjectMotion={subjectMotion}
                realismLevel={realismLevel}
                loopStyle={loopStyle}
                motionIntensity={motionIntensity}
                onCameraMotionChange={setCameraMotion}
                onSubjectMotionChange={setSubjectMotion}
                onRealismLevelChange={setRealismLevel}
                onLoopStyleChange={setLoopStyle}
                onMotionIntensityChange={setMotionIntensity}
              />

              <PreservationRulesPanel
                preserveScene={preserveScene}
                preserveProductDetails={preserveProductDetails}
                preserveIdentity={preserveIdentity}
                preserveOutfit={preserveOutfit}
                onPreserveSceneChange={setPreserveScene}
                onPreserveProductDetailsChange={setPreserveProductDetails}
                onPreserveIdentityChange={setPreserveIdentity}
                onPreserveOutfitChange={setPreserveOutfit}
              />

              {/* Settings */}
              <div className="space-y-4 rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-medium text-foreground">Settings</h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-muted-foreground">Aspect Ratio</label>
                    <InfoTooltip text="Match your output channel. 9:16 for Reels/TikTok, 1:1 for feed posts, 16:9 for ads and web." />
                  </div>
                  <div className="flex gap-2">
                    {ASPECT_RATIOS.map((ar) => (
                      <button key={ar.value} onClick={() => setAspectRatio(ar.value)}
                        className={cn('px-3 py-1 rounded-md text-sm border transition-colors',
                          aspectRatio === ar.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/40'
                        )}>
                        {ar.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-muted-foreground">Duration</label>
                    <InfoTooltip text="Longer videos use more credits but allow more complex motion sequences." />
                  </div>
                  <div className="flex gap-2">
                    {(['5', '10'] as Duration[]).map((d) => (
                      <button key={d} onClick={() => setDuration(d)}
                        className={cn('px-3 py-1 rounded-md text-sm border transition-colors',
                          duration === d ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/40'
                        )}>
                        {d} seconds
                      </button>
                    ))}
                  </div>
                </div>

                <AudioModeSelector value={audioMode} onChange={(v) => setAudioMode(v as AudioMode)} />
              </div>

              {/* Specific Motion Note */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label className="text-sm font-medium text-foreground">
                    Specific Motion Note <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <InfoTooltip text="Add precise instructions like 'one basketball dribble' or 'gentle fabric sway at the hem'. Overrides may be softened if they conflict with preservation settings." />
                </div>
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Example: one realistic basketball dribble, controlled body movement, background stays static"
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
              </div>

              {/* Generate */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <CreditEstimateBox params={{ workflowType: 'animate', duration, audioMode, motionRecipe: cameraMotion }} />
                <Button onClick={handleGenerate} disabled={!imageUrl || isUploading} className="gap-2" size="lg">
                  <Sparkles className="h-4 w-4" />
                  Generate Video
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
