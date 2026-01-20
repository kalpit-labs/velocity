import { Parser } from 'json2csv';
import { getClient } from '../config/database.js';

// Flatten nested objects for CSV
const flattenObject = (obj, prefix = '') => {
  const flattened = {};

  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      flattened[newKey] = '';
    } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else if (Array.isArray(value)) {
      flattened[newKey] = JSON.stringify(value);
    } else {
      flattened[newKey] = value;
    }
  });

  return flattened;
};

// Export collection data to CSV
export const exportToCSV = async (dbName, collectionName, options = {}) => {
  const client = getClient();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const {
    filter = {},
    fields = null,
    limit = null,
    flatten = true
  } = options;

  // Parse filter if it's a string
  let query = {};
  if (typeof filter === 'string') {
    try {
      query = JSON.parse(filter);
    } catch (e) {
      query = {};
    }
  } else {
    query = filter;
  }

  // Build projection
  let projection = {};
  if (fields && typeof fields === 'string') {
    const fieldArray = fields.split(',').map(f => f.trim());
    fieldArray.forEach(f => {
      projection[f] = 1;
    });
  }

  // Fetch documents
  let cursor = collection.find(query);

  if (Object.keys(projection).length > 0) {
    cursor = cursor.project(projection);
  }

  if (limit) {
    cursor = cursor.limit(parseInt(limit));
  }

  const documents = await cursor.toArray();

  if (documents.length === 0) {
    return '';
  }

  // Convert ObjectId to string and optionally flatten
  const processedDocs = documents.map(doc => {
    const processed = {
      ...doc,
      _id: doc._id.toString()
    };

    return flatten ? flattenObject(processed) : processed;
  });

  // Convert to CSV
  try {
    const parser = new Parser();
    const csv = parser.parse(processedDocs);
    return csv;
  } catch (error) {
    console.error('Error converting to CSV:', error);
    throw new Error('Failed to generate CSV');
  }
};
