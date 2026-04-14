import { STORY_STRUCTURE_OPTIONS } from '@/lib/shortFilmPlanner';
import type { StoryStructure } from '@/types/shortFilm';
import { cn } from '@/lib/utils';
import { CustomStructureBuilder } from './CustomStructureBuilder';

interface StoryStructureSelectorProps {
  value: StoryStructure | null;
  onChange: (structure: StoryStructure) => void;
  customRoles?: string[];
  onCustomRolesChange?: (roles: string[]) => void;
}

export function StoryStructureSelector({ value, onChange, customRoles = [], onCustomRolesChange }: StoryStructureSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Story Structure</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pick a narrative arc for your film. Each structure defines the shot sequence.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {STORY_STRUCTURE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-all',
              'hover:border-primary/50 hover:shadow-sm',
              value === option.value
                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                : 'border-border bg-card'
            )}
          >
            <p className="text-sm font-semibold text-foreground">{option.label}</p>
            <p className="text-xs text-muted-foreground">{option.description}</p>
            {option.roles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {option.roles.map((role, i) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    <span className="text-muted-foreground/50">{i + 1}</span>
                    {role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {value === 'custom' && onCustomRolesChange && (
        <CustomStructureBuilder roles={customRoles} onChange={onCustomRolesChange} />
      )}
    </div>
  );
}
