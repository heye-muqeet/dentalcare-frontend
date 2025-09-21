import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex justify-between items-center mt-4 text-xs">
      <button 
        className="px-3 py-1 bg-gray-200 rounded-lg"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>
      <div className="flex space-x-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
          <button
            key={i + 1}
            className={`px-2 py-1 ${
              currentPage === i + 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            } rounded-lg`}
            onClick={() => onPageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        {totalPages > 5 && <span className="px-2 py-1">...</span>}
        {totalPages > 5 && (
          <button
            className="px-2 py-1 bg-gray-200 rounded-lg"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        )}
      </div>
      <button
        className="px-3 py-1 bg-gray-200 rounded-lg"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  );
}; 