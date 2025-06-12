'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Document, Page, pdfjs } from "react-pdf";
// import { ReportCardProps } from "@/app/resources";
import Pagination from "../shared/pagination";
import { ReportCardProps } from "./ReportDetails";

// Set worker src for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

interface ReportListProps {
  reports: ReportCardProps[];
  onSelect: (slug: string) => void;
  activeSlug?: string;
  pageSize?: number; // allow custom page size (default 8)
}

const DEFAULT_PAGE_SIZE = 8;

const ReportList = ({ reports, onSelect, activeSlug, pageSize = DEFAULT_PAGE_SIZE }: ReportListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(reports.length / pageSize);
  const paginatedReports = reports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center">
        {paginatedReports.map((report, index) => {
          const isActive = activeSlug && report.slug === activeSlug;
          return (
            <div
              key={index}
              onClick={() => !isActive && onSelect(report.slug)}
              className={`cursor-pointer w-full relative group`}
            >
              <Card
  className={`overflow-hidden flex flex-col p-0 rounded-xl transition relative w-[200px] border-2 bg-background border-[#9f004d] dark:border-[hsl(var(--background))]
    shadow-[0_2px_8px_0_rgba(159,0,77,0.10),0_8px_24px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_0_rgba(159,0,77,0.20),0_8px_24px_4px_rgba(0,0,0,0.32)]
    hover:shadow-[0_8px_32px_0_rgba(159,0,77,0.18),0_16px_48px_8px_rgba(0,0,0,0.16)] dark:hover:shadow-[0_8px_32px_0_rgba(159,0,77,0.30),0_16px_48px_8px_rgba(0,0,0,0.40)]
    ${isActive ? "ring-2 ring-[#9f004d] ring-offset-2" : ""}
  `}
>
  <div className="relative w-full h-[144px] bg-muted flex items-center justify-center">
    {report.files?.[0] && report.files[0].endsWith('.pdf') ? (
      <Document
        file={report.files[0]}
        loading={<span className="text-muted-foreground">Loading preview...</span>}
        error={<span className="text-destructive">Failed to load PDF</span>}
        noData={<span className="text-muted-foreground">No PDF file</span>}>
        <Page
          pageNumber={1}
          width={200}
          height={144}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    ) : (
      <div className="flex items-center justify-center w-full h-full text-muted-foreground">
        No preview
      </div>
    )}

    {/* Title overlay at bottom */}
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-[#9f004d] p-2 m-1 dark:bg-background bg-opacity-80 backdrop-blur-sm text-foreground rounded border border-[hsl(var(--background))] shadow-[0_2px_8px_0_rgba(159,0,77,0.15)] dark:shadow-[0_2px_8px_0_rgba(159,0,77,0.25)]">
      <span className="text-white text-sm font-semibold leading-tight truncate block text-center">
        {report.title}
      </span>
    </div>
    {/* Active overlay */}
    {isActive && (
      <div className="absolute inset-0 bg-[#9f004d] bg-opacity-60 z-20 flex items-center justify-center pointer-events-none rounded">
        <span className="text-white font-bold text-center text-sm">Active</span>
      </div>
    )}
  </div>
</Card>
            </div>
          );
        })}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-8"
        />
      )}
    </div>
  );
};

export default ReportList;