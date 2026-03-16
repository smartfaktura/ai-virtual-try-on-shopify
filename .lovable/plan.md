

## Plan: Store live chat sessions in the database

### Problem
Chat conversations from the StudioChat widget are ephemeral — they exist only in React state and are lost when the user navigates away or refreshes. There's no way to review what users are asking.

### Approach
Create a `chat_sessions` table to persist each conversation. Save the full message history after each assistant response completes. Admin users can view all sessions.

### Changes

**1. Database migration — create `chat_sessions` table**

```sql
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  page_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own sessions
CREATE POLICY "Users can insert own sessions" ON public.chat_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.chat_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON public.chat_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions" ON public.chat_sessions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sessions" ON public.chat_sessions
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
```

**2. `src/hooks/useStudioChat.ts`**

- Add a `sessionIdRef` to track the current session UUID
- After each completed assistant response (in the `finally` block), upsert the session:
  - First message → `INSERT` a new row, store the returned ID
  - Subsequent messages → `UPDATE` the existing row's `messages` and `updated_at`
- On `clearChat`, reset `sessionIdRef` so the next conversation creates a new session
- Pass `location.pathname` from the component to store `page_url`

**3. `src/components/app/StudioChat.tsx`**

- Pass `location.pathname` to the hook so it can record which page the chat started on

### Result
Every chat conversation is saved with the user ID, full message history, and the page it started on. Admins can query all sessions to see what users are asking. No new UI needed — this is backend-only persistence.

