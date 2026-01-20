import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import DatabaseView from './pages/DatabaseView';
import CollectionView from './pages/CollectionView';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/database/:dbName" element={<DatabaseView />} />
          <Route path="/database/:dbName/collection/:collName" element={<CollectionView />} />
          <Route path="/database/:dbName/collection/:collName/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
