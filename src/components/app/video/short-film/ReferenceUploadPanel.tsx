import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Users, MapPin, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  { role: 'product' as const, label: 'Product References', icon: ImageIcon, description: 'Upload hero product images for consistent appearance.' },
  { role: 'scene' as const, label: 'Scene References', icon: MapPin, description: 'Add environment or location references.' },
  { role: 'model' as const, label: 'Model / Character', icon: Users, description: 'Optional — add character reference images.' },
  { role: 'style' as const, label: 'Style / Mood', icon: Palette, description: 'Upload visual tone or mood references.' },
  { role: 'logo' as const, label: 'Logo / End Frame', icon: ImageIcon, description: 'Optional — logo for the closing shot.' },
];

export function ReferenceUploadPanel({ references, onChange }: ReferenceUploadPanelProps) {
  const [dragRole, setDragRole] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    (role: ReferenceAsset['role'], files: FileList | null) => {
      if (!files) return;
      const newRefs: ReferenceAsset[] = [];
      Array.from(files).forEach((file) => {
        const url = URL.createObjectURL(file);
        newRefs.push({
          id: crypto.randomUUID(),
          url,
          role,
          name: file.name,
        });
      });
      onChange([...references, ...newRefs]);
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

          return (
            <div key={section.role} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{section.label}</p>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
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
                    </div>
                  ))}
                </div>
              )}

              <label
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 cursor-pointer transition-colors',
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
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Drop images or <span className="text-primary font-medium">browse</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => handleFileUpload(section.role, e.target.files)}
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
