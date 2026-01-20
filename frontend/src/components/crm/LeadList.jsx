import React from 'react';
import LeadCard from './LeadCard';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const LeadList = ({ documents, pagination, onPageChange, source }) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No leads found</p>
      </div>
    );
  }

  const PaginationControls = () => {
    if (!pagination) return null;

    const { page, totalPages, total } = pagination;
    const start = (page - 1) * pagination.limit + 1;
    const end = Math.min(page * pagination.limit, total);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
        <div className="text-sm text-gray-600">
          Showing {start} to {end} of {total.toLocaleString()} leads
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="btn btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="btn btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="px-4 py-2 text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="btn btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            className="btn btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc, idx) => (
          <LeadCard key={doc._id || idx} lead={doc} source={source} />
        ))}
      </div>
      <PaginationControls />
    </div>
  );
};

export default LeadList;
