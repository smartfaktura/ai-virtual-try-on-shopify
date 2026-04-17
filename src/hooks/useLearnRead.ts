import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'learn:read';
const LAST_KEY = 'learn:last-opened';

function readSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
}

export function makeKey(section: string, slug: string) {
  return `${section}/${slug}`;
}

export function useLearnRead() {
  const [readKeys, setReadKeys] = useState<Set<string>>(() => readSet());
  const [lastOpened, setLastOpened] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LAST_KEY);
    } catch {
      return null;
    }
  });

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setReadKeys(readSet());
      if (e.key === LAST_KEY) setLastOpened(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isRead = useCallback((section: string, slug: string) => readKeys.has(makeKey(section, slug)), [readKeys]);

  const markRead = useCallback((section: string, slug: string) => {
    const key = makeKey(section, slug);
    setReadKeys((prev) => {
      if (prev.has(key)) {
        // still update lastOpened
        try {
          localStorage.setItem(LAST_KEY, key);
        } catch {
          /* ignore */
        }
        setLastOpened(key);
        return prev;
      }
      const next = new Set(prev);
      next.add(key);
      writeSet(next);
      try {
        localStorage.setItem(LAST_KEY, key);
      } catch {
        /* ignore */
      }
      setLastOpened(key);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setReadKeys(new Set());
    writeSet(new Set());
  }, []);

  return { isRead, markRead, reset, readCount: readKeys.size, lastOpened };
}
