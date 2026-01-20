import { getClient } from '../config/database.js';
import { ObjectId } from 'mongodb';
import { detectDateField, buildTimeRangeQuery } from './queryService.js';

// List all databases
export const listDatabases = async () => {
  const client = getClient();
  const adminDb = client.db('admin');
  const result = await adminDb.admin().listDatabases();
  return result.databases;
};

// Get database statistics
export const getDatabaseStats = async (dbName) => {
  const client = getClient();
  const db = client.db(dbName);
  const stats = await db.stats();
  return stats;
};

// List all collections in a database
export const listCollections = async (dbName) => {
  const client = getClient();
  const db = client.db(dbName);
  const collections = await db.listCollections().toArray();
  return collections;
};

// Get collection statistics
export const getCollectionStats = async (dbName, collectionName) => {
  const client = getClient();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const stats = await db.command({ collStats: collectionName });
  const count = await collection.countDocuments();

  return {
    name: collectionName,
    count,
    size: stats.size,
    storageSize: stats.storageSize,
    avgObjSize: stats.avgObjSize,
    indexes: stats.nindexes
  };
};

// Get documents with pagination
export const getDocuments = async (dbName, collectionName, options = {}) => {
  const client = getClient();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const {
    page = 1,
    limit = 20,
    sort,
    order = 'desc',
    filter = {},
    timeRange
  } = options;

  const skip = (page - 1) * limit;

  // Parse filter if it's a string
  let query = {};
  if (typeof filter === 'string') {
    try {
      query = JSON.parse(filter);
    } catch (e) {
      query = {};
    }
  } else {
    query = { ...filter };
  }

  // Get a sample document to detect date field
  const sampleDoc = await collection.findOne({});
  const dateField = detectDateField(sampleDoc);

  // Add time range filter if provided
  if (timeRange && timeRange !== 'all') {
    const timeQuery = buildTimeRangeQuery(dateField, timeRange);
    query = { ...query, ...timeQuery };
  }

  // Auto-detect sort field (default to date field, desc)
  const sortField = sort || dateField || '_id';
  const sortOrder = order === 'asc' ? 1 : -1;

  const documents = await collection
    .find(query)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(Math.min(limit, 100)) // Max 100 documents per page
    .toArray();

  const total = await collection.countDocuments(query);

  // Convert ObjectId to string for JSON serialization
  const serializedDocs = documents.map(doc => ({
    ...doc,
    _id: doc._id.toString()
  }));

  return {
    documents: serializedDocs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    dateField // Include detected date field in response
  };
};

// Get a single document by ID
export const getDocumentById = async (dbName, collectionName, id) => {
  const client = getClient();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  let query;
  try {
    // Try to parse as ObjectId
    query = { _id: new ObjectId(id) };
  } catch (e) {
    // If not valid ObjectId, use as string
    query = { _id: id };
  }

  const document = await collection.findOne(query);

  if (document) {
    document._id = document._id.toString();
  }

  return document;
};

// Advanced search with query
export const searchDocuments = async (dbName, collectionName, searchOptions = {}) => {
  const client = getClient();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const {
    query = {},
    projection = {},
    page = 1,
    limit = 20,
    sort = '_id',
    order = 'asc'
  } = searchOptions;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const documents = await collection
    .find(query, { projection })
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(Math.min(limit, 100))
    .toArray();

  const total = await collection.countDocuments(query);

  const serializedDocs = documents.map(doc => ({
    ...doc,
    _id: doc._id ? doc._id.toString() : doc._id
  }));

  return {
    documents: serializedDocs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Aggregate data for analytics
export const aggregateData = async (dbName, collectionName, options = {}) => {
  const client = getClient();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const { groupBy, metric = 'count', field } = options;

  let pipeline = [];

  if (groupBy) {
    const groupStage = {
      _id: `$${groupBy}`
    };

    if (metric === 'count') {
      groupStage.value = { $sum: 1 };
    } else if (metric === 'sum' && field) {
      groupStage.value = { $sum: `$${field}` };
    } else if (metric === 'avg' && field) {
      groupStage.value = { $avg: `$${field}` };
    }

    pipeline.push({ $group: groupStage });
    pipeline.push({ $sort: { value: -1 } });
    pipeline.push({ $limit: 50 }); // Limit to top 50 results
  }

  const results = await collection.aggregate(pipeline).toArray();

  return results.map(r => ({
    label: r._id !== null ? String(r._id) : 'null',
    value: r.value
  }));
};

// Analyze field types and distribution
export const analyzeFields = async (dbName, collectionName) => {
  const client = getClient();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  // Get sample documents
  const sampleSize = 100;
  const documents = await collection.find().limit(sampleSize).toArray();

  if (documents.length === 0) {
    return { fields: [], sampleSize: 0 };
  }

  const fieldStats = {};

  documents.forEach(doc => {
    Object.keys(doc).forEach(key => {
      if (!fieldStats[key]) {
        fieldStats[key] = {
          name: key,
          types: {},
          count: 0,
          nullCount: 0
        };
      }

      fieldStats[key].count++;

      if (doc[key] === null || doc[key] === undefined) {
        fieldStats[key].nullCount++;
      } else {
        const type = Array.isArray(doc[key]) ? 'array' : typeof doc[key];
        fieldStats[key].types[type] = (fieldStats[key].types[type] || 0) + 1;
      }
    });
  });

  const fields = Object.values(fieldStats).map(field => ({
    name: field.name,
    types: Object.keys(field.types),
    primaryType: Object.entries(field.types).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown',
    presence: ((field.count - field.nullCount) / documents.length * 100).toFixed(1) + '%',
    nullPercentage: (field.nullCount / documents.length * 100).toFixed(1) + '%'
  }));

  return {
    fields,
    sampleSize: documents.length,
    totalDocuments: await collection.countDocuments()
  };
};

// Get timeline stats (today, this week, this month)
export const getTimelineStats = async (dbName, collectionName) => {
  const client = getClient();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  // Get sample doc to detect date field
  const sampleDoc = await collection.findOne({});
  const dateField = detectDateField(sampleDoc);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [total, today, week, month] = await Promise.all([
    collection.countDocuments(),
    collection.countDocuments({ [dateField]: { $gte: todayStart } }),
    collection.countDocuments({ [dateField]: { $gte: weekStart } }),
    collection.countDocuments({ [dateField]: { $gte: monthStart } })
  ]);

  return {
    total,
    today,
    week,
    month,
    dateField
  };
};
