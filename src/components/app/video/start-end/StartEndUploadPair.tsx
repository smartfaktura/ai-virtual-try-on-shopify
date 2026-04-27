import { useRef, useState } from 'react';
import { Upload, X, ChevronRight, ArrowDown, Loader2, FolderOpen, ImageIcon } from 'lucide-react';
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
  state: UploadSlotState;
  onFile: (f: File) => void;
  onLibrary: (url: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

function Slot({ label, state, onFile, onLibrary, onClear, disabled }: SlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const hasImage = !!state.preview;

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 border-dashed bg-card transition-colors overflow-hidden aspect-square',
        dragOver ? 'border-primary bg-primary/5' : 'border-border',
        hasImage && 'border-solid border-border'
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
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-background/85 backdrop-blur text-[11px] font-medium text-foreground">
            {label}
          </div>
          {!disabled && (
            <button
              onClick={onClear}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/85 backdrop-blur hover:bg-background text-foreground"
              aria-label={`Remove ${label}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {state.uploading && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="text-xs text-muted-foreground">{state.progress}%</div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            {state.uploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Upload className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {state.uploading ? `Uploading… ${state.progress}%` : 'Drop, paste, or browse'}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-1.5 w-full">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              disabled={disabled || state.uploading}
              onClick={() => inputRef.current?.click()}
            >
              <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
              Upload
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="flex-1"
              disabled={disabled || state.uploading}
              onClick={() => setLibraryOpen(true)}
            >
              <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
              Library
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Slot
          label="Start frame"
          state={start}
          onFile={(f) => onUploadFile('start', f)}
          onLibrary={(u) => onPickFromLibrary('start', u)}
          onClear={() => onClear('start')}
          disabled={disabled}
        />
        <Slot
          label="End frame"
          state={end}
          onFile={(f) => onUploadFile('end', f)}
          onLibrary={(u) => onPickFromLibrary('end', u)}
          onClear={() => onClear('end')}
          disabled={disabled}
        />
      </div>
      {/* Divider chip */}
      <div className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="h-9 w-9 rounded-full bg-background border border-border shadow-sm flex items-center justify-center">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="flex sm:hidden justify-center my-2 -mt-1">
        <div className="h-7 w-7 rounded-full bg-background border border-border shadow-sm flex items-center justify-center">
          <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
