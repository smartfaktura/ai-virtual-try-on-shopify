import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Users, MapPin, Palette, Library, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useCustomModels } from '@/hooks/useCustomModels';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface ReferenceAsset {
  id: string;
  url: string;
  role: 'product' | 'scene' | 'model' | 'style' | 'logo';
  name?: string;
}

interface ReferenceUploadPanelProps {
  references: ReferenceAsset[];
  onChange: (refs: ReferenceAsset[]) => void;
}

const SECTIONS = [
  { role: 'product' as const, label: 'Product References', icon: ImageIcon, description: 'Upload hero product images for consistent appearance.', showLibrary: false },
  { role: 'scene' as const, label: 'Scene References', icon: MapPin, description: 'Add environment or location references.', showLibrary: false },
  { role: 'model' as const, label: 'Model / Character', icon: Users, description: 'Optional — add character reference images.', showLibrary: true },
  { role: 'style' as const, label: 'Style / Mood', icon: Palette, description: 'Upload visual tone or mood references.', showLibrary: false },
  { role: 'logo' as const, label: 'Logo / End Frame', icon: ImageIcon, description: 'Optional — logo for the closing shot.', showLibrary: false },
];

export function ReferenceUploadPanel({ references, onChange }: ReferenceUploadPanelProps) {
  const [dragRole, setDragRole] = useState<string | null>(null);
  const [uploadingRole, setUploadingRole] = useState<string | null>(null);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const { upload, isUploading } = useFileUpload();
  const { models } = useCustomModels();

  const handleFileUpload = useCallback(
    async (role: ReferenceAsset['role'], files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploadingRole(role);

      const newRefs: ReferenceAsset[] = [];
      for (const file of Array.from(files)) {
        const url = await upload(file);
        if (url) {
          newRefs.push({
            id: crypto.randomUUID(),
            url,
            role,
            name: file.name,
          });
        }
      }

      if (newRefs.length > 0) {
        onChange([...references, ...newRefs]);
      }
      setUploadingRole(null);
    },
    [references, onChange, upload]
  );

  const pickModel = useCallback(
    (model: { id: string; name: string; image_url: string }) => {
      const ref: ReferenceAsset = {
        id: crypto.randomUUID(),
        url: model.image_url,
        role: 'model',
        name: model.name,
      };
      onChange([...references, ref]);
      setModelPickerOpen(false);
    },
    [references, onChange]
  );

  const removeRef = useCallback(
    (id: string) => {
      onChange(references.filter((r) => r.id !== id));
    },
    [references, onChange]
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Add References</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload product shots, scene references, model photos, and style inspiration.
        </p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const sectionRefs = references.filter((r) => r.role === section.role);
          const Icon = section.icon;
          const isSectionUploading = uploadingRole === section.role && isUploading;

          return (
            <div key={section.role} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{section.label}</p>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
                {section.showLibrary && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => setModelPickerOpen(true)}
                  >
                    <Library className="h-3.5 w-3.5" />
                    Library
                  </Button>
                )}
              </div>

              {sectionRefs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {sectionRefs.map((ref) => (
                    <div key={ref.id} className="relative group">
                      <img
                        src={ref.url}
                        alt={ref.name || section.label}
                        className="h-16 w-16 rounded-lg object-cover border border-border"
                      />
                      <button
                        onClick={() => removeRef(ref.id)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {ref.name && (
                        <p className="text-[9px] text-muted-foreground text-center truncate w-16 mt-0.5">{ref.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <label
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 cursor-pointer transition-colors',
                  isSectionUploading && 'pointer-events-none opacity-60',
                  dragRole === section.role
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
                onDragOver={(e) => { e.preventDefault(); setDragRole(section.role); }}
                onDragLeave={() => setDragRole(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragRole(null);
                  handleFileUpload(section.role, e.dataTransfer.files);
                }}
              >
                {isSectionUploading ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">
                  {isSectionUploading ? 'Uploading...' : (
                    <>Drop images or <span className="text-primary font-medium">browse</span></>
                  )}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => handleFileUpload(section.role, e.target.files)}
                  disabled={isSectionUploading}
                />
              </label>
            </div>
          );
        })}
      </div>

      {/* Model Library Picker Dialog */}
      <Dialog open={modelPickerOpen} onOpenChange={setModelPickerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pick from Model Library</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto py-2">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => pickModel(m)}
                className="group rounded-lg border border-border hover:border-primary/50 overflow-hidden transition-all"
              >
                <img
                  src={m.optimized_image_url || m.image_url}
                  alt={m.name}
                  className="w-full aspect-[3/4] object-cover"
                />
                <p className="text-[10px] font-medium text-foreground p-1.5 truncate">{m.name}</p>
              </button>
            ))}
            {models.length === 0 && (
              <p className="col-span-3 text-sm text-muted-foreground text-center py-8">
                No models available yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
