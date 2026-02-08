import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

import ringHand from '@/assets/workflows/social-ring-hand.jpg';
import ringPortrait from '@/assets/workflows/social-ring-portrait.jpg';
import ringPlate from '@/assets/workflows/social-ring-plate.jpg';
import ringStudio from '@/assets/workflows/social-ring-studio.jpg';

interface Props {
  isActive?: boolean;
}

const GRID_ITEMS = [
  { src: ringPlate, ratio: '4:5', gridArea: '1 / 1 / 3 / 2', delay: 0.2 },
  { src: ringHand, ratio: '1:1', gridArea: '1 / 2 / 2 / 3', delay: 0.55 },
  { src: ringStudio, ratio: '16:9', gridArea: '2 / 2 / 3 / 3', delay: 0.9 },
  { src: ringPortrait, ratio: '9:16', gridArea: '1 / 3 / 3 / 4', delay: 1.25 },
];

const ELEMENTS_EXIT = 3.4;
const BADGE_AT = ELEMENTS_EXIT + 0.35;
const TOTAL_DURATION = BADGE_AT + 1.6;

export function SocialMediaGridThumbnail({ isActive = true }: Props) {
  const [iteration, setIteration] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setIteration(0);
      return;
    }
    const timer = setInterval(() => setIteration((i) => i + 1), TOTAL_DURATION * 1000);
    return () => clearInterval(timer);
  }, [isActive]);

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-neutral-100"
      key={isActive ? iteration : 'static'}
    >
      {/* Soft gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, #f8f6f3 0%, #ede9e3 40%, #e8e4de 100%)',
        }}
      />

      {/* Multi-ratio grid */}
      <div
        className="absolute inset-2 z-10"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr 0.8fr',
          gridTemplateRows: '1fr 1fr',
          gap: '5px',
          ...(isActive
            ? { animation: `smg-container-exit 0.45s ease-in ${ELEMENTS_EXIT}s forwards` }
            : {}),
        }}
      >
        {GRID_ITEMS.map((item, i) => (
          <div
            key={i}
            className="relative rounded-lg overflow-hidden"
            style={{
              gridArea: item.gridArea,
              opacity: isActive ? 0 : 1,
              ...(isActive
                ? {
                    animation: `smg-tile-in 0.5s cubic-bezier(.22,1,.36,1) ${item.delay}s forwards`,
                  }
                : {}),
            }}
          >
            <img
              src={item.src}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
            {/* Ratio label */}
            <div
              className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md"
              style={{
                opacity: isActive ? 0 : 1,
                ...(isActive
                  ? {
                      animation: `smg-fade-in 0.3s ease-out ${item.delay + 0.3}s forwards`,
                    }
                  : {}),
              }}
            >
              <span className="text-[8px] font-bold text-neutral-600 tracking-wide">
                {item.ratio}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Shimmer sweep */}
      {isActive && (
        <div
          className="absolute inset-0 z-[15] pointer-events-none overflow-hidden"
          style={{
            opacity: 0,
            animation: `smg-fade-in 0.2s ease-out ${ELEMENTS_EXIT - 0.3}s forwards, smg-fade-out 0.3s ease-in ${ELEMENTS_EXIT + 0.2}s forwards`,
          }}
        >
          <div
            className="absolute inset-y-0 w-1/3"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
              animation: `smg-shimmer 0.8s ease-in-out ${ELEMENTS_EXIT - 0.2}s forwards`,
            }}
          />
        </div>
      )}

      {/* "Generated" badge */}
      {isActive && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
          style={{
            opacity: 0,
            animation: `smg-badge-pop 0.45s cubic-bezier(.34,1.56,.64,1) ${BADGE_AT}s forwards`,
          }}
        >
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-full shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold text-primary tracking-wide">
              4 Formats
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes smg-tile-in {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes smg-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes smg-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes smg-container-exit {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.96) translateY(-4px); }
        }
        @keyframes smg-badge-pop {
          0%  { opacity: 0; transform: translateX(-50%) translateY(12px) scale(0.5); }
          70% { opacity: 1; transform: translateX(-50%) translateY(-2px) scale(1.06); }
          100%{ opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes smg-shimmer {
          from { left: -33%; }
          to   { left: 100%; }
        }
      `}</style>
    </div>
  );
}
