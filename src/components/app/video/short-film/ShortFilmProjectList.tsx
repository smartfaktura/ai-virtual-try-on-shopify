import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Film, Play, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProjectSummary {
  id: string;
  title: string;
  status: string;
  created_at: string;
  workflow_type: string;
  settings_json: Record<string, unknown>;
  shot_count?: number;
}

interface ShortFilmProjectListProps {
  onResumeDraft: (projectId: string) => void;
  onViewProject: (projectId: string) => void;
}

export function ShortFilmProjectList({ onResumeDraft, onViewProject }: ShortFilmProjectListProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('video_projects')
        .select('id, title, status, created_at, workflow_type, settings_json')
        .eq('user_id', user.id)
        .eq('workflow_type', 'short_film')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        // Get shot counts
        const ids = data.map(p => p.id);
        const { data: shots } = await supabase
          .from('video_shots')
          .select('project_id')
          .in('project_id', ids);

        const countMap: Record<string, number> = {};
        shots?.forEach(s => {
          countMap[s.project_id] = (countMap[s.project_id] || 0) + 1;
        });

        setProjects(data.map(p => ({
          ...p,
          settings_json: (p.settings_json || {}) as Record<string, unknown>,
          shot_count: countMap[p.id] || 0,
        })));
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    );
  }

  if (projects.length === 0) return null;

  const statusColor = (s: string) => {
    if (s === 'draft') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    if (s === 'processing') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (s === 'complete') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">My Films</span>
          <Badge variant="secondary" className="text-[10px]">{projects.length}</Badge>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {projects.map(p => (
            <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{p.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded', statusColor(p.status))}>
                    {p.status}
                  </span>
                  {p.shot_count ? (
                    <span className="text-[10px] text-muted-foreground">{p.shot_count} shots</span>
                  ) : null}
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                {p.status === 'draft' ? (
                  <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={() => onResumeDraft(p.id)}>
                    <Pencil className="h-3 w-3" /> Resume
                  </Button>
                ) : p.status === 'complete' ? (
                  <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={() => onViewProject(p.id)}>
                    <Play className="h-3 w-3" /> View
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
