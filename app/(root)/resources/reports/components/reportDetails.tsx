'use client';

import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import MoreReports from './moreReports';
import ReportList from './reportList';

export interface ReportCardProps {
  id: number;
  title: string;
  files: string[];
  images: string[];
  accessCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    firstName?: string;
    lastName?: string;
    image?: string;
  };
}

interface ReportDetailsProps {
  reports: ReportCardProps[];
  selectedReport: ReportCardProps | null;
  onBack: () => void;
  onSelect: (id: number) => void;
}

function formatDateWithSuperscript(dateStr?: string): JSX.Element | string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  const year = date.getFullYear();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();
  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };
  const ordinal = getOrdinal(day);
  return (
    <>
      {year} {month} {day}
      <sup>{ordinal}</sup>
    </>
  );
}

function getFileExtension(filename: string = ''): string {
  const arr = filename.split('.');
  if (arr.length < 2) return '';
  return arr[arr.length - 1].toUpperCase();
}

const IMAGE_WIDTH = 280;

export default function ReportDetails({
  reports,
  selectedReport,
  onBack,
  onSelect,
}: ReportDetailsProps) {
  const [fileMeta, setFileMeta] = useState<{ size?: number }>({});
  const [localAccessCount, setLocalAccessCount] = useState<number | null>(null);
  const [localDownloadCount, setLocalDownloadCount] = useState<number | null>(null);

  useEffect(() => {
    setLocalAccessCount(selectedReport?.accessCount ?? null);
    setLocalDownloadCount(selectedReport?.downloadCount ?? null);
  }, [selectedReport?.id, selectedReport?.accessCount, selectedReport?.downloadCount]);

  useEffect(() => {
    if (selectedReport?.files?.[0]) {
      fetch(selectedReport.files[0], { method: 'HEAD' }).then((res) => {
        setFileMeta({
          size: Number(res.headers.get('content-length')),
        });
      });
    } else {
      setFileMeta({});
    }
  }, [selectedReport]);

  const handleDownload = () => {
    if (selectedReport?.files?.[0] && selectedReport?.id != null) {
      // Increment download count in the backend and update local
      fetch(`/api/reports/${selectedReport.id}/increment-download`, {
        method: 'POST',
      })
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.downloadCount === 'number') {
            setLocalDownloadCount(data.downloadCount);
          }
        });

      // Download file
      const link = document.createElement('a');
      link.href = selectedReport.files[0];
      link.download = selectedReport.title + '.pdf';
      link.target = '_blank';
      link.click();
    }
  };

  if (!selectedReport) return null;

  // Exclude the current report from the appended list
  const otherReports = reports.filter((r) => r.id !== selectedReport.id);

  return (
    <div className="w-full flex flex-col items-center">
      <button
        className="mb-2 px-4 bg-gray-200 dark:bg-neutral-800 rounded hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-100 font-medium flex items-center"
        onClick={onBack}
      >
        ← Back to reports
      </button>
      {/* Responsive layout: image/table/MoreReports */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-center gap-4">
        {/* Left: Image + Download */}
        <div
          className="w-full flex-shrink-0 flex flex-col items-center lg:items-start justify-center lg:justify-start"
          style={{ maxWidth: `${IMAGE_WIDTH}px`, minWidth: `${IMAGE_WIDTH}px` }}
        >
          {selectedReport.images?.[0] ? (
            <img
              src={selectedReport.images[0]}
              alt={selectedReport.title}
              className="max-h-[280px] w-full object-contain rounded shadow border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              style={{ width: '100%', maxWidth: `${IMAGE_WIDTH}px`, minWidth: `${IMAGE_WIDTH}px` }}
            />
          ) : (
            <div className="text-muted-foreground text-center">No image available</div>
          )}
          {/* Download Button moved here */}
          {selectedReport.files?.[0] && (
            <button
              className={`
                flex items-center mt-4 bg-[#9f004d] text-white rounded shadow transition
                w-full
                max-w-[${IMAGE_WIDTH}px]
                min-w-[${IMAGE_WIDTH}px]
                justify-center
                py-2
                hover:bg-gray-100 hover:text-[#9f004d]
                dark:hover:bg-neutral-100 dark:hover:text-[#9f004d]
                group
              `}
              onClick={handleDownload}
            >
              <span
                className="rounded-full bg-pink-800 flex items-center justify-center mr-2"
                style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}
              >
                <FileText size={18} color="white" />
              </span>
              Download Report
              <span
                className="rounded-full bg-pink-800 flex items-center justify-center mr-2"
                style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}
              >
                <Download size={18} color="white" />
              </span>
            </button>
          )}
        </div>
        {/* Middle: Table */}
        <div className="w-full lg:w-[340px] flex flex-col items-center">
          <table className="table-auto border-collapse w-full shadow rounded bg-white dark:bg-neutral-800 mb-6">
            <thead>
              <tr>
                <th
                  colSpan={2}
                  className="border border-neutral-200 dark:border-neutral-600 px-4 py-2 text-center text-lg bg-gray-100 dark:bg-neutral-700 font-semibold"
                >
                  Report Information
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-[#9f004d] hover:text-white transition-colors">
                <td className="border px-4 py-2">Access Count</td>
                <td className="border px-4 py-2">
                  {localAccessCount ?? selectedReport.accessCount}
                </td>
              </tr>
              <tr className="hover:bg-[#9f004d] hover:text-white transition-colors">
                <td className="border px-4 py-2">Download Count</td>
                <td className="border px-4 py-2">
                  {localDownloadCount ?? selectedReport.downloadCount}
                </td>
              </tr>
              <tr className="hover:bg-[#9f004d] hover:text-white transition-colors">
                <td className="border px-4 py-2">Date Created</td>
                <td className="border px-4 py-2">
                  {formatDateWithSuperscript(selectedReport.createdAt)}
                </td>
              </tr>
              <tr className="hover:bg-[#9f004d] hover:text-white transition-colors">
                <td className="border px-4 py-2">Date Modified</td>
                <td className="border px-4 py-2">
                  {formatDateWithSuperscript(selectedReport.updatedAt)}
                </td>
              </tr>
              <tr className="hover:bg-[#9f004d] hover:text-white transition-colors">
                <td className="border px-4 py-2">File Size</td>
                <td className="border px-4 py-2">
                  {fileMeta.size !== undefined
                    ? `${(fileMeta.size / 1024).toFixed(2)} KB`
                    : 'Loading...'}
                </td>
              </tr>
              <tr className="hover:bg-[#9f004d] hover:text-white transition-colors">
                <td className="border px-4 py-2">Document Type</td>
                <td className="border px-4 py-2">
                  {selectedReport.files?.[0] ? getFileExtension(selectedReport.files[0]) : ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Right: MoreReports */}
        <div className="w-full lg:w-[340px] flex flex-col items-center lg:items-start">
          <MoreReports reports={reports} activeId={selectedReport.id} onSelect={onSelect} />
        </div>
      </div>
      {/* Appended Report List (excluding current) */}
      {otherReports.length > 0 && (
        <div className="w-full max-w-7xl mx-auto mt-10">
          <h3 className="text-xl font-bold mb-4">Other Reports</h3>
          <ReportList
            reports={otherReports}
            onSelect={onSelect}
            pageSize={8}
            activeId={undefined}
          />
        </div>
      )}
    </div>
  );
}
