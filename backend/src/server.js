require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const patientRoutes = require('./routes/patients');
const testRoutes = require('./routes/tests');
const registrationRoutes = require('./routes/registrations');
const billingRoutes = require('./routes/billing');
const samplingRoutes = require('./routes/sampling');
const analyzerRoutes = require('./routes/analyzer');
const validationRoutes = require('./routes/validation');
const reportRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database & Seed
connectDB();

// API Routes
app.use('/api/patients', patientRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/sampling', samplingRoutes);
app.use('/api/analyzer', analyzerRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Sistem Informasi Laboratorium RS (SIMRS-LAB) API',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` SIMRS Laboratorium Backend API Server is running!  `);
  console.log(` URL: http://localhost:${PORT}                      `);
  console.log(` Healthcheck: http://localhost:${PORT}/api/health   `);
  console.log(`====================================================`);
});
