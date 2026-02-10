import { useState, useEffect } from 'react';
import { Download, Expand, Trash2, Wand2, Copy, ShieldAlert, X, Pencil, Camera, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { AddSceneModal } from '@/components/app/AddSceneModal';
import { AddModelModal } from '@/components/app/AddModelModal';

import avatarSophia from '@/assets/team/avatar-sophia.jpg';
import avatarLuna from '@/assets/team/avatar-luna.jpg';
import avatarKenji from '@/assets/team/avatar-kenji.jpg';

const STUDIO_CREW = [
  { name: 'Sophia', avatar: avatarSophia },
  { name: 'Luna', avatar: avatarLuna },
  { name: 'Kenji', avatar: avatarKenji },
] as const;

const STATUS_MESSAGES = [
  'Setting up the lighting…',
  'Composing the scene…',
  'Styling the shot…',
  'Refining the details…',
  'Adjusting the colors…',
  'Adding finishing touches…',
];

export interface BlockedEntry {
  id: string;
  prompt: string;
  reason: string;
}

interface GalleryImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio?: string;
}

interface FreestyleGalleryProps {
  images: GalleryImage[];
  onDownload: (imageUrl: string, index: number) => void;
  onExpand: (index: number) => void;
  onDelete?: (imageId: string) => void;
  onCopyPrompt?: (prompt: string) => void;
  generatingCount?: number;
  generatingProgress?: number;
  blockedEntries?: BlockedEntry[];
  onDismissBlocked?: (id: string) => void;
  onEditBlockedPrompt?: (prompt: string) => void;
}

function GeneratingCard({ progress = 0, className }: { progress?: number; className?: string }) {
  const [crew] = useState(() => STUDIO_CREW[Math.floor(Math.random() * STUDIO_CREW.length)]);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsgIdx(i => (i + 1) % STATUS_MESSAGES.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden flex flex-col items-center justify-center gap-5 px-8',
        'border border-border/30 min-h-[300px] w-full h-full',
        'bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer',
        className,
      )}
    >
      {/* Avatar with glow ring */}
      <div className="relative">
        <div className="absolute -inset-1.5 rounded-full bg-primary/20 animate-[pulse_2s_ease-in-out_infinite]" />
        <img
          src={crew.avatar}
          alt={crew.name}
          className="relative w-16 h-16 rounded-full object-cover ring-2 ring-primary/40"
        />
      </div>

      {/* Status text */}
      <div className="text-center space-y-1.5 min-h-[3.5rem]">
        <p className="text-sm font-medium text-foreground/70">
          {crew.name} is working on this…
        </p>
        <p className="text-sm text-muted-foreground/60 transition-opacity duration-300">
          {STATUS_MESSAGES[msgIdx]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[200px] space-y-2">
        <Progress value={progress} className="h-1" />
        <p className="text-xs text-muted-foreground/40 text-center">Usually 10–20s</p>
      </div>
    </div>
  );
}

