import { useState, useEffect, useMemo } from 'react';
import { Loader2, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { QueueJob, GenerationMeta } from '@/hooks/useGenerationQueue';
import { TEAM_MEMBERS } from '@/data/teamData';

interface QueuePositionIndicatorProps {
  job: QueueJob;
  onCancel?: () => void;
}

function estimateSeconds(meta?: GenerationMeta): number {
  if (!meta) return 90; // Pro model default
  let estimate = 20; // base
  estimate += meta.imageCount * 12;
  if (meta.quality === 'high') estimate += 20;
  if (meta.hasModel) estimate += 30; // Pro model is much slower
  if (meta.hasScene) estimate += 8;
  if (meta.hasProduct) estimate += 8;
  const refCount = [meta.hasModel, meta.hasScene, meta.hasProduct].filter(Boolean).length;
  if (refCount >= 2) estimate += 15;
  return estimate;
}

function getComplexityHint(meta?: GenerationMeta): string | null {
  if (!meta) return null;
  const refCount = [meta.hasModel, meta.hasScene, meta.hasProduct].filter(Boolean).length;
  if (refCount >= 2) return 'Multiple references increase complexity';
  if (meta.hasModel) return 'Model reference adds processing time';
  return null;
}

function getProModelHint(meta?: GenerationMeta): string | null {
  if (!meta) return 'Using Pro model for best quality';
  return null;
}

function getOvertimeMessage(ratio: number): string | null {
  if (ratio >= 2) return 'Almost there — high-quality results take a little extra time…';
  if (ratio >= 1.5) return 'Complex generation in progress — your studio team is perfecting the details…';
  if (ratio >= 1) return 'Taking a bit longer than usual — still working on it…';
  return null;
}

function formatEstimateRange(seconds: number): string {
  const low = Math.round(seconds * 0.8);
  const high = Math.round(seconds * 1.2);
  if (high <= 30) return `~${low}-${high} seconds`;
  return `~${Math.round(low / 5) * 5}-${Math.round(high / 5) * 5} seconds`;
}

function ProcessingState({ job }: { job: QueueJob }) {
  const [elapsed, setElapsed] = useState(0);
  const [teamIndex, setTeamIndex] = useState(0);

  const estimatedSeconds = useMemo(
    () => estimateSeconds(job.generationMeta),
    [job.generationMeta]
  );

  // Elapsed timer
  useEffect(() => {
    const startTime = job.started_at || job.created_at;
    const start = new Date(startTime).getTime();

    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [job.started_at, job.created_at]);

  // Rotating team messages every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setTeamIndex(prev => (prev + 1) % TEAM_MEMBERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const ratio = elapsed / estimatedSeconds;
  // Progress: normal up to 90%, then crawl to 95% in overtime
  const progress = ratio <= 1
    ? Math.min(ratio * 90, 90)
    : Math.min(90 + (ratio - 1) * 5, 95);
  const currentMember = TEAM_MEMBERS[teamIndex];
  const overtimeMsg = getOvertimeMessage(ratio);
  const complexityHint = getComplexityHint(job.generationMeta);
  const proModelHint = getProModelHint(job.generationMeta);
  const isStuck = elapsed > 300; // 5 minutes

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {isStuck
              ? 'This is taking unusually long — retrying automatically…'
              : (overtimeMsg || 'Generating your images…')}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              Est. {formatEstimateRange(estimatedSeconds)}
            </span>
            <span className="text-xs text-muted-foreground/60">·</span>
            <span className="text-xs font-mono text-muted-foreground">{elapsed}s elapsed</span>
          </div>
          {(complexityHint || proModelHint) && (
            <p className="hidden sm:block text-[11px] text-muted-foreground/70 mt-0.5">{complexityHint || proModelHint}</p>
          )}
        </div>
      </div>

      {/* Rotating team message */}
      <div className="hidden sm:flex items-center gap-2.5 pl-0.5 transition-opacity duration-500">
        <Avatar className="w-6 h-6 border border-border">
          <AvatarImage src={currentMember.avatar} alt={currentMember.name} />
          <AvatarFallback className="text-[10px]">{currentMember.name[0]}</AvatarFallback>
        </Avatar>
        <p className="text-xs text-muted-foreground italic">
          {currentMember.name} is {currentMember.statusMessage.toLowerCase()}
        </p>
      </div>

      <Progress
        value={progress}
        className="h-1.5 [&>div]:transition-all [&>div]:duration-1000 [&>div]:ease-linear"
      />
    </div>
  );
}

export function QueuePositionIndicator({ job, onCancel }: QueuePositionIndicatorProps) {
  if (job.status === 'completed') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Generation complete!</p>
          <p className="text-xs text-muted-foreground">Your images are ready</p>
        </div>
      </div>
    );
  }

  if (job.status === 'failed') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
        <XCircle className="w-5 h-5 text-destructive shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Generation failed</p>
          <p className="text-xs text-muted-foreground">{job.error_message || 'An error occurred. Credits have been refunded.'}</p>
        </div>
      </div>
    );
  }

  if (job.status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted border border-border">
        <Ban className="w-5 h-5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Generation cancelled</p>
          <p className="text-xs text-muted-foreground">Credits have been refunded</p>
        </div>
      </div>
    );
  }

  if (job.status === 'processing') {
    return <ProcessingState job={job} />;
  }

  // Queued
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
      <Clock className="w-5 h-5 text-amber-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {job.position === 0
            ? 'Your job is next in queue…'
            : `Your job is #${job.position + 1} in queue…`}
        </p>
        <p className="text-xs text-muted-foreground">
          Estimated wait: {job.position === 0 ? 'starting soon' : `~${Math.max(1, job.position)} min`}
        </p>
        <Progress value={10} className="mt-2 h-1.5" />
      </div>
      {onCancel && (
        <Button variant="ghost" size="sm" onClick={onCancel} className="shrink-0 text-xs">
          Cancel
        </Button>
      )}
    </div>
  );
}
