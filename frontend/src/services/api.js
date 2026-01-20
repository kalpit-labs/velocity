import axios from 'axios';

// Use environment variable for API URL, fallback to /api for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Database APIs
export const getDatabases = async () => {
  const response = await api.get('/databases');
  return response.data;
};

export const getDatabaseStats = async (dbName) => {
  const response = await api.get(`/databases/${dbName}/stats`);
  return response.data;
};

// Collection APIs
export const getCollections = async (dbName) => {
  const response = await api.get(`/databases/${dbName}/collections`);
  return response.data;
};

export const getCollectionStats = async (dbName, collName) => {
  const response = await api.get(`/databases/${dbName}/collections/${collName}/stats`);
  return response.data;
};

// Document APIs
export const getDocuments = async (dbName, collName, params = {}) => {
  const response = await api.get(`/databases/${dbName}/collections/${collName}/documents`, {
    params
  });
  return response.data;
};

export const getDocumentById = async (dbName, collName, id) => {
  const response = await api.get(`/databases/${dbName}/collections/${collName}/documents/${id}`);
  return response.data;
};

export const searchDocuments = async (dbName, collName, searchParams) => {
  const response = await api.post(`/databases/${dbName}/collections/${collName}/search`, searchParams);
  return response.data;
};

// Analytics APIs
export const getAggregateData = async (dbName, collName, params) => {
  const response = await api.get(`/databases/${dbName}/collections/${collName}/aggregate`, {
    params
  });
  return response.data;
};

export const getFieldAnalysis = async (dbName, collName) => {
  const response = await api.get(`/databases/${dbName}/collections/${collName}/field-analysis`);
  return response.data;
};

export const getTimelineStats = async (dbName, collName) => {
  const response = await api.get(`/databases/${dbName}/collections/${collName}/stats-timeline`);
  return response.data;
};

// Export API
export const exportToCSV = async (dbName, collName, params = {}) => {
  const response = await api.get(`/databases/${dbName}/collections/${collName}/export`, {
    params,
    responseType: 'blob'
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${collName}_export.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;
