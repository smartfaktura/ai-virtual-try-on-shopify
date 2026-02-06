import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, X } from 'lucide-react';

interface NegativesChipSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const SUGGESTED_NEGATIVES = [
  { label: 'Hands', value: 'hands' }, { label: 'Text overlays', value: 'text overlays' },
  { label: 'Busy backgrounds', value: 'busy backgrounds' }, { label: 'Watermarks', value: 'watermarks' },
  { label: 'Other products', value: 'other products' }, { label: 'People', value: 'people' },
  { label: 'Shadows', value: 'harsh shadows' }, { label: 'Reflections', value: 'reflections' },
];

export function NegativesChipSelector({ value, onChange }: NegativesChipSelectorProps) {
  const [customInput, setCustomInput] = useState('');

  const toggleNegative = (negative: string) => {
    const lowerNegative = negative.toLowerCase();
    if (value.some(v => v.toLowerCase() === lowerNegative)) {
      onChange(value.filter(v => v.toLowerCase() !== lowerNegative));
    } else {
      onChange([...value, negative]);
    }
  };

  const addCustomNegative = () => {
    const trimmed = customInput.trim();
    if (trimmed && !value.some(v => v.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...value, trimmed]);
      setCustomInput('');
    }
  };

  const isSelected = (negative: string) => value.some(v => v.toLowerCase() === negative.toLowerCase());

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">Don't show these things</p>
        <p className="text-xs text-muted-foreground">Click to select items you don't want in your photos</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_NEGATIVES.map(({ label, value: negValue }) => (
          <button
            key={negValue} type="button" onClick={() => toggleNegative(negValue)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
              isSelected(negValue) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary hover:bg-primary/5'
            }`}
          >
            <span className="flex items-center gap-1">
              {isSelected(negValue) ? <><span>{label}</span><X className="w-3 h-3" /></> : <><PlusCircle className="w-3 h-3" /><span>{label}</span></>}
            </span>
          </button>
        ))}
      </div>
      {value.filter(v => !SUGGESTED_NEGATIVES.some(s => s.value.toLowerCase() === v.toLowerCase())).length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Your custom items:</p>
          <div className="flex flex-wrap gap-2">
            {value.filter(v => !SUGGESTED_NEGATIVES.some(s => s.value.toLowerCase() === v.toLowerCase())).map(custom => (
              <button key={custom} type="button" onClick={() => toggleNegative(custom)}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground border border-primary flex items-center gap-1">
                {custom}<X className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2 items-end">
        <Input placeholder="Type something to avoid..." value={customInput} onChange={(e) => setCustomInput(e.target.value)} className="flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomNegative(); } }} />
        <Button size="sm" onClick={addCustomNegative} disabled={!customInput.trim()}>Add</Button>
      </div>
    </div>
  );
}
