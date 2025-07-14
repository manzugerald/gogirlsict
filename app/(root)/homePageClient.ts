import { useHybridCachedData } from '@/utils/useHybridCachedData';

export function useHomePageContent(initialData: any) {
  return useHybridCachedData(
    'homePageContent',
    async () => {
      const res = await fetch('/api/homepage-content');
      if (!res.ok) throw new Error('Failed to fetch homepage content');
      return res.json();
    },
    { initialData, staleTime: 5 * 60 * 1000 } // e.g. 5 minutes
  );
}

export function useExecutiveMessages(initialData: any) {
  return useHybridCachedData(
    'executiveMessages',
    async () => {
      const res = await fetch('/api/executive-messages');
      if (!res.ok) throw new Error('Failed to fetch executive messages');
      return res.json();
    },
    { initialData, staleTime: 5 * 60 * 1000 }
  );
}
