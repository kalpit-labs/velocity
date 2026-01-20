import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, BarChart3, Filter, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { getDocuments, exportToCSV } from '../services/api';
import DocumentTable from '../components/document/DocumentTable';
import SearchBar from '../components/search/SearchBar';
import Loading from '../components/common/Loading';
import StatsBar from '../components/crm/StatsBar';
import TimeFilter from '../components/crm/TimeFilter';
import SortControls from '../components/crm/SortControls';
import LeadList from '../components/crm/LeadList';

const CollectionView = () => {
  const { dbName, collName } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [timeRange, setTimeRange] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('crm'); // 'crm' or 'table'

  useEffect(() => {
    fetchDocuments();
  }, [dbName, collName, page, filter, timeRange, sortField, sortOrder]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        sort: sortField,
        order: sortOrder,
        timeRange
      };

      if (filter) {
        params.filter = JSON.stringify(filter);
      }

      const response = await getDocuments(dbName, collName, params);
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (searchTerm) => {
    try {
      const parsedFilter = JSON.parse(searchTerm);
      setFilter(parsedFilter);
    } catch (e) {
      // If not valid JSON, create a simple name search
      if (searchTerm.trim()) {
        setFilter({ name: { $regex: searchTerm, $options: 'i' } });
      }
    }
    setPage(1);
  };

  const handleClearSearch = () => {
    setFilter(null);
    setPage(1);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setPage(1);
  };

  const handleSortChange = (field, order) => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = { timeRange };
      if (filter) {
        params.filter = JSON.stringify(filter);
      }
      await exportToCSV(dbName, collName, params);
    } catch (err) {
      console.error('Error exporting:', err);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !data) return <Loading message="Loading leads..." />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button onClick={fetchDocuments} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{decodeURIComponent(collName)}</h1>
        {data && data.pagination && (
          <p className="text-gray-600">
            {data.pagination.total.toLocaleString()} lead{data.pagination.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Stats Bar */}
      <StatsBar dbName={dbName} collName={collName} />

      {/* Time Filter */}
      <div className="mb-6">
        <TimeFilter selectedRange={timeRange} onRangeChange={handleTimeRangeChange} />
      </div>

      {/* Controls Bar */}
      <div className="mb-6 space-y-4">
        <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />

        <div className="flex flex-wrap items-center gap-3">
          {/* Sort Controls */}
          <SortControls
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('crm')}
              className={`px-3 py-2 rounded-l-lg flex items-center space-x-2 text-sm font-medium transition-colors ${
                viewMode === 'crm'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid size={16} />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-r-lg flex items-center space-x-2 text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <TableIcon size={16} />
              <span>Table</span>
            </button>
          </div>

          {/* Export & Analytics */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Download size={18} />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <Link
            to={`/database/${encodeURIComponent(dbName)}/collection/${encodeURIComponent(collName)}/analytics`}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </Link>

          {/* Active Filters Indicator */}
          {(filter || timeRange !== 'all') && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
              <Filter size={16} />
              <span>
                {timeRange !== 'all' && 'Time filter active'}
                {timeRange !== 'all' && filter && ' • '}
                {filter && 'Search filter active'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {data && (
        <>
          {viewMode === 'crm' ? (
            <LeadList
              documents={data.documents}
              pagination={data.pagination}
              onPageChange={handlePageChange}
              source={collName}
            />
          ) : (
            <DocumentTable
              documents={data.documents}
              pagination={data.pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CollectionView;
