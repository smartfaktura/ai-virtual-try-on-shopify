import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/studio-chat`;
const MAX_MESSAGES = 30;
const COOLDOWN_MS = 2000;

async function persistSession(
  sessionId: string | null,
  messages: ChatMessage[],
  pageUrl: string | null
): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return sessionId;

    if (sessionId) {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ messages: JSON.parse(JSON.stringify(messages)), updated_at: new Date().toISOString() })
        .eq('id', sessionId);
      if (error) console.error('persistSession update error:', error);
      return sessionId;
    } else {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: session.user.id, messages: JSON.parse(JSON.stringify(messages)), page_url: pageUrl })
        .select('id')
        .single();
      if (error) {
        console.error('persistSession insert error:', error);
        return null;
      }
      return data?.id ?? null;
    }
  } catch (e) {
    console.error('persistSession error:', e);
    return sessionId;
  }
}

export function useStudioChat(pageUrl?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThrottled, setIsThrottled] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastSentRef = useRef<number>(0);
  const sessionIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(async (input: string) => {
    // Cooldown check
    const now = Date.now();
    if (now - lastSentRef.current < COOLDOWN_MS) {
      return;
    }

    // Message cap check
    if (messages.length >= MAX_MESSAGES) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "We've had a great conversation! 🎨 To keep things running smoothly, please start a new chat to continue. Just hit the clear button above!" },
      ]);
      return;
    }

    lastSentRef.current = now;
    setIsThrottled(true);
    setTimeout(() => setIsThrottled(false), COOLDOWN_MS);

    const userMsg: ChatMessage = { role: 'user', content: input.slice(0, 2000) };
    const updatedMessages = [...messages, userMsg].slice(-MAX_MESSAGES);
    setMessages(updatedMessages);
    setIsLoading(true);

    let assistantSoFar = '';
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Please sign in to chat with the studio team');
      }

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: updatedMessages, pageUrl: pageUrl ?? null }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: 'Failed to connect to team' }));
        throw new Error(errorData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error('No response stream');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
                }
                return [...prev, { role: 'assistant', content: snapshot }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
                }
                return [...prev, { role: 'assistant', content: snapshot }];
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Studio chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Sorry, I ran into an issue: ${errorMessage}. Please try again!` },
      ]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }

    // Persist session to database (outside React state updater)
    setMessages(prev => {
      const currentMessages = prev;
      if (currentMessages.length > 0) {
        persistSession(sessionIdRef.current, currentMessages, pageUrl ?? null).then(id => {
          if (id) sessionIdRef.current = id;
        }).catch(e => console.error('persistSession failed:', e));
      }
      return prev;
    });
  }, [messages, pageUrl]);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
    sessionIdRef.current = null;
  }, []);

  const addSystemMessage = useCallback((content: string) => {
    setMessages(prev => {
      const updated = [...prev, { role: 'assistant' as const, content }];
      persistSession(sessionIdRef.current, updated, pageUrl ?? null).then(id => {
        sessionIdRef.current = id;
      });
      return updated;
    });
  }, [pageUrl]);

  return { messages, isLoading, isThrottled, sendMessage, cancelStream, clearChat, addSystemMessage };
}
