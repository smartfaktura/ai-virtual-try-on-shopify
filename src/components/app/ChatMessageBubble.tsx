import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type ParsedSegment =
  | { type: 'text'; content: string }
  | { type: 'cta'; label: string; route: string };

const CTA_REGEX = /\[\[(.+?)\|(.+?)\]\]/g;

function parseMessageContent(content: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(CTA_REGEX)) {
    const matchStart = match.index!;
    if (matchStart > lastIndex) {
      segments.push({ type: 'text', content: content.slice(lastIndex, matchStart) });
    }
    segments.push({ type: 'cta', label: match[1], route: match[2] });
    lastIndex = matchStart + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return segments;
}

interface ChatMessageBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  isStreaming?: boolean;
}

export function ChatMessageBubble({ content, role, isStreaming }: ChatMessageBubbleProps) {
  const navigate = useNavigate();

  if (role === 'user') {
    return <span>{content}</span>;
  }

  const segments = parseMessageContent(content);
  const hasCTAs = segments.some((s) => s.type === 'cta');

  return (
    <div>
      <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-1.5 max-w-none">
        {segments.map((segment, i) =>
          segment.type === 'text' ? (
            <ReactMarkdown key={i}>{segment.content}</ReactMarkdown>
          ) : null
        )}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-foreground/40 animate-pulse rounded-sm" />
        )}
      </div>

      {hasCTAs && !isStreaming && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {segments
            .filter((s): s is Extract<ParsedSegment, { type: 'cta' }> => s.type === 'cta')
            .map((cta, i) => (
              <button
                key={i}
                onClick={() => navigate(cta.route)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
                )}
              >
                {cta.label}
                <ArrowRight className="w-3 h-3" />
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
