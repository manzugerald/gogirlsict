'use client';

import { useHybridCachedData } from '@/utils/useHybridCachedData';

export function useHomePageContent(ssrContent) {
  return useHybridCachedData(
    'homepage-content-v1',
    async () => {
      const res = await fetch('/api/homepage-content');
      if (!res.ok) throw new Error('Failed to fetch homepage content');
      return res.json();
    },
    { initialData: ssrContent, staleTime: 60 * 60 * 1000 }
  );
}

export function useExecutiveMessages(ssrMessages) {
  return useHybridCachedData(
    'executive-messages-v1',
    async () => {
      const res = await fetch('/api/executive-messages');
      if (!res.ok) throw new Error('Failed to fetch executive messages');
      return res.json();
    },
    { initialData: ssrMessages, staleTime: 60 * 60 * 1000 }
  );
}
