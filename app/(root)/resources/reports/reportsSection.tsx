'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ReportList } from '@/components/resources';
import ReportDetails, { ReportCardProps } from './components/reportDetails';

const ReportsSection: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportIdParam = searchParams.get('report');
  const reportId = reportIdParam ? Number(reportIdParam) : null;

  const [reports, setReports] = useState<ReportCardProps[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportCardProps | null>(null);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        const cleaned = data.map((report: any) => ({
          id: report.id,
          title: report.title,
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
                image: report.createdBy.image,
              }
            : undefined,
        }));
        setReports(cleaned);

        if (reportId) {
          const found = cleaned.find((r: ReportCardProps) => r.id === reportId);
          setSelectedReport(found || null);
        } else {
          setSelectedReport(null);
        }
      })
      .catch((err) => console.error('Failed to fetch reports:', err));
  }, [reportId]);

  const handleReportSelect = async (id: number) => {
    const found = reports.find((r) => r.id === id);
    if (!found) return;

    const res = await fetch(`/api/reports/${id}/increment-access`, { method: 'POST' });
    const data = await res.json();

    const updatedReport = {
      ...found,
      accessCount: typeof data.accessCount === 'number' ? data.accessCount : found.accessCount,
    };

    setSelectedReport(updatedReport);
    router.push(`/resources?type=reports&report=${id}`);
  };

  const handleBack = () => {
    setSelectedReport(null);
    router.push(`/resources?type=reports`);
  };

  return (
    <div>
      {!selectedReport ? (
        <ReportList
          reports={reports}
          onSelect={handleReportSelect}
          activeId={selectedReport?.id ?? (reportId || undefined)}
          pageSize={8}
        />
      ) : (
        <ReportDetails
          reports={reports}
          selectedReport={selectedReport}
          onBack={handleBack}
          onSelect={handleReportSelect}
        />
      )}
    </div>
  );
};

export default ReportsSection;
