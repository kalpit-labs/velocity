import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, ChevronRight, HardDrive } from 'lucide-react';
import { getDatabases } from '../services/api';
import Loading from '../components/common/Loading';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';

const Home = () => {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      const response = await getDatabases();
      setDatabases(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching databases:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (loading) return <Loading message="Loading databases..." />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button onClick={fetchDatabases} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-6 -my-8">
      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MongoDB Databases</h1>
            <p className="text-gray-600">
              Found {databases.length} database{databases.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {databases.map((db) => (
              <Link
                key={db.name}
                to={`/database/${encodeURIComponent(db.name)}`}
                className="card hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Database className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {db.name}
                      </h3>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium text-gray-900">{formatBytes(db.sizeOnDisk)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Empty:</span>
                    <span className={`font-medium ${db.empty ? 'text-orange-600' : 'text-green-600'}`}>
                      {db.empty ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {databases.length === 0 && (
            <div className="text-center py-12">
              <HardDrive className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600 text-lg">No databases found</p>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Sidebar */}
      <DashboardSidebar />
    </div>
  );
};

export default Home;
