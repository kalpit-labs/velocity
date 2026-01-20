import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Database, ExternalLink, RefreshCw, ChevronRight } from 'lucide-react';
import { getDocuments, getDatabases, getCollections } from '../../services/api';

const DashboardSidebar = () => {
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [quickLinks, setQuickLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Collections to monitor for recent submissions
  const MONITORED_COLLECTIONS = [
    'customers',
    'enquiries',
    'customerads',
    'googlecustomerads',
    'consultads',
    'roadmappopups',
    'workshops',
    'students'
  ];

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchRecentSubmissions(),
        fetchQuickLinks()
      ]);
    } catch (error) {
      console.error('Error fetching sidebar data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRecentSubmissions = async () => {
    try {
      // Get all databases
      const dbResponse = await getDatabases();
      const databases = dbResponse.data;

      const allSubmissions = [];

      // Fetch recent documents from each monitored collection across all databases
      for (const db of databases) {
        try {
          const collectionsResponse = await getCollections(db.name);
          const collections = collectionsResponse.data;

          for (const collection of collections) {
            if (MONITORED_COLLECTIONS.includes(collection.name.toLowerCase())) {
              try {
                const docsResponse = await getDocuments(db.name, collection.name, {
                  page: 1,
                  limit: 5,
                  sort: '_id',
                  order: 'desc'
                });

                const documents = docsResponse.data.documents || [];
                documents.forEach(doc => {
                  allSubmissions.push({
                    ...doc,
                    _dbName: db.name,
                    _collectionName: collection.name,
                    _timestamp: extractTimestamp(doc)
                  });
                });
              } catch (error) {
                console.error(`Error fetching from ${db.name}.${collection.name}:`, error);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching collections for ${db.name}:`, error);
        }
      }

      // Sort by timestamp (most recent first) and take top 20
      allSubmissions.sort((a, b) => {
        const timeA = a._timestamp || 0;
        const timeB = b._timestamp || 0;
        return timeB - timeA;
      });

      setRecentSubmissions(allSubmissions.slice(0, 20));
    } catch (error) {
      console.error('Error fetching recent submissions:', error);
    }
  };

  const fetchQuickLinks = async () => {
    try {
      const dbResponse = await getDatabases();
      const databases = dbResponse.data;

      const links = [];

      for (const db of databases) {
        try {
          const collectionsResponse = await getCollections(db.name);
          const collections = collectionsResponse.data;

          collections.forEach(collection => {
            if (MONITORED_COLLECTIONS.includes(collection.name.toLowerCase())) {
              links.push({
                dbName: db.name,
                collectionName: collection.name,
                count: collection.stats?.count || 0
              });
            }
          });
        } catch (error) {
          console.error(`Error fetching collections for ${db.name}:`, error);
        }
      }

      // Sort by count (highest first)
      links.sort((a, b) => b.count - a.count);
      setQuickLinks(links);
    } catch (error) {
      console.error('Error fetching quick links:', error);
    }
  };

  const extractTimestamp = (doc) => {
    // Try to extract timestamp from various common fields
    if (doc.createdAt) return new Date(doc.createdAt).getTime();
    if (doc.created_at) return new Date(doc.created_at).getTime();
    if (doc.timestamp) return new Date(doc.timestamp).getTime();
    if (doc.date) return new Date(doc.date).getTime();
    if (doc._id && doc._id.$oid) {
      // Extract timestamp from MongoDB ObjectId
      return parseInt(doc._id.$oid.substring(0, 8), 16) * 1000;
    }
    if (typeof doc._id === 'object' && doc._id.$timestamp) {
      return doc._id.$timestamp.t * 1000;
    }
    return Date.now();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';

    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(timestamp).toLocaleDateString();
  };

  const extractKeyFields = (doc) => {
    // Extract key fields for preview
    const fields = [];

    if (doc.name || doc.Name) fields.push(doc.name || doc.Name);
    if (doc.email || doc.Email) fields.push(doc.email || doc.Email);
    if (doc.phone || doc.Phone || doc.mobile || doc.Mobile) {
      fields.push(doc.phone || doc.Phone || doc.mobile || doc.Mobile);
    }
    if (doc.subject || doc.Subject) fields.push(doc.subject || doc.Subject);
    if (doc.message || doc.Message) {
      const msg = doc.message || doc.Message;
      fields.push(msg.length > 50 ? msg.substring(0, 50) + '...' : msg);
    }

    return fields.slice(0, 2); // Show max 2 fields
  };

  const getCollectionColor = (name) => {
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

  const getColorClasses = (color) => {
    const classes = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      orange: 'bg-orange-100 text-orange-700',
      purple: 'bg-purple-100 text-purple-700',
      pink: 'bg-pink-100 text-pink-700',
      indigo: 'bg-indigo-100 text-indigo-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      cyan: 'bg-cyan-100 text-cyan-700',
      gray: 'bg-gray-100 text-gray-700'
    };
    return classes[color] || classes.gray;
  };

  if (loading) {
    return (
      <aside className="hidden xl:block w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto h-[calc(100vh-4rem)] sticky top-16">
        <div className="text-center py-8 text-gray-500">
          Loading...
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden xl:block w-80 bg-white border-l border-gray-200 overflow-y-auto h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 space-y-6">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
          <button
            onClick={() => fetchData()}
            disabled={refreshing}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              refreshing ? 'animate-spin' : ''
            }`}
            title="Refresh"
          >
            <RefreshCw size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Quick Links Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Database size={16} className="mr-2" />
            Quick Links
          </h3>
          <div className="space-y-1">
            {quickLinks.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No collections found</p>
            ) : (
              quickLinks.map((link, index) => {
                const color = getCollectionColor(link.collectionName);
                const colorClasses = getColorClasses(color);

                return (
                  <Link
                    key={`${link.dbName}-${link.collectionName}-${index}`}
                    to={`/database/${encodeURIComponent(link.dbName)}/collection/${encodeURIComponent(link.collectionName)}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${colorClasses}`}></span>
                      <span className="text-sm text-gray-700 truncate">
                        {link.collectionName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{link.count}</span>
                      <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Submissions Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Clock size={16} className="mr-2" />
            Recent Submissions
          </h3>
          <div className="space-y-3">
            {recentSubmissions.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No recent submissions</p>
            ) : (
              recentSubmissions.map((submission, index) => {
                const color = getCollectionColor(submission._collectionName);
                const colorClasses = getColorClasses(color);
                const keyFields = extractKeyFields(submission);

                return (
                  <Link
                    key={`${submission._dbName}-${submission._collectionName}-${submission._id?.$oid || index}`}
                    to={`/database/${encodeURIComponent(submission._dbName)}/collection/${encodeURIComponent(submission._collectionName)}`}
                    className="block p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${colorClasses} font-medium`}>
                        {submission._collectionName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(submission._timestamp)}
                      </span>
                    </div>

                    {keyFields.length > 0 && (
                      <div className="space-y-1">
                        {keyFields.map((field, idx) => (
                          <p key={idx} className="text-sm text-gray-700 truncate">
                            {field}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end mt-2">
                      <span className="text-xs text-gray-400 group-hover:text-gray-600 flex items-center">
                        View details
                        <ExternalLink size={12} className="ml-1" />
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