function ContentBlockedCard({
  entry,
  onDismiss,
  onEditPrompt,
  className,
}: {
  entry: BlockedEntry;
  onDismiss?: (id: string) => void;
  onEditPrompt?: (prompt: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden flex flex-col items-center justify-center gap-5 px-8',
        'border border-border/30 min-h-[300px] w-full h-full',
        'bg-gradient-to-br from-muted/50 via-muted/70 to-muted/50',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border/40">
        <ShieldAlert className="w-5 h-5 text-muted-foreground/50" />
      </div>

      <div className="text-center space-y-1.5 max-w-[240px]">
        <h3 className="text-sm font-medium text-foreground/70">Couldn't generate</h3>
        <p className="text-xs text-muted-foreground/50 leading-relaxed">Content policy · try rephrasing</p>
      </div>

      <div className="flex items-center gap-2">
        {onEditPrompt && (
          <button
            onClick={() => onEditPrompt(entry.prompt)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-foreground/5 text-foreground/60 hover:bg-foreground/10 transition-colors border border-border/30"
          >
            <Pencil className="w-3 h-3" />
            Rephrase
          </button>
        )}
        {onDismiss && (
          <button
            onClick={() => onDismiss(entry.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground/50 hover:text-muted-foreground/70 hover:bg-foreground/5 transition-colors"
          >
            <X className="w-3 h-3" />
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
function ImageCard({
  img,
  idx,
  onDownload,
  onExpand,
  onDelete,
  onCopyPrompt,
  className,
  natural,
}: {
  img: GalleryImage;
  idx: number;
  onDownload: (imageUrl: string, index: number) => void;
  onExpand: (index: number) => void;
  onDelete?: (imageId: string) => void;
  onCopyPrompt?: (prompt: string) => void;
  className?: string;
  natural?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  const actionButtons = (
    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
      <div className="flex items-center gap-2">
        {onDelete && (
          <button
            onClick={() => onDelete(img.id)}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        {onCopyPrompt && (
          <button
            onClick={() => {
              onCopyPrompt(img.prompt);
              toast.success('Prompt copied to editor');
            }}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            title="Copy prompt to editor"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDownload(img.url, idx)}
          className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={() => onExpand(idx)}
          className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors"
        >
          <Expand className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (natural) {
    return (
      <div className={cn('group relative inline-block', className)}>
        <img
          src={img.url}
          alt={`Generated ${idx + 1}`}
          className={cn(
            'w-auto h-auto max-h-[calc(100vh-400px)] rounded-xl shadow-md shadow-black/20 transition-opacity duration-700 ease-out',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {actionButtons}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl shadow-md shadow-black/20',
        className,
      )}
    >
      <img
        src={img.url}
        alt={`Generated ${idx + 1}`}
        className={cn(
          'w-full h-auto object-cover transition-opacity duration-700 ease-out',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {actionButtons}
    </div>
  );
}

export function FreestyleGallery({ images, onDownload, onExpand, onDelete, onCopyPrompt, generatingCount = 0, generatingProgress = 0, blockedEntries = [], onDismissBlocked, onEditBlockedPrompt }: FreestyleGalleryProps) {
  const hasContent = images.length > 0 || generatingCount > 0 || blockedEntries.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-24 h-24 rounded-3xl bg-muted/50 border border-border/50 flex items-center justify-center mb-6">
          <Wand2 className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-light tracking-tight text-foreground/80 mb-3">
          Freestyle Studio
        </h2>
        <p className="text-sm text-muted-foreground/60 max-w-sm leading-relaxed">
          Describe what you want to create, attach a reference, pick a model or scene — your creations appear here.
        </p>
      </div>
    );
  }

  const generatingCards = generatingCount > 0
    ? Array.from({ length: generatingCount }, (_, i) => (
        <GeneratingCard key={`generating-${i}`} progress={generatingProgress} />
      ))
    : [];

  const blockedCards = blockedEntries.map(entry => (
    <ContentBlockedCard
      key={`blocked-${entry.id}`}
      entry={entry}
      onDismiss={onDismissBlocked}
      onEditPrompt={onEditBlockedPrompt}
    />
  ));

  const count = images.length + generatingCount + blockedEntries.length;

  if (count <= 3) {
    return (
      <div className="flex items-stretch justify-center gap-3 px-6 pt-6">
        {generatingCards.map((card, i) => (
          <div key={`gen-wrap-${i}`} className="max-h-[calc(100vh-400px)] min-w-[280px]">{card}</div>
        ))}
        {blockedCards.map((card, i) => (
          <div key={`block-wrap-${i}`} className="max-h-[calc(100vh-400px)] min-w-[280px]">{card}</div>
        ))}
        {images.map((img, idx) => (
          <ImageCard
            key={img.id}
            img={img}
            idx={idx}
            onDownload={onDownload}
            onExpand={onExpand}
            onDelete={onDelete}
            onCopyPrompt={onCopyPrompt}
            natural
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 pt-3 px-1 pb-4">
      {generatingCards}
      {blockedCards}
      {images.map((img, idx) => (
        <ImageCard
          key={img.id}
          img={img}
          idx={idx}
          onDownload={onDownload}
          onExpand={onExpand}
          onDelete={onDelete}
          onCopyPrompt={onCopyPrompt}
        />
      ))}
    </div>
  );
}
