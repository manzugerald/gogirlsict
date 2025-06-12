'use client';

import { useState } from 'react';
import { ReportCardProps } from './ReportDetails';
import { FileText } from 'lucide-react';
import Pagination from '../shared/pagination';

interface MoreReportsProps {
  reports: ReportCardProps[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

const PAGE_SIZE = 3;

// Unicode-safe truncation to 30 characters
function truncateTitle(title: string, maxLength = 30): string {
  const arr = Array.from(title);
  return arr.length > maxLength ? arr.slice(0, maxLength).join('') + '...' : title;
}

// Format date as "2025 June 11th" with "th" as superscript, left-justified
function formatDateWithSuperscript(dateString?: string): JSX.Element {
  if (!dateString) return <span />;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return <span />;

  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString('default', { month: 'long' });

  function getOrdinalSuffix(n: number): string {
    if (n >= 11 && n <= 13) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
  const suffix = getOrdinalSuffix(day);

  return (
    <span className="text-xs text-gray-500 dark:text-gray-400 block text-left mt-1">
      {year} {month} {day}
      <sup>{suffix}</sup>
    </span>
  );
}

export default function MoreReports({ reports, activeSlug, onSelect }: MoreReportsProps) {
  // Exclude the active report
  const filteredReports = reports.filter(r => r.slug !== activeSlug);
  // Sort by updatedAt, then createdAt as fallback (desc, latest first)
  const sortedReports = [...filteredReports].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt || '').getTime() -
      new Date(a.updatedAt || a.createdAt || '').getTime()
  );

  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(sortedReports.length / PAGE_SIZE);

  // Current page of reports
  const pagedReports = sortedReports.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">
        Latest Reports
      </h2>
      <div className="flex flex-col gap-2 w-full">
        {pagedReports.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-center">No more reports</div>
        )}
        {pagedReports.map((report) => (
          <button
            key={report.slug}
            className="w-full focus:outline-none"
            onClick={() => onSelect(report.slug)}
            type="button"
            tabIndex={0}
          >
            <div
              className={`flex items-start px-3 py-2 rounded-lg shadow-sm border-2 transition min-w-0 w-full
                border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:shadow-md hover:border-[#9f004d] hover:bg-neutral-50 dark:hover:bg-neutral-700`}
              style={{ width: '100%' }}
            >
              <span className="rounded-full bg-pink-800 flex items-center justify-center mr-2" style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}>
                <FileText size={18} color="white" />
              </span>
              <div className="flex flex-col min-w-0 max-w-full">
                <span
                  className="text-base font-medium text-gray-900 dark:text-gray-100 text-left"
                  style={{
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                  }}
                >
                  {truncateTitle(report.title)}
                </span>
                {formatDateWithSuperscript(report.updatedAt || report.createdAt)}
              </div>
            </div>
          </button>
        ))}
      </div>
      {/* Pagination controls */}
      {pageCount > 1 && (
              <Pagination
                currentPage={page + 1}
                totalPages={pageCount}
                onPageChange={p => setPage(p - 1)}
                className="mt-4"
              />
            )}
    </div>
  );
}