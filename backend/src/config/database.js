import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let client = null;
let isConnected = false;

export const connectToMongoDB = async () => {
  if (isConnected && client) {
    return client;
  }

  try {
    client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();

    // Test the connection
    await client.db('admin').command({ ping: 1 });

    isConnected = true;
    console.log('✅ Successfully connected to MongoDB');
    return client;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

export const getClient = () => {
  if (!isConnected || !client) {
    throw new Error('MongoDB client not initialized. Call connectToMongoDB() first.');
  }
  return client;
};

export const closeConnection = async () => {
  if (client) {
    await client.close();
    isConnected = false;
    console.log('MongoDB connection closed');
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});
