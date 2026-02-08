import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { MessageCircle, X, Send, RotateCcw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useStudioChat } from '@/hooks/useStudioChat';
import { cn } from '@/lib/utils';
import { ChatMessageBubble } from './ChatMessageBubble';

import avatarSophia from '@/assets/team/avatar-sophia.jpg';
import avatarKenji from '@/assets/team/avatar-kenji.jpg';
import avatarZara from '@/assets/team/avatar-zara.jpg';

const STARTER_CHIPS = [
  'What style works for skincare?',
  'Best shots for fashion brands?',
  'How to make my product stand out?',
];

const WELCOME_MESSAGE =
  "Hey! 👋 Your studio team is here. Tell us about your product and we'll suggest the perfect visual strategy. What are you working on?";

export function StudioChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage, clearChat } = useStudioChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    sendMessage(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChip = (text: string) => {
    if (isLoading) return;
    sendMessage(text);
  };

  const displayMessages = messages.length === 0
    ? [{ role: 'assistant' as const, content: WELCOME_MESSAGE }]
    : messages;

  const showChips = messages.length === 0;

  return (
    <>
      {/* Chat Panel */}
      <div
        className={cn(
          'fixed bottom-20 right-4 z-50 w-[360px] sm:w-[380px] bg-popover border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out',
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto h-[500px]'
            : 'opacity-0 translate-y-4 pointer-events-none h-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <Avatar className="w-7 h-7 ring-2 ring-popover">
                <AvatarImage src={avatarSophia} alt="Sophia" />
                <AvatarFallback className="text-[10px]">SC</AvatarFallback>
              </Avatar>
              <Avatar className="w-7 h-7 ring-2 ring-popover">
                <AvatarImage src={avatarKenji} alt="Kenji" />
                <AvatarFallback className="text-[10px]">KN</AvatarFallback>
              </Avatar>
              <Avatar className="w-7 h-7 ring-2 ring-popover">
                <AvatarImage src={avatarZara} alt="Zara" />
                <AvatarFallback className="text-[10px]">ZW</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Studio Team</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Your creative advisors</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="p-4 space-y-4">
            {displayMessages.map((msg, i) => (
              <div key={i} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
                    <AvatarImage src={avatarSophia} alt="Team" />
                    <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">fa</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%]',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}
                >
                  <ChatMessageBubble
                    content={msg.content}
                    role={msg.role}
                    isStreaming={msg.role === 'assistant' && isLoading && i === displayMessages.length - 1}
                  />
                </div>
              </div>
            ))}

            {/* Loading indicator when no assistant message yet */}
            {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user') && (
              <div className="flex gap-2.5">
                <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
                  <AvatarImage src={avatarSophia} alt="Team" />
                  <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">bf</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-md px-3.5 py-3 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Starter chips */}
            {showChips && (
              <div className="flex flex-wrap gap-2 pt-1">
                {STARTER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChip(chip)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted text-foreground transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="px-3 py-3 border-t border-border flex-shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your studio team..."
              rows={1}
              className="flex-1 resize-none bg-muted rounded-xl px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring max-h-24 min-h-[40px]"
              style={{ height: 'auto', overflow: 'auto' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105',
          isOpen
            ? 'bg-muted text-muted-foreground hover:bg-muted/80'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-primary animate-pulse" />
          </div>
        )}
      </button>
    </>
  );
}
