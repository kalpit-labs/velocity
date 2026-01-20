import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { dbName } = useParams();
  const location = useLocation();
  const showSidebar = !!dbName;
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 ${isHomePage ? '' : showSidebar ? 'lg:ml-0' : 'max-w-7xl mx-auto'} ${isHomePage ? 'px-0' : 'px-4 sm:px-6 lg:px-8'} py-8`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
