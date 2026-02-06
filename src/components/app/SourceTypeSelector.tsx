import { Package, Upload } from 'lucide-react';
import type { GenerationSourceType } from '@/types';

interface SourceTypeSelectorProps {
  sourceType: GenerationSourceType;
  onChange: (sourceType: GenerationSourceType) => void;
}

export function SourceTypeSelector({ sourceType, onChange }: SourceTypeSelectorProps) {
  const options: Array<{
    id: GenerationSourceType;
    title: string;
    description: string;
    icon: typeof Package;
  }> = [
    {
      id: 'product',
      title: 'From Product(s)',
      description: 'Select one or multiple products',
      icon: Package,
    },
    {
      id: 'scratch',
      title: 'From Scratch',
      description: 'Upload your own image file to generate from',
      icon: Upload,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`p-6 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
            sourceType === option.id
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border hover:border-primary/50 hover:bg-muted'
          }`}
        >
          <div className="space-y-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              sourceType === option.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <option.icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{option.title}</p>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
            {sourceType === option.id && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-medium">Selected</span>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
