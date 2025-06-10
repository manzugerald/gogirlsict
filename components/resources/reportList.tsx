'use client';

import { Card } from "@/components/ui/card";
import { Document, Page, pdfjs } from "react-pdf";
import { ReportCardProps } from "@/app/resources/page";

// Set worker src for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

interface ReportListProps {
  reports: ReportCardProps[];
  onSelect: (slug: string) => void;
  activeSlug?: string;
}

const ReportList = ({ reports, onSelect, activeSlug }: ReportListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center">
      {reports.map((report, index) => {
        const isActive = activeSlug && report.slug === activeSlug;
        return (
          <div
            key={index}
            onClick={() => !isActive && onSelect(report.slug)}
            className={`cursor-pointer w-full relative group`}
          >
            <Card
              className={`overflow-hidden flex flex-col p-0 hover:shadow-lg transition relative w-[200px] ${
                isActive ? "ring-2 ring-[#9f004d] ring-offset-2" : ""
              }`}
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
                <div className="absolute bottom-0 left-0 right-0 z-10 bg-background bg-opacity-80 backdrop-blur-sm text-foreground px-2 py-1">
                  <span className="text-sm font-semibold leading-tight truncate block text-center">
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
  );
};

export default ReportList;