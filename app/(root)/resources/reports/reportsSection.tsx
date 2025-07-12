'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ReportList } from '@/components/resources';
import ReportDetails, { ReportCardProps } from './components/reportDetails';

interface ReportsSectionProps {
  setReportUploader?: (uploader: string | null) => void;
  setReportUploaderImage?: (image: string | null) => void;
  reports?: ReportCardProps[];
}

const ReportsSection: React.FC<ReportsSectionProps> = ({
  setReportUploader,
  setReportUploaderImage,
  reports: propReports,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportIdParam = searchParams.get('report');
  const reportId = reportIdParam ? Number(reportIdParam) : null;

  const [reports, setReports] = useState<ReportCardProps[]>(propReports || []);
  const [selectedReport, setSelectedReport] = useState<ReportCardProps | null>(null);

  // Fetch only if propReports is not provided
  useEffect(() => {
    if (propReports && propReports.length > 0) {
      setReports(propReports);
      return;
    }
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
          // Set uploader info in parent if report is found
          if (found) {
            let uploader = '';
            if (found.createdBy) {
              uploader = [found.createdBy.firstName, found.createdBy.lastName]
                .filter(Boolean)
                .join(' ');
            }
            setReportUploader?.(uploader || null);
            setReportUploaderImage?.(found.createdBy?.image || null);
          } else {
            setReportUploader?.(null);
            setReportUploaderImage?.(null);
          }
        } else {
          setSelectedReport(null);
          setReportUploader?.(null);
          setReportUploaderImage?.(null);
        }
      })
      .catch((err) => console.error('Failed to fetch reports:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, propReports]);

  const handleReportSelect = async (id: number) => {
    const found = reports.find((r) => r.id === id);
    if (!found) return;

    // update access count
    const res = await fetch(`/api/reports/${id}/increment-access`, { method: 'POST' });
    const data = await res.json();

    const updatedReport = {
      ...found,
      accessCount: typeof data.accessCount === 'number' ? data.accessCount : found.accessCount,
    };

    setSelectedReport(updatedReport);

    // Set uploader info in parent
    let uploader = '';
    if (found.createdBy) {
      uploader = [found.createdBy.firstName, found.createdBy.lastName].filter(Boolean).join(' ');
    }
    setReportUploader?.(uploader || null);
    setReportUploaderImage?.(found.createdBy?.image || null);

    // Only set the title in the URL; update to /resources/reports?report=...&reportTitle=...
    const params = new URLSearchParams();
    params.set('report', id.toString());
    params.set('reportTitle', found.title || '');
    router.push(`/resources/reports?${params.toString()}`);
  };

  const handleBack = () => {
    setSelectedReport(null);
    setReportUploader?.(null);
    setReportUploaderImage?.(null);
    router.push(`/resources/reports`);
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
