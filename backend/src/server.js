import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToMongoDB, closeConnection } from './config/database.js';
import apiRoutes from './routes/api.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);

    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In production, check allowed origins
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow for now, log for debugging
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MongoDB Dashboard API is running' });
});

// API routes
app.use('/api', apiRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectToMongoDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await closeConnection();
  process.exit(0);
});

startServer();
