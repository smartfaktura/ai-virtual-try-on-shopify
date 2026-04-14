import { useState } from 'react';
import { Plus, X, ChevronUp, ChevronDown, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatRoleLabel } from '@/lib/shortFilmPlanner';

const AVAILABLE_ROLES = [
  { role: 'hook', desc: 'Grab attention' },
  { role: 'intro', desc: 'Set the scene' },
  { role: 'tease', desc: 'Create intrigue' },
  { role: 'atmosphere', desc: 'Build mood' },
  { role: 'build', desc: 'Build tension' },
  { role: 'product_reveal', desc: 'Hero reveal' },
  { role: 'product_moment', desc: 'Feature product' },
  { role: 'product_focus', desc: 'Focused showcase' },
  { role: 'detail_closeup', desc: 'Texture & detail' },
  { role: 'highlight', desc: 'Peak moment' },
  { role: 'lifestyle_moment', desc: 'In-context use' },
  { role: 'human_interaction', desc: 'Human element' },
  { role: 'resolve', desc: 'Resolve story' },
  { role: 'brand_finish', desc: 'Brand closing' },
  { role: 'end_frame', desc: 'End card / CTA' },
];

interface CustomStructureBuilderProps {
  roles: string[];
  onChange: (roles: string[]) => void;
}

export function CustomStructureBuilder({ roles, onChange }: CustomStructureBuilderProps) {
  const addRole = (role: string) => {
    onChange([...roles, role]);
  };

  const removeRole = (index: number) => {
    onChange(roles.filter((_, i) => i !== index));
  };

  const moveRole = (from: number, to: number) => {
    if (to < 0 || to >= roles.length) return;
    const next = [...roles];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const unusedRoles = AVAILABLE_ROLES.filter(r => !roles.includes(r.role));

  return (
    <div className="space-y-4 mt-4">
      <div>
        <p className="text-xs font-medium text-foreground mb-2">Your Narrative Arc ({roles.length} shots)</p>
        {roles.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-4 text-center">
            Add roles below to compose your story structure.
          </p>
        ) : (
          <div className="space-y-1.5">
            {roles.map((role, i) => (
              <div
                key={`${role}-${i}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 group"
              >
                <span className="text-[10px] font-bold text-muted-foreground w-4 text-center">{i + 1}</span>
                <span className="text-xs font-medium text-foreground flex-1">{formatRoleLabel(role)}</span>
                <div className="flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveRole(i, i - 1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => moveRole(i, i + 1)} disabled={i === roles.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => removeRole(i)} className="text-destructive hover:text-destructive/80">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {unusedRoles.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Add Roles</p>
          <div className="flex flex-wrap gap-1.5">
            {unusedRoles.map(r => (
              <button
                key={r.role}
                onClick={() => addRole(r.role)}
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title={r.desc}
              >
                <Plus className="h-2.5 w-2.5" />
                {formatRoleLabel(r.role)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
