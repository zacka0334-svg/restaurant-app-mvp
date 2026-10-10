const mongoose = require('mongoose');

// Connects to MongoDB using the MONGO_URI from .env.
// If the connection fails the server cannot work, so we stop it.
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected (${conn.connection.host}/${conn.connection.name})`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
