const dns = require('dns');
const mongoose = require('mongoose');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Could not set DNS servers:', e && e.message ? e.message : e);
}

mongoose.set('strictQuery', false);

const connectDB = async ({ retries = 5, delay = 5000 } = {}) => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI must be defined in the backend/.env file');
  }

  let attempt = 0;

  const tryConnect = async () => {
    attempt += 1;
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000,  // 30s – Atlas needs more time on cold start
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      });
      console.log('MongoDB connected');
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt} error:`, error && error.message ? error.message : error);
      if (attempt < retries) {
        console.log(`Retrying MongoDB connection in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        return tryConnect();
      }
      console.error('MongoDB connection failed after retries');
      throw error;
    }
  };

  mongoose.connection.on('connected', () => console.log('Mongoose event: connected'));
  mongoose.connection.on('error', (err) => console.error('Mongoose event: error', err));
  mongoose.connection.on('disconnected', () => console.warn('Mongoose event: disconnected'));
  mongoose.connection.on('reconnected', () => console.log('Mongoose event: reconnected'));

  return tryConnect();
};

module.exports = connectDB;
