'use client';

import { useParams, useSearchParams } from 'next/navigation';
import ProjectHero from '@/components/shared/header/project-header';
import VideosSection from '../videos/videosSection';
import ReportsSection from '../reports/reportsSection';
import React, { useState } from 'react';

const SECTION_LABELS: Record<string, string> = {
  videos: 'GoGirls ICT Videos',
  reports: 'GoGirls ICT Reports',
};

export default function ResourcesSectionPage() {
  // Use the dynamic segment from the URL
  const params = useParams();
  const section = Array.isArray(params.section) ? params.section[0] : params.section || 'videos';

  const currentType = section.toLowerCase();

  // State to hold uploader info (for reports)
  const [reportUploader, setReportUploader] = useState<string | null>(null);
  const [reportUploaderImage, setReportUploaderImage] = useState<string | null>(null);

  // Optionally, get search params for report title
  const searchParams = useSearchParams();
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
              <span className="font-medium">{reportUploader}</span>
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
