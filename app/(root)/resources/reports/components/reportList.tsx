'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Document, Page, pdfjs } from 'react-pdf';
import Pagination from '../../../../../components/shared/pagination';
import { ReportCardProps } from './ReportDetails';

// Set worker src for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

interface ReportListProps {
  reports: ReportCardProps[];
  onSelect: (id: number) => void;
  activeId?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 8;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-2">
        {paginatedReports.map((report, index) => {
          const isActive = activeId !== undefined && report.id === activeId;
          return (
            <Card
              key={report.id ?? index}
              onClick={() => !isActive && onSelect(report.id)}
              tabIndex={0}
              className={`
                group overflow-hidden flex flex-col justify-between rounded-2xl transition-all relative w-full px-6 
                border bg-card/90 dark:bg-card/70 border-border
                shadow-lg hover:shadow-2xl focus:shadow-2xl
                hover:-translate-y-2 focus:-translate-y-2
                hover:scale-[1.025] focus:scale-[1.025]
                duration-300 ease-[cubic-bezier(.4,0,.2,1)]
                outline-none
                ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}
                cursor-pointer
              `}
              style={{ minHeight: 200 }}
            >
              <div className="relative w-full h-[120px] bg-muted flex items-center justify-center rounded-xl mb-4">
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
                      height={100}
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
              <div className="flex-1 flex flex-col justify-end">
                <div className="flex items-end min-h-[3.5rem]">
                  <span
                    className="w-full text-base font-semibold truncate block text-center px-2 py-1
                      bg-transparent text-foreground"
                    title={report.title}
                  >
                    {report.title}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {/* Pagination */}
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
