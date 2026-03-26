import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Loader2, Sparkles, Brain, Wand2 } from 'lucide-react';
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
import { PRODUCT_CATEGORIES, SCENE_TYPES, getMotionGoalsForCategory as getGoals } from '@/lib/videoMotionRecipes';
import { estimateCredits } from '@/config/videoCreditPricing';
import { InfoTooltip } from '@/components/app/video/InfoTooltip';
import { useVideoProject } from '@/hooks/useVideoProject';
import { useFileUpload } from '@/hooks/useFileUpload';
import { getMotionGoalsForCategory, getDefaultPreservation } from '@/lib/videoMotionRecipes';
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
      const analysis = await analyzeImage(url);
      if (analysis) {
        setHasAnalyzed(true);
        if (analysis.category) {
          setCategory(analysis.category);
          setDetectedCategory(analysis.category);
        }
        if (analysis.ecommerce_scene_type) {
          setSceneType(analysis.ecommerce_scene_type);
          setDetectedSceneType(analysis.ecommerce_scene_type);
        }
        if (analysis.recommended_motion_goals?.length) {
          setRecommendedGoalIds(analysis.recommended_motion_goals);
          setMotionGoalId(analysis.recommended_motion_goals[0]);
        }
        if (analysis.recommended_camera_motion) setCameraMotion(analysis.recommended_camera_motion);
        if (analysis.recommended_subject_motion) setSubjectMotion(analysis.recommended_subject_motion);
        if (analysis.recommended_realism) setRealismLevel(analysis.recommended_realism);
        if (analysis.recommended_loop_style) setLoopStyle(analysis.recommended_loop_style);
        if (analysis.risk_flags?.identity_sensitive || analysis.identity_sensitive) {
          setPreserveIdentity(true);
          setPreserveOutfit(true);
        }
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
    const goals = getGoals(category, sceneType);
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
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Animate Image"
        subtitle="Turn a still product image into a polished commercial video."
        backAction={{ content: 'Video', onAction: () => navigate('/app/video') }}
      >
        <div />
      </PageHeader>

      {/* VOVV.AI Team Tips Banner */}
      {!isPipelineActive && !isComplete && (
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
      )}

      {/* Results */}
      {isComplete && videoUrl && (
        <VideoResultsPanel
          videoUrl={videoUrl}
          sourceImageUrl={imagePreview || undefined}
          generationContext={buildGenerationContext()}
          onReuse={handleReuse}
          onVariation={handleGenerate}
          onNewProject={handleNewProject}
          onQuickVariation={handleQuickVariation}
        />
      )}

      {/* Pipeline progress — branded takeover */}
      {isPipelineActive && (() => {
        const stage = getStageMessage();
        return (
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-5">
            {/* VOVV.AI Studio label */}
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">VOVV.AI Studio</p>

            {/* Cycling team avatar */}
            <div className="relative mx-auto w-14 h-14">
              {PROGRESS_TEAM.map((m, i) => (
                <img
                  key={m.name}
                  src={m.avatar}
                  alt={m.name}
                  className={cn(
                    'absolute inset-0 w-14 h-14 rounded-full border-2 border-primary/30 object-cover transition-opacity duration-700',
                    i === progressAvatarIdx ? 'opacity-100' : 'opacity-0'
                  )}
                />
              ))}
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                <Loader2 className="h-2.5 w-2.5 animate-spin text-primary-foreground" />
              </div>
            </div>

            {/* Team member status message */}
            <p className="text-xs text-muted-foreground/60 italic">
              {currentProgressMember.name}: "{currentProgressMember.statusMessage}"
            </p>

            {/* Stage info */}
            <div>
              <p className="font-medium text-foreground">{stage.text}</p>
              <p className="text-sm text-muted-foreground mt-1">{stage.sub}</p>
            </div>

            {isGenerating && (
              <Progress value={Math.min((elapsedSeconds / 120) * 100, 95)} className="h-1.5 max-w-xs mx-auto" />
            )}
          </div>
        );
      })()}

      {/* Error */}
      {(pipelineStage === 'error' || videoStatus === 'error') && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{videoError || 'Generation failed'}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={resetPipeline}>Try Again</Button>
        </div>
      )}

      {/* Main form */}
      {!isPipelineActive && !isComplete && (
        <div className="space-y-5">
          {/* Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Upload Image</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30 max-w-sm">
                <img src={imagePreview} alt="Upload" className="w-full aspect-square object-contain" />
                <button onClick={removeImage} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background">
                  <X className="h-4 w-4" />
                </button>
                {isUploading && (
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <Progress value={uploadProgress} className="h-1" />
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full max-w-sm aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 bg-muted/10"
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload image</span>
                    <span className="text-xs text-muted-foreground/60">JPG, PNG, WebP - Max 20MB</span>
                  </>
                )}
              </button>
            )}
          </div>

          <ValidationWarnings warnings={warnings} />

          {/* Analyzing indicator */}
          {isAnalyzingImage && (
            <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <Brain className="h-5 w-5 animate-pulse text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Analyzing your image...</p>
                <p className="text-xs text-muted-foreground">Detecting product category and scene type</p>
              </div>
            </div>
          )}

          {/* Show form sections after upload */}
          {imageUrl && !isAnalyzingImage && (
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
