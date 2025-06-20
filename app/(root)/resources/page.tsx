'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Videos, Articles, Gallery, ReportList } from '@/components/resources';
import ReportDetails, { ReportCardProps } from '@/components/resources/ReportDetails';
import ProjectHero from '@/components/shared/header/project-header';

const ResourcesPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get('type') || 'Videos';
  const reportSlug = searchParams.get('report') || null;

  const [reports, setReports] = useState<ReportCardProps[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportCardProps | null>(null);

  useEffect(() => {
    if (type === 'Reports') {
      fetch('/api/reports')
        .then((res) => res.json())
        .then((data) => {
          const cleaned = data.map((report: any) => ({
            title: report.title,
            slug: report.slug,
            files: report.files || [],
            images: report.images || [],
            accessCount: report.accessCount ?? 0,
            downloadCount: report.downloadCount ?? 0,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
            createdBy: report.createdBy
              ? {
                  firstName: report.createdBy.firstName,
                  lastName: report.createdBy.lastName,
                  image: report.createdBy.image, // For profile photo
                }
              : undefined,
          }));
          setReports(cleaned);

          // If a report is in the URL, select it (do not increment)
          if (reportSlug) {
            const found = cleaned.find((r: ReportCardProps) => r.slug === reportSlug);
            setSelectedReport(found || null);
          } else {
            setSelectedReport(null);
          }
        })
        .catch((err) => console.error("Failed to fetch reports:", err));
    }
  }, [type, reportSlug]);

  // When user selects a report (from list or more reports)
  const handleReportSelect = async (slug: string) => {
    const found = reports.find((r) => r.slug === slug);
    if (!found) return;

    // Increment access count on click only and get new value
    const res = await fetch(`/api/reports/${slug}/increment-access`, { method: 'POST' });
    const data = await res.json();

    // Update the selectedReport with the new accessCount
    const updatedReport = {
      ...found,
      accessCount: typeof data.accessCount === "number" ? data.accessCount : found.accessCount,
    };

    setSelectedReport(updatedReport);

    // Update the URL with the selected report (without reload)
    router.push(`/resources?type=Reports&report=${slug}`);
  };

  const handleBack = () => {
    setSelectedReport(null);
    // Remove the report param from the URL
    router.push(`/resources?type=Reports`);
  };

  const RESOURCE_COMPONENTS: Record<string, React.ReactNode> = {
    Videos: <Videos />,
    Articles: <Articles />,
    Gallery: <Gallery />,
    Reports: (
      !selectedReport ? (
        <ReportList
          reports={reports}
          onSelect={handleReportSelect}
          // activeSlug={selectedReport?.slug}
          pageSize={8}
        />
      ) : (
        <ReportDetails
          reports={reports}
          selectedReport={selectedReport}
          onBack={handleBack}
          onSelect={handleReportSelect}
        />
      )
    ),
  };

  const SelectedComponent = RESOURCE_COMPONENTS[type] || <Videos />;

  const getCatalogueTitle = (type: string) => {
    switch (type) {
      case 'Reports': return 'Reports Catalogue';
      case 'Videos': return 'Videos Catalogue';
      case 'Articles': return 'Articles Catalogue';
      case 'Events': return 'Events Catalogue';
    }
  }

  return (
    <>
      <ProjectHero />
      <main className="p-6 wrapper">
        <div className="max-w-7xl w-full mx-auto px-4 md:px-8 lg:px-12">
          {(['Reports', 'Articles', 'Videos'].includes(type)) && !selectedReport && (
            <div className="w-full max-w-7xl mx-auto mb-0 rounded bg-gray-100 dark:bg-neutral-800 transition-colors duration-200">
              <div className="flex flex-col items-center w-full py-6 mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-center w-full mb-3">
                  {getCatalogueTitle(type)}
                </h2>
              </div>
            </div>
          )}
          <div className="w-full">{SelectedComponent}</div>
        </div>
      </main>
    </>
  );
};

export default ResourcesPage;