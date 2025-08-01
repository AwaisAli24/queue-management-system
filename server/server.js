const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookieParser = require('cookie-parser');

dotenv.config();

const connectDB = require('./config/db');
const passport = require('./config/passport');
const sessionConfig = require('./config/session');

const authRoutes = require('./routes/auth');
const queueRoutes = require('./routes/queue');
const predictRoutes = require('./routes/predict');
const { protect, authorize } = require('./middleware/authMiddleware');

connectDB();

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/queue', protect, authorize('admin', 'staff'), queueRoutes);
app.use('/api/predict', predictRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Queue Management System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Queue Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      queue: '/api/queue',
      predict: '/api/predict',
      health: '/health'
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
}); 