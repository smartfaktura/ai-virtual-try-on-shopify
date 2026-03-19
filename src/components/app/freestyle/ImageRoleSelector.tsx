import React, { useState } from 'react';
import { Pencil, ShoppingBag, User, Mountain, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ImageRole = 'edit' | 'product' | 'model' | 'scene';
export type EditIntent = 'replace_product' | 'change_background' | 'change_model' | 'enhance';

const ROLE_OPTIONS: { value: ImageRole; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'edit', label: 'Edit this image', description: 'Change something in this photo', icon: Pencil },
  { value: 'product', label: 'Use as product', description: 'This is the product to include', icon: ShoppingBag },
  { value: 'model', label: 'Use as model', description: "Use this person's face/body", icon: User },
  { value: 'scene', label: 'Use as scene', description: 'Use this background or location', icon: Mountain },
];

const EDIT_INTENT_OPTIONS: { value: EditIntent; label: string }[] = [
  { value: 'replace_product', label: 'Replace/edit product' },
  { value: 'change_background', label: 'Change background' },
  { value: 'change_model', label: 'Change model' },
  { value: 'enhance', label: 'Improve quality' },
];

const ROLE_LABELS: Record<ImageRole, string> = {
  edit: 'Edit',
  product: 'Product',
  model: 'Model',
  scene: 'Scene',
};

interface ImageRoleSelectorProps {
  imageRole: ImageRole;
  onImageRoleChange: (role: ImageRole) => void;
  editIntent: EditIntent[];
  onEditIntentChange: (intents: EditIntent[]) => void;
}

export function ImageRoleSelector({
  imageRole,
  onImageRoleChange,
  editIntent,
  onEditIntentChange,
}: ImageRoleSelectorProps) {
  const [roleExpanded, setRoleExpanded] = useState(true);
  const [intentExpanded, setIntentExpanded] = useState(true);

  const toggleIntent = (intent: EditIntent) => {
    onEditIntentChange(
      editIntent.includes(intent)
        ? editIntent.filter(i => i !== intent)
        : [...editIntent, intent]
    );
  };

  const intentLabels = editIntent.length > 0
    ? editIntent.map(i => EDIT_INTENT_OPTIONS.find(o => o.value === i)?.label).filter(Boolean).join(', ')
    : 'Improve quality';

  return (
    <div className="space-y-2">
      {/* Step 1 — Image Role */}
      {roleExpanded ? (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-xs font-medium text-muted-foreground">What do you want to do with this image?</p>
          <div className="flex flex-wrap gap-1.5">
            {ROLE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = imageRole === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onImageRoleChange(opt.value);
                    setRoleExpanded(false);
                    if (opt.value === 'edit') setIntentExpanded(true);
                  }}
                  className={cn(
                    'group inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-all duration-150',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/50 text-foreground/70 hover:bg-muted hover:border-border/80'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3 h-3 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setRoleExpanded(true)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Using image as: <span className="font-medium text-foreground">{ROLE_LABELS[imageRole]}</span></span>
          <ChevronDown className="w-3 h-3" />
        </button>
      )}

      {/* Step 2 — Edit Intent (only when role is "edit") */}
      {imageRole === 'edit' && !roleExpanded && (
        intentExpanded ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <p className="text-xs font-medium text-muted-foreground">What do you want to change?</p>
            <div className="flex flex-wrap gap-1.5">
              {EDIT_INTENT_OPTIONS.map(opt => {
                const isSelected = editIntent.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleIntent(opt.value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium border transition-all duration-150',
                      isSelected
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border/60 bg-background text-foreground/60 hover:bg-muted hover:text-foreground/80'
                    )}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 shrink-0" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setIntentExpanded(false)}
              className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIntentExpanded(true)}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Editing: <span className="font-medium text-foreground">{intentLabels}</span></span>
            <ChevronDown className="w-3 h-3" />
          </button>
        )
      )}
    </div>
  );
}
