'use client';

import { useEffect, useState } from 'react';
import MoreReports from '@/components/resources/MoreReports';
import { Download, FileText } from 'lucide-react';

export interface ReportCardProps {
  title: string;
  slug: string;
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
  onSelect: (slug: string) => void;
}

const PdfIcon = () => (
  <svg className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6.828A2 2 0 0 0 15.414 6L12 2.586A2 2 0 0 0 10.828 2H6zm6 1.414V7a1 1 0 0 0 1 1h3.586A1 1 0 0 1 18 8.414V16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
  </svg>
);

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
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
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

  // Only set local counts, do not increment on mount
  useEffect(() => {
    setLocalAccessCount(selectedReport?.accessCount ?? null);
    setLocalDownloadCount(selectedReport?.downloadCount ?? null);
  }, [selectedReport?.slug, selectedReport?.accessCount, selectedReport?.downloadCount]);

  useEffect(() => {
    if (selectedReport?.files?.[0]) {
      fetch(selectedReport.files[0], { method: "HEAD" }).then(res => {
        setFileMeta({
          size: Number(res.headers.get('content-length')),
        });
      });
    } else {
      setFileMeta({});
    }
  }, [selectedReport]);

  const handleDownload = () => {
    if (selectedReport?.files?.[0]) {
      // Increment download count in the backend and update local
      fetch(`/api/reports/${selectedReport.slug}/increment-download`, {
        method: 'POST'
      })
        .then(res => res.json())
        .then(data => {
          if (typeof data.downloadCount === "number") {
            setLocalDownloadCount(data.downloadCount);
          }
        });

      // Download file
      const link = document.createElement('a');
      link.href = selectedReport.files[0];
      link.download = selectedReport.title + '.pdf';
      link.target = "_blank";
      link.click();
    }
  };

  if (!selectedReport) return null;

  // For uploader info
  const uploader = selectedReport.createdBy;
  const uploaderName = uploader
    ? [uploader.firstName, uploader.lastName].filter(Boolean).join(' ')
    : 'Unknown';
  const uploaderPhoto = uploader?.image || undefined;

  //debug
  console.log('Uploader debug:', {
    uploader,
    uploaderName,
    uploaderPhoto
  });

  return (
    <div className="mt-8 w-full flex flex-col items-center">
      {/* Title & Uploaded By */}
      <div className="w-full max-w-7xl mx-auto mb-0 rounded bg-gray-100 dark:bg-neutral-800 transition-colors duration-200">
        <div className="flex flex-col items-center w-full py-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center w-full mb-3">
            {selectedReport.title}
          </h2>
          <div className="flex items-center justify-center gap-2 rounded px-4 py-2">
            <span className="text-sm text-gray-700 dark:text-gray-200">Uploaded By:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {uploader?.firstName || "Unknown"}
              {uploader?.lastName ? ` ${uploader.lastName}` : ""}
            </span>
            {uploader?.image && (
              <img
                src={uploader.image}
                alt={
                  uploader?.firstName || uploader?.lastName
                    ? `${uploader.firstName || ""} ${uploader.lastName || ""}`.trim()
                    : "Uploader"
                }
                className="w-7 h-7 rounded-full object-cover border border-white"
                style={{ background: "#fff" }}
              />
            )}
          </div>
        </div>
      </div>
      {/* Back to reports button below the title/uploader div */}
      <button
        className="mt-4 mb-2 px-4 py-2 bg-gray-200 dark:bg-neutral-800 rounded hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-100 font-medium flex items-center"
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
              style={{ width: "100%", maxWidth: `${IMAGE_WIDTH}px`, minWidth: `${IMAGE_WIDTH}px` }}
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
          
            <span className="rounded-full bg-pink-800 flex items-center justify-center mr-2" style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}>
              <FileText size={18} color="white" />
            </span>
            Download Report
            {/* <Download
              className="w-5 h-5 ml-2 transition-colors duration-200 group-hover:text-[#9f004d] text-white"
              /> */}
              <span className="rounded-full bg-pink-800 flex items-center justify-center mr-2" style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}>
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
                <td className="border px-4 py-2">{localAccessCount ?? selectedReport.accessCount}</td>
              </tr>
              <tr className="hover:bg-[#9f004d] hover:text-white transition-colors">
                <td className="border px-4 py-2">Download Count</td>
                <td className="border px-4 py-2">{localDownloadCount ?? selectedReport.downloadCount}</td>
              </tr>
              <tr className="hover:bg-[#9f004d] hover:text-white transition-colors">
                <td className="border px-4 py-2">Date Created</td>
                <td className="border px-4 py-2">{formatDateWithSuperscript(selectedReport.createdAt)}</td>
              </tr>
              <tr className="hover:bg-[#9f004d] hover:text-white transition-colors">
                <td className="border px-4 py-2">Date Modified</td>
                <td className="border px-4 py-2">{formatDateWithSuperscript(selectedReport.updatedAt)}</td>
              </tr>
              <tr className="hover:bg-[#9f004d] hover:text-white transition-colors">
                <td className="border px-4 py-2">File Size</td>
                <td className="border px-4 py-2">
                  {fileMeta.size !== undefined
                    ? `${(fileMeta.size / 1024).toFixed(2)} KB`
                    : "Loading..."}
                </td>
              </tr>
              <tr className="hover:bg-[#9f004d] hover:text-white transition-colors">
                <td className="border px-4 py-2">Document Type</td>
                <td className="border px-4 py-2">
                  {selectedReport.files?.[0]
                    ? getFileExtension(selectedReport.files[0])
                    : ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Right: MoreReports */}
        <div className="w-full lg:w-[340px] flex flex-col items-center lg:items-start">
          <MoreReports
            reports={reports}
            activeSlug={selectedReport.slug}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
}