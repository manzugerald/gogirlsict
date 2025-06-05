'use client';

import { useSearchParams } from 'next/navigation';
import { Videos, Reports, Articles, Gallery } from '@/components/resources';

const RESOURCE_COMPONENTS = {
  Videos: <Videos />,
  Reports: <Reports />,
  Articles: <Articles />,
  Gallery: <Gallery />
};

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'Videos';

  const SelectedComponent = RESOURCE_COMPONENTS[type] || <Videos />;

  return (
    <main className="p-6 wrapper">
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 lg:px-12">
        <div className="w-full">
          {SelectedComponent}
        </div>
      </div>
    </main>
  );
}
