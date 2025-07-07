'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProjectHero from '@/components/shared/header/project-header';
import VideosSection from './videos/videosSection';
import ReportsSection from './reports/reportsSection';

type SectionType = 'videos' | 'reports';
const SECTION_LABELS: Record<SectionType, string> = {
  videos: 'GoGirls ICT Videos',
  reports: 'GoGirls ICT Reports'
};

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const currentType = (searchParams.get('type')?.toLowerCase() as SectionType) || 'videos';

  // State to hold uploader info (Option 1)
  const [reportUploader, setReportUploader] = useState<string | null>(null);
  const [reportUploaderImage, setReportUploaderImage] = useState<string | null>(null);

  // Pull report title from search param (if available)
  const reportTitle = searchParams.get('reportTitle');

  // Compose catalogue label for reports
  let catalogueTitle = SECTION_LABELS[currentType];
  if (currentType === 'reports' && reportTitle) {
    catalogueTitle = `GoGirls ICT Reports Catalogue: ${reportTitle}`;
  }

  return (
    <>
      {currentType !== 'videos' && <ProjectHero />}
      {/* Only show catalogue div if not videos */}
      {currentType !== 'videos' && (
        <div
          className="fixed left-0 right-0 z-30 flex flex-col items-center bg-white/90 text-black shadow py-4 px-8 justify-center text-center w-full max-w-7xl mx-auto transition-all duration-300 backdrop-blur-md"
          style={{ top: '40px' }}
        >
          <h2 className="text-2xl font-bold mt-2 pt-4">{catalogueTitle}</h2>
          {reportTitle && reportUploader && (
            <div className="mt-1 flex items-center gap-2text-base text-black">
              <span>Uploaded By:</span>
              <span className="font-medium">
                {reportUploader}
              </span>
              {reportUploaderImage && (
                <img
                  src={reportUploaderImage}
                  alt={reportUploader}
                  className="w-7 h-7 rounded-full object-cover border border-white"
                  style={{ background: '#fff' }}
                />
              )}
            </div>
          )}
        </div>
      )}

      <main className="p-1 wrapper">
        <div
          className="max-w-7xl w-full mx-auto px-4 md:px-2 lg:px-2"
          style={{ paddingTop: currentType !== 'videos' ? '1rem' : '4.5rem' }}
        >
          {currentType === 'videos' && <VideosSection />}
          {currentType === 'reports' && (
            <ReportsSection
              setReportUploader={setReportUploader}
              setReportUploaderImage={setReportUploaderImage}
            />
          )}
        </div>
      </main>
    </>
  );
}
