"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";

type CacheEntries = Record<string, unknown>;

interface ClientCacheState {
  entries: CacheEntries;
  setEntry: (key: string, value: unknown) => void;
}

/**
 * Module-level store (outside the React tree) holding data already fetched
 * this session. `template.tsx` remounts every page's components on each
 * navigation for the paper-transition animation, which would normally reset
 * local state and force a refetch; reading/writing through here lets a page
 * show what it already knows immediately instead of a ghost, then quietly
 * revalidate.
 */
const useClientCacheStore = create<ClientCacheState>((set) => ({
  entries: {},
  setEntry: (key, value) => set((s) => ({ entries: { ...s.entries, [key]: value } })),
}));

export function writeCache<T>(key: string, value: T) {
  useClientCacheStore.getState().setEntry(key, value);
}

/** Synchronous read for lazy `useState` initializers, so a component can
 * render with already-known data on its very first paint after a remount. */
export function peekCache<T>(key: string): T | undefined {
  return useClientCacheStore.getState().entries[key] as T | undefined;
}

/**
 * Stale-while-revalidate fetch keyed into the shared client cache: returns
 * cached data synchronously on mount when present (so the caller can skip
 * its loading/ghost state), and always refetches in the background to keep
 * it current.
 */
export function useCachedFetch<T>(key: string | null, fetcher: () => Promise<T>) {
  const cached = useClientCacheStore((s) => (key ? (s.entries[key] as T | undefined) : undefined));
  const setEntry = useClientCacheStore((s) => s.setEntry);
  const [data, setData] = useState<T | undefined>(cached);
  const [loading, setLoading] = useState(cached === undefined);

  useEffect(() => {
    if (!key) return;
    let active = true;
    setData(cached);
    setLoading(cached === undefined);

    fetcher()
      .then((result) => {
        if (!active) return;
        setEntry(key, result);
        setData(result);
      })
      .catch((err) => {
        console.error(`useCachedFetch(${key}) failed:`, err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // Re-runs only when the cache key changes; `fetcher` is a fresh closure
    // each render but always points at the key's current args.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading };
}
