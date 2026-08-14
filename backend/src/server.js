const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/db.js');
const app = require('./app.js');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  // Start HTTP server immediately so frontend doesn't hang
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });

  // Attempt DB connection in background
  connectDB({ retries: 10, delay: 6000 })
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => {
      console.error('❌ MongoDB connection failed after all retries:', err?.message || err);
      console.warn('⚠️  API is running but database-dependent routes will return 503');
    });

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
