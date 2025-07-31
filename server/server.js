const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require('./config/db');

// Route files
const queueRoutes = require('./routes/queue');
const predictRoutes = require('./routes/predict');

// Connect to MongoDB
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Mount routers
app.use('/api/queue', queueRoutes);
app.use('/api/predict', predictRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Queue Management System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Queue Management System API',
    version: '1.0.0',
    endpoints: {
      queue: '/api/queue',
      predict: '/api/predict',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 