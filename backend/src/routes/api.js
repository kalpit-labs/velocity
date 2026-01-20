import express from 'express';
import asyncHandler from 'express-async-handler';
import * as mongoService from '../services/mongoService.js';
import * as queryService from '../services/queryService.js';
import * as exportService from '../services/exportService.js';

const router = express.Router();

// Database routes
router.get('/databases', asyncHandler(async (req, res) => {
  const databases = await mongoService.listDatabases();
  res.json({
    success: true,
    data: databases
  });
}));

router.get('/databases/:dbName', asyncHandler(async (req, res) => {
  const { dbName } = req.params;
  const stats = await mongoService.getDatabaseStats(dbName);
  res.json({
    success: true,
    data: stats
  });
}));

router.get('/databases/:dbName/stats', asyncHandler(async (req, res) => {
  const { dbName } = req.params;
  const stats = await mongoService.getDatabaseStats(dbName);
  res.json({
    success: true,
    data: stats
  });
}));

// Collection routes
router.get('/databases/:dbName/collections', asyncHandler(async (req, res) => {
  const { dbName } = req.params;
  const collections = await mongoService.listCollections(dbName);

  // Get counts for each collection
  const collectionsWithStats = await Promise.all(
    collections.map(async (coll) => {
      try {
        const stats = await mongoService.getCollectionStats(dbName, coll.name);
        return {
          ...coll,
          stats
        };
      } catch (error) {
        return {
          ...coll,
          stats: { count: 0, size: 0 }
        };
      }
    })
  );

  res.json({
    success: true,
    data: collectionsWithStats
  });
}));

router.get('/databases/:dbName/collections/:collName/stats', asyncHandler(async (req, res) => {
  const { dbName, collName } = req.params;
  const stats = await mongoService.getCollectionStats(dbName, collName);
  res.json({
    success: true,
    data: stats
  });
}));

// Document routes
router.get('/databases/:dbName/collections/:collName/documents', asyncHandler(async (req, res) => {
  const { dbName, collName } = req.params;
  const { page, limit, sort, order, filter, timeRange } = req.query;

  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    sort,
    order: order || 'desc',
    filter: filter ? queryService.parseFilterString(filter) : {},
    timeRange
  };

  const result = await mongoService.getDocuments(dbName, collName, options);
  res.json({
    success: true,
    data: result
  });
}));

router.get('/databases/:dbName/collections/:collName/documents/:id', asyncHandler(async (req, res) => {
  const { dbName, collName, id } = req.params;
  const document = await mongoService.getDocumentById(dbName, collName, id);

  if (!document) {
    return res.status(404).json({
      success: false,
      error: { message: 'Document not found' }
    });
  }

  res.json({
    success: true,
    data: document
  });
}));

// Search route
router.post('/databases/:dbName/collections/:collName/search', asyncHandler(async (req, res) => {
  const { dbName, collName } = req.params;
  const { query, projection, page, limit, sort, order } = req.body;

  const searchOptions = {
    query: query || {},
    projection: projection || {},
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    sort: sort || '_id',
    order: order || 'asc'
  };

  const result = await mongoService.searchDocuments(dbName, collName, searchOptions);
  res.json({
    success: true,
    data: result
  });
}));

// Analytics routes
router.get('/databases/:dbName/collections/:collName/aggregate', asyncHandler(async (req, res) => {
  const { dbName, collName } = req.params;
  const { groupBy, metric, field } = req.query;

  if (!groupBy) {
    return res.status(400).json({
      success: false,
      error: { message: 'groupBy parameter is required' }
    });
  }

  const options = { groupBy, metric, field };
  const result = await mongoService.aggregateData(dbName, collName, options);

  res.json({
    success: true,
    data: result
  });
}));

router.get('/databases/:dbName/collections/:collName/field-analysis', asyncHandler(async (req, res) => {
  const { dbName, collName } = req.params;
  const result = await mongoService.analyzeFields(dbName, collName);

  res.json({
    success: true,
    data: result
  });
}));

// Timeline stats route
router.get('/databases/:dbName/collections/:collName/stats-timeline', asyncHandler(async (req, res) => {
  const { dbName, collName } = req.params;
  const result = await mongoService.getTimelineStats(dbName, collName);

  res.json({
    success: true,
    data: result
  });
}));

// Export route
router.get('/databases/:dbName/collections/:collName/export', asyncHandler(async (req, res) => {
  const { dbName, collName } = req.params;
  const { filter, fields, limit, flatten } = req.query;

  const options = {
    filter: filter || {},
    fields,
    limit,
    flatten: flatten !== 'false'
  };

  const csv = await exportService.exportToCSV(dbName, collName, options);

  if (!csv) {
    return res.status(404).json({
      success: false,
      error: { message: 'No data to export' }
    });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${collName}_export.csv"`);
  res.send(csv);
}));

export default router;
