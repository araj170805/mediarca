const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const app = require('./app.js');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
