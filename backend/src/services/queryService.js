// Build MongoDB query from filter parameters
export const buildQuery = (filters) => {
  const query = {};

  if (!filters || typeof filters !== 'object') {
    return query;
  }

  Object.entries(filters).forEach(([field, condition]) => {
    if (typeof condition === 'object' && !Array.isArray(condition)) {
      // Handle operators like {$gt: 5, $lt: 10}
      query[field] = condition;
    } else {
      // Handle direct value match
      query[field] = condition;
    }
  });

  return query;
};

// Build text search query
export const buildTextSearch = (searchTerm, fields = []) => {
  if (!searchTerm) return {};

  if (fields.length === 0) {
    // Use MongoDB text search if no specific fields
    return { $text: { $search: searchTerm } };
  }

  // Search across specific fields using regex
  const regex = new RegExp(searchTerm, 'i');
  return {
    $or: fields.map(field => ({ [field]: regex }))
  };
};

// Parse filter string to MongoDB query
export const parseFilterString = (filterStr) => {
  try {
    if (!filterStr) return {};
    return JSON.parse(filterStr);
  } catch (e) {
    console.error('Error parsing filter string:', e);
    return {};
  }
};

// Build time range query for filtering by date
export const buildTimeRangeQuery = (dateField, range) => {
  if (!range || range === 'all') return {};

  const now = new Date();
  let startDate;

  switch (range) {
    case '1h':
      startDate = new Date(now - 60 * 60 * 1000);
      break;
    case '24h':
      startDate = new Date(now - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      return {};
  }

  return {
    [dateField]: {
      $gte: startDate
    }
  };
};

// Detect the primary date field in a document
export const detectDateField = (document) => {
  if (!document) return 'date';

  const possibleDateFields = ['createdAt', 'date', 'updatedAt', 'timestamp', 'created_at'];

  for (const field of possibleDateFields) {
    if (document[field]) {
      return field;
    }
  }

  return 'date'; // default fallback
};
