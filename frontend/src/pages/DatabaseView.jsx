import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Table, ChevronRight, FileText } from 'lucide-react';
import { getCollections } from '../services/api';
import Loading from '../components/common/Loading';

const DatabaseView = () => {
  const { dbName } = useParams();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, [dbName]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await getCollections(dbName);
      setCollections(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (loading) return <Loading message="Loading collections..." />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button onClick={fetchCollections} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{decodeURIComponent(dbName)}</h1>
        <p className="text-gray-600">
          {collections.length} collection{collections.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((coll) => (
          <Link
            key={coll.name}
            to={`/database/${encodeURIComponent(dbName)}/collection/${encodeURIComponent(coll.name)}`}
            className="card hover:shadow-lg transition-shadow duration-200 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Table className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                    {coll.name}
                  </h3>
                </div>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
            </div>

            {coll.stats && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Documents:</span>
                  <span className="font-medium text-gray-900">{formatNumber(coll.stats.count)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium text-gray-900">{formatBytes(coll.stats.size)}</span>
                </div>
                {coll.stats.indexes > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Indexes:</span>
                    <span className="font-medium text-gray-900">{coll.stats.indexes}</span>
                  </div>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>

      {collections.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-600 text-lg">No collections found in this database</p>
        </div>
      )}
    </div>
  );
};

export default DatabaseView;
