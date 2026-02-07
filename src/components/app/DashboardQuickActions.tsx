import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, Layers, Palette } from 'lucide-react';

const ACTIONS = [
  { label: 'Upload Product', icon: Upload, path: '/app/products' },
  { label: 'Generate Images', icon: Sparkles, path: '/app/generate' },
  { label: 'Browse Workflows', icon: Layers, path: '/app/workflows' },
  { label: 'Brand Profiles', icon: Palette, path: '/app/brand-profiles' },
];

export function DashboardQuickActions() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:bg-muted hover:border-primary/30 transition-all duration-200 shadow-sm"
          >
            <Icon className="w-3.5 h-3.5 text-primary" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
