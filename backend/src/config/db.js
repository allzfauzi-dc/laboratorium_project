const mongoose = require('mongoose');
const seedDatabase = require('./seedData');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/laboratorium';

  try {
    console.log(`Connecting to MongoDB at: ${uri} ...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000
    });
    console.log('MongoDB Connected successfully (Local/Remote MongoDB instance)');
    await seedDatabase();
  } catch (err) {
    console.warn('Could not connect to standalone MongoDB at ' + uri);
    console.log('Attempting in-memory MongoDB fallback...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      console.log(`In-Memory MongoDB started at: ${memoryUri}`);
      await mongoose.connect(memoryUri);
      console.log('Connected to In-Memory MongoDB successfully!');
      await seedDatabase();
    } catch (memErr) {
      console.error('Failed to start MongoDB connection:', err.message);
      console.error('Catatan: Pastikan service MongoDB lokal (mongod) berjalan di 127.0.0.1:27017 atau masukkan URL MongoDB Atlas Anda di file .env');
    }
  }
};

module.exports = connectDB;
