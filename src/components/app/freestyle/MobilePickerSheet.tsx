import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobilePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  minHeight?: 'half' | 'auto';
}

export function MobilePickerSheet({ open, onOpenChange, title, children, minHeight = 'auto' }: MobilePickerSheetProps) {
  const [pointerReady, setPointerReady] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setPointerReady(true), 260);
      return () => clearTimeout(timer);
    }
    setPointerReady(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div className="relative mt-auto bg-background rounded-t-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Sticky header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className={cn("flex-1 overflow-y-auto overscroll-contain px-4 py-3", minHeight === 'half' && 'min-h-[50vh]')}>
          {children}
        </div>
      </div>
    </div>
  );
}
