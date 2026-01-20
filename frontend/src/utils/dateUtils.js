// Date utility functions for CRM

export const parseDate = (dateValue) => {
  if (!dateValue) return null;

  // Handle ISO date strings
  if (typeof dateValue === 'string') {
    // Try parsing as ISO date
    const isoDate = new Date(dateValue);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    // Try parsing MM/DD/YYYY format
    const parts = dateValue.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      return new Date(year, month - 1, day);
    }
  }

  // Handle Date objects or timestamps
  return new Date(dateValue);
};

export const formatDate = (dateValue) => {
  const date = parseDate(dateValue);
  if (!date || isNaN(date.getTime())) return 'Invalid Date';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  return date.toLocaleString('en-US', options);
};

export const formatRelativeTime = (dateValue) => {
  const date = parseDate(dateValue);
  if (!date || isNaN(date.getTime())) return 'Invalid Date';

  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  if (diffWeek < 4) return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
  return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`;
};

export const formatDateSmart = (dateValue) => {
  const date = parseDate(dateValue);
  if (!date || isNaN(date.getTime())) return 'Invalid Date';

  const now = new Date();
  const diffHours = (now - date) / (1000 * 60 * 60);

  // Show relative time for recent dates (< 48 hours)
  if (diffHours < 48) {
    return formatRelativeTime(dateValue);
  }

  // Show formatted date for older dates
  return formatDate(dateValue);
};

export const isWithinRange = (dateValue, range) => {
  const date = parseDate(dateValue);
  if (!date || isNaN(date.getTime())) return false;

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
    case 'all':
      return true;
    default:
      return false;
  }

  return date >= startDate;
};

export const getTimeRangeFilter = (range, dateField = 'date') => {
  if (range === 'all') return {};

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
      $gte: startDate.toISOString()
    }
  };
};

export const detectDateField = (document) => {
  const possibleDateFields = ['createdAt', 'date', 'updatedAt', 'timestamp', 'created_at'];

  for (const field of possibleDateFields) {
    if (document && document[field]) {
      return field;
    }
  }

  return 'date'; // default fallback
};

export const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};
