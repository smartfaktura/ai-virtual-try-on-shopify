import { useRef, useState } from 'react';
import { Upload, X, ArrowRight, ArrowDown, Loader2, FolderOpen, ImageIcon, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LibraryPickerModal } from '@/components/app/video/LibraryPickerModal';

export interface UploadSlotState {
  url: string | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
}

interface StartEndUploadPairProps {
  start: UploadSlotState;
  end: UploadSlotState;
  onUploadFile: (slot: 'start' | 'end', file: File) => void;
  onPickFromLibrary: (slot: 'start' | 'end', url: string) => void;
  onClear: (slot: 'start' | 'end') => void;
  disabled?: boolean;
}

interface SlotProps {
  label: string;
  variant: 'start' | 'end';
  state: UploadSlotState;
  onFile: (f: File) => void;
  onLibrary: (url: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

function Slot({ label, variant, state, onFile, onLibrary, onClear, disabled }: SlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const hasImage = !!state.preview;
  const Icon = variant === 'start' ? Upload : Flag;

  return (
    <div
      className={cn(
        'relative rounded-3xl border-2 border-dashed transition-all overflow-hidden aspect-[4/5] min-h-[280px] sm:min-h-[340px]',
        hasImage
          ? 'border-solid border-border bg-card'
          : 'bg-gradient-to-b from-primary/[0.02] to-muted/10 hover:from-primary/[0.04] hover:to-muted/20',
        !hasImage && (dragOver
          ? 'border-primary/60 bg-primary/[0.06]'
          : 'border-primary/15 hover:border-primary/30')
      )}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
    >
      {hasImage ? (
        <>
          <img src={state.preview!} alt={label} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur shadow-sm text-[11px] font-medium text-foreground">
            {label}
          </div>
          {!disabled && (
            <button
              onClick={onClear}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-background/90 backdrop-blur shadow-sm hover:bg-background text-foreground transition-colors"
              aria-label={`Remove ${label}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {state.uploading && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="text-xs text-muted-foreground">{state.progress}%</div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            {state.uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Icon className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground">
              {state.uploading ? `Uploading… ${state.progress}%` : 'Drop, paste, or click to browse'}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-[240px]">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs rounded-lg hover:border-primary/40"
              disabled={disabled || state.uploading}
              onClick={() => inputRef.current?.click()}
            >
              <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
              Upload
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs rounded-lg hover:border-primary/40"
              disabled={disabled || state.uploading}
              onClick={() => setLibraryOpen(true)}
            >
              <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
              Library
            </Button>
          </div>
          <p className="text-[10.5px] text-muted-foreground/80 tracking-wide">
            JPG · PNG · WebP — up to 20 MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = '';
            }}
          />
        </div>
      )}
      <LibraryPickerModal
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onSelect={(url) => { onLibrary(url); setLibraryOpen(false); }}
      />
    </div>
  );
}

export function StartEndUploadPair({ start, end, onUploadFile, onPickFromLibrary, onClear, disabled }: StartEndUploadPairProps) {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
        <Slot
          label="Start frame"
          variant="start"
          state={start}
          onFile={(f) => onUploadFile('start', f)}
          onLibrary={(u) => onPickFromLibrary('start', u)}
          onClear={() => onClear('start')}
          disabled={disabled}
        />
        <Slot
          label="End frame"
          variant="end"
          state={end}
          onFile={(f) => onUploadFile('end', f)}
          onLibrary={(u) => onPickFromLibrary('end', u)}
          onClear={() => onClear('end')}
          disabled={disabled}
        />
      </div>
      {/* Direction pill — desktop */}
      <div className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border shadow-md">
          <span className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">Start</span>
          <ArrowRight className="h-3 w-3 text-foreground/60" />
          <span className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">End</span>
        </div>
      </div>
      {/* Direction chip — mobile */}
      <div className="flex sm:hidden justify-center my-1">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border shadow-sm">
          <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">Transition</span>
          <ArrowDown className="h-3 w-3 text-foreground/60" />
        </div>
      </div>
    </div>
  );
}
