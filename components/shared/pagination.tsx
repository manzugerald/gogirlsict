'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className={`flex justify-center gap-2 mt-4 ${className}`}>
      <button
        disabled={currentPage === 1}
        className={`px-4 py-1 rounded border text-sm font-medium transition
          ${currentPage === 1 ? 'bg-gray-200 dark:bg-neutral-700 text-gray-400 border' : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 border hover:bg-[#fce6f2]'}
        `}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      <span
        className="px-3 py-1 rounded text-sm font-medium"
        style={{ background: '#9f004d', color: '#fff' }}
      >
        {currentPage} / {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        className={`px-4 py-1 rounded border text-sm font-medium transition
          ${currentPage === totalPages ? 'bg-gray-200 dark:bg-neutral-700 text-gray-400 border' : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 border hover:bg-[#fce6f2]'}
        `}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}