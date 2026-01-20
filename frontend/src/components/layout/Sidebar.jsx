import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Table, ChevronRight, Menu, X } from 'lucide-react';
import { getCollections } from '../../services/api';
import { formatNumber } from '../../utils/dateUtils';

const Sidebar = () => {
  const { dbName, collName } = useParams();
  const location = useLocation();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (dbName) {
      fetchCollections();
    }
  }, [dbName]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await getCollections(dbName);
      setCollections(response.data);
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCollectionColor = (name) => {
    // Assign colors based on collection name
    const colorMap = {
      'customers': 'blue',
      'customerads': 'green',
      'googlecustomerads': 'orange',
      'enquiries': 'purple',
      'consultads': 'pink',
      'roadmappopups': 'indigo',
      'workshops': 'yellow',
      'students': 'cyan'
    };

    return colorMap[name.toLowerCase()] || 'gray';
  };

  const getColorClasses = (color, isActive) => {
    const baseClasses = {
      blue: isActive ? 'bg-blue-100 text-blue-700 border-blue-500' : 'text-blue-600',
      green: isActive ? 'bg-green-100 text-green-700 border-green-500' : 'text-green-600',
      orange: isActive ? 'bg-orange-100 text-orange-700 border-orange-500' : 'text-orange-600',
      purple: isActive ? 'bg-purple-100 text-purple-700 border-purple-500' : 'text-purple-600',
      pink: isActive ? 'bg-pink-100 text-pink-700 border-pink-500' : 'text-pink-600',
      indigo: isActive ? 'bg-indigo-100 text-indigo-700 border-indigo-500' : 'text-indigo-600',
      yellow: isActive ? 'bg-yellow-100 text-yellow-700 border-yellow-500' : 'text-yellow-600',
      cyan: isActive ? 'bg-cyan-100 text-cyan-700 border-cyan-500' : 'text-cyan-600',
      gray: isActive ? 'bg-gray-100 text-gray-700 border-gray-500' : 'text-gray-600'
    };

    return baseClasses[color];
  };

  // Don't show sidebar if not in a database view
  if (!dbName) {
    return null;
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200
          transition-transform duration-300 z-40 overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64
        `}
      >
        <div className="p-4">
          {/* Database Name */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="font-bold text-lg text-gray-900 truncate" title={decodeURIComponent(dbName)}>
              {decodeURIComponent(dbName)}
            </h3>
            <p className="text-sm text-gray-500">
              {collections.length} collections
            </p>
          </div>

          {/* Collections List */}
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : (
            <nav className="space-y-1">
              {collections.map((coll) => {
                const isActive = collName === coll.name;
                const color = getCollectionColor(coll.name);
                const colorClasses = getColorClasses(color, isActive);

                return (
                  <Link
                    key={coll.name}
                    to={`/database/${encodeURIComponent(dbName)}/collection/${encodeURIComponent(coll.name)}`}
                    className={`
                      block px-3 py-2 rounded-lg text-sm transition-colors
                      ${isActive
                        ? `${colorClasses} border-l-4 font-semibold`
                        : `hover:bg-gray-50 ${colorClasses}`
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Table size={16} className="flex-shrink-0" />
                        <span className="truncate" title={coll.name}>
                          {coll.name}
                        </span>
                      </div>
                      {coll.stats && (
                        <span className="text-xs opacity-75 ml-2 flex-shrink-0">
                          {formatNumber(coll.stats.count)}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
