'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import ProjectHero from '@/components/shared/header/project-header';
import VideosSection from './videos/videosSection';
import ReportsSection from './reports/reportsSection';

type SectionType = 'videos' | 'reports';
const SECTION_LABELS: Record<SectionType, string> = {
  videos: 'GoGirls ICT Videos Catalogue',
  reports: 'GoGirls ICT Reports Catalogue',
};

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const currentType = (searchParams.get('type')?.toLowerCase() as SectionType) || 'videos';

  return (
    <>
      {currentType !== 'videos' && <ProjectHero />}
      {/* Only show catalogue div if not videos */}
      {currentType !== 'videos' && (
        <div
          className="fixed left-0 right-0 z-30 flex justify-center bg-white/90 dark:bg-neutral-900/90 shadow py-4"
          style={{ top: '40px' }} // Adjust top if needed
        >
          <h2 className="text-2xl font-bold mt-2">{SECTION_LABELS[currentType]}</h2>
        </div>
      )}

      <main className="p-1 wrapper">
        <div
          className="max-w-7xl w-full mx-auto px-4 md:px-2 lg:px-2"
          style={{ paddingTop: currentType !== 'videos' ? '1rem' : '4.5rem' }} // Adjust so content is not hidden behind the fixed title
        >
          {currentType === 'videos' && <VideosSection />}
          {currentType === 'reports' && <ReportsSection />}
        </div>
      </main>
    </>
  );
}
