'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Document, Page, pdfjs } from 'react-pdf';
import Pagination from '../../../../../components/shared/pagination';
import { ReportCardProps } from './ReportDetails';
import { cardHoverClass } from '@/utils/styles/card-hover';
import clsx from 'clsx';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

interface ReportListProps {
  reports: ReportCardProps[];
  onSelect: (id: number) => void;
  activeId?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 8;

function formatDate(date: string | Date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const ReportList = ({
  reports,
  onSelect,
  activeId,
  pageSize = DEFAULT_PAGE_SIZE,
}: ReportListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(reports.length / pageSize);
  const paginatedReports = reports.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-6">
        {paginatedReports.map((report, index) => {
          const isActive = activeId !== undefined && report.id === activeId;

          return (
            <Card
              key={report.id ?? index}
              onClick={() => !isActive && onSelect(report.id)}
              tabIndex={0}
              className={clsx(
                'group flex flex-col justify-start w-full outline-none px-0 pt-4 pb-0',
                cardHoverClass,
                isActive && 'ring-2 ring-primary ring-offset-2'
              )}
              style={{ minHeight: 370, position: 'relative' }}
            >
              {/* PDF Preview */}
              <div className="relative w-full max-w-[240px] mx-auto h-[280px] bg-muted flex items-center justify-center rounded-t-xl overflow-hidden">
                {report.files?.[0] && report.files[0].endsWith('.pdf') ? (
                  <Document
                    file={report.files[0]}
                    loading={<span className="text-muted-foreground">Loading preview...</span>}
                    error={<span className="text-destructive">Failed to load PDF</span>}
                    noData={<span className="text-muted-foreground">No PDF file</span>}
                  >
                    <Page
                      pageNumber={1}
                      width={240}
                      height={280}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                    No preview
                  </div>
                )}

                {/* Active overlay */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/40 z-20 flex items-center justify-center pointer-events-none rounded-2xl">
                    <span className="text-white font-bold text-center text-lg">Active</span>
                  </div>
                )}
              </div>

              {/* Title & Date Overlay - always fills till the bottom and is vertically centered */}
              <div
                className="flex-1 flex flex-col justify-center items-center w-full 
                bg-black/80 dark:bg-black/60 backdrop-blur-sm text-white text-center px-4 py-3 rounded-b-xl min-h-[90px]"
              >
                <div className="text-sm font-semibold leading-snug line-clamp-2">
                  {report.title}
                </div>
                <div className="text-xs mt-1">
                  {report.createdAt ? formatDate(report.createdAt) : ''}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-10"
        />
      )}
    </div>
  );
};

export default ReportList;
