import { FILM_TYPE_OPTIONS } from '@/lib/shortFilmPlanner';
import type { FilmType } from '@/types/shortFilm';
import { cn } from '@/lib/utils';

interface FilmTypeSelectorProps {
  value: FilmType | null;
  onChange: (type: FilmType) => void;
}

export function FilmTypeSelector({ value, onChange }: FilmTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">What kind of film?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a film type to set defaults for story structure, motion, and tone.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FILM_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all',
              'hover:border-primary/50 hover:shadow-sm',
              value === option.value
                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                : 'border-border bg-card'
            )}
          >
            <span className="text-2xl">{option.icon}</span>
            <div>
              <p className="text-sm font-medium text-foreground">{option.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
