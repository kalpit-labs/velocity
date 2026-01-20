import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Code, Table as TableIcon } from 'lucide-react';
import ReactJson from 'react-json-view';

const DocumentTable = ({ documents, pagination, onPageChange }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'

  if (!documents || documents.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No documents found</p>
      </div>
    );
  }

  // Extract all unique keys from documents
  const getAllKeys = () => {
    const keysSet = new Set();
    documents.forEach(doc => {
      Object.keys(doc).forEach(key => keysSet.add(key));
    });
    return Array.from(keysSet);
  };

  const keys = getAllKeys();

  const renderValue = (value) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }
    if (typeof value === 'object') {
      return <span className="text-blue-600">Object</span>;
    }
    if (typeof value === 'boolean') {
      return <span className={value ? 'text-green-600' : 'text-red-600'}>{String(value)}</span>;
    }
    if (typeof value === 'string' && value.length > 100) {
      return <span className="text-gray-700">{value.substring(0, 100)}...</span>;
    }
    return <span className="text-gray-700">{String(value)}</span>;
  };

  const PaginationControls = () => {
    if (!pagination) return null;

    const { page, totalPages, total } = pagination;
    const start = (page - 1) * pagination.limit + 1;
    const end = Math.min(page * pagination.limit, total);

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing {start} to {end} of {total} documents
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="btn btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="btn btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            className="btn btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* View Mode Toggle */}
      <div className="flex items-center justify-end mb-4 space-x-2">
        <button
          onClick={() => setViewMode('table')}
          className={`btn p-2 ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <TableIcon size={18} />
        </button>
        <button
          onClick={() => setViewMode('json')}
          className={`btn p-2 ${viewMode === 'json' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Code size={18} />
        </button>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {keys.map((key) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc, idx) => (
                <tr key={doc._id || idx} className="hover:bg-gray-50">
                  {keys.map((key) => (
                    <td key={key} className="px-6 py-4 whitespace-nowrap text-sm">
                      {renderValue(doc[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* JSON View */}
      {viewMode === 'json' && (
        <div className="space-y-4">
          {documents.map((doc, idx) => (
            <div key={doc._id || idx} className="card">
              <ReactJson
                src={doc}
                theme="rjv-default"
                collapsed={1}
                displayDataTypes={false}
                displayObjectSize={true}
                enableClipboard={true}
                style={{ fontSize: '14px' }}
              />
            </div>
          ))}
        </div>
      )}

      <PaginationControls />
    </div>
  );
};

export default DocumentTable;
