import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  // Parse breadcrumbs from URL
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);

    const breadcrumbs = [{ label: 'Home', path: '/' }];

    if (parts[0] === 'database' && parts[1]) {
      const dbName = decodeURIComponent(parts[1]);
      breadcrumbs.push({
        label: dbName,
        path: `/database/${parts[1]}`
      });

      if (parts[2] === 'collection' && parts[3]) {
        const collName = decodeURIComponent(parts[3]);
        breadcrumbs.push({
          label: collName,
          path: `/database/${parts[1]}/collection/${parts[3]}`
        });

        if (parts[4] === 'analytics') {
          breadcrumbs.push({
            label: 'Analytics',
            path: location.pathname
          });
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <Database size={28} />
              <span className="font-bold text-xl">MongoDB Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <div className="flex items-center space-x-2 text-sm pb-3">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && <span className="text-gray-400">/</span>}
                <Link
                  to={crumb.path}
                  className={`${
                    index === breadcrumbs.length - 1
                      ? 'text-gray-900 font-medium'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
