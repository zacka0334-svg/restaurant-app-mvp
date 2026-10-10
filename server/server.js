// Entry point of the backend. Run with: npm run dev
require('dotenv').config(); // loads PORT and MONGO_URI from .env

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const menuRoutes = require('./routes/menuRoutes');
const tableRoutes = require('./routes/tableRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // allow the app / browser to call this server
app.use(express.json()); // read JSON request bodies into req.body

// Quick check that the server is alive (open it in the phone's browser).
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);

// Any URL that did not match a route above.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler (must have 4 arguments). Catches anything that was thrown.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

async function start() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI must be set in server/.env (see .env.example)');
    process.exit(1);
  }
  await connectDB();
  // 0.0.0.0 = listen on the Wi-Fi address too, so the phone can reach it.
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
