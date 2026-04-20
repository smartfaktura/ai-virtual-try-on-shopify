import { useState } from 'react';
import { Loader2, Check, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';
import { useLocation } from 'react-router-dom';
import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const AVATARS = TEAM_MEMBERS.slice(0, 4);

export function SceneRequestBanner() {
  const { user } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    const trimmedUrl = referenceUrl.trim();
    const fullMessage = trimmedUrl
      ? `[scene-request] ${message.trim()}\n\nReference: ${trimmedUrl}`
      : `[scene-request] ${message.trim()}`;
    const { error } = await supabase.from('feedback').insert({
      user_id: user.id,
      type: 'feature',
      message: fullMessage,
      page_url: location.pathname,
      email: user.email,
    });
    setSubmitting(false);
    if (error) {
      toast.error('Failed to send request');
      return;
    }
    setSubmitted(true);
    setMessage('');
    setReferenceUrl('');
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6">
      {submitted ? (
        <div className="flex items-center gap-3 py-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Thanks! We'll create it in 1–2 business days.</p>
            <p className="text-xs text-muted-foreground">Our team reads every submission.</p>
          </div>
        </div>
      ) : !expanded ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="hidden sm:flex -space-x-2.5 shrink-0">
              {AVATARS.map((member) => (
                <Avatar
                  key={member.name}
                  className="w-9 h-9 border-2 border-background ring-1 ring-primary/10"
                >
                  <AvatarImage src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.name} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                    {member.name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="flex sm:hidden -space-x-2 shrink-0">
              {AVATARS.slice(0, 3).map((member) => (
                <Avatar
                  key={member.name}
                  className="w-7 h-7 border-2 border-background ring-1 ring-primary/10"
                >
                  <AvatarImage src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.name} />
                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                    {member.name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground leading-snug">
                Missing a scene for your products?
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tell us what you need — we'll create it in 1–2 business days.
              </p>
            </div>
          </div>
          <Button
            className="rounded-full text-sm font-semibold px-5 h-10 shrink-0 gap-1.5 w-full sm:w-auto"
            onClick={() => setExpanded(true)}
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Share Request</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 shrink-0">
              {AVATARS.slice(0, 3).map((member) => (
                <Avatar key={member.name} className="w-7 h-7 border-2 border-background">
                  <AvatarImage src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.name} />
                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                    {member.name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="text-sm font-semibold text-foreground">
              What scene would you like us to create?
            </p>
          </div>
          <Textarea
            placeholder="Describe the scene, mood, or setting you need…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[80px] text-sm bg-background"
            maxLength={500}
            autoFocus
          />
          <Input
            type="url"
            placeholder="Optional: link to a reference image"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            className="h-10 text-sm bg-background"
            maxLength={500}
          />
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => { setExpanded(false); setMessage(''); setReferenceUrl(''); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!message.trim() || submitting}
              className="rounded-full font-semibold px-5"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Request'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
