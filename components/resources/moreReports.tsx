'use client';

import { ReportCardProps } from '@/app/resources/page';

interface MoreReportsProps {
  reports: ReportCardProps[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

const PdfIcon = () => (
  <svg
    className="w-5 h-5 mr-3 text-red-600 dark:text-red-400 flex-shrink-0"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6.828A2 2 0 0 0 15.414 6L12 2.586A2 2 0 0 0 10.828 2H6zm6 1.414V7a1 1 0 0 0 1 1h3.586A1 1 0 0 1 18 8.414V16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6z" />
  </svg>
);

export default function MoreReports({ reports, activeSlug, onSelect }: MoreReportsProps) {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">
        More reports
      </h2>
      <div className="flex flex-col gap-4 w-full">
        {reports.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-center">No more reports</div>
        )}
        {reports.map((report) => {
          const isActive = report.slug === activeSlug;
          return (
            <button
              key={report.slug}
              className="w-full focus:outline-none"
              onClick={() => !isActive && onSelect(report.slug)}
              type="button"
              tabIndex={isActive ? -1 : 0}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`flex items-start px-5 py-4 rounded-lg shadow-sm border-2 transition min-w-0 w-full
                ${isActive
                  ? 'border-[#9f004d] pointer-events-none opacity-85 bg-white dark:bg-neutral-800'
                  : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:shadow-md hover:border-[#9f004d] hover:bg-neutral-50 dark:hover:bg-neutral-700'
                }`}
                style={{ width: '100%' }}
              >
                <PdfIcon />
                <span
                  className="text-base font-medium text-gray-900 dark:text-gray-100 text-left"
                  style={{
                    wordBreak: 'break-word',
                    display: 'inline-block',
                    minWidth: '20ch',
                    maxWidth: '100%',
                    whiteSpace: 'normal',
                  }}
                >
                  {report.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}