
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

// Import Routes
const adminRoutes = require('./routes/admin');
const serviceRoutes = require('./routes/service');
const faqRoutes = require('./routes/faq');
const teamRoutes = require('./routes/team');
const testimonialRoutes = require('./routes/testimonials');
const blogRoutes = require('./routes/blog');
const galleryRoutes = require('./routes/gallery');
const contactRoutes = require('./routes/contact');

// Import Middleware
const allowedOrigins = [
  'http://localhost:3000', 
  'https://medorahcdc.com', 
  'https://www.medorahcdc.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginEmbedderPolicy: { policy: 'credentialless' }
}));
app.use(cors(corsOptions));
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Update your Express static file serving configuration
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', 'https://www.medorahcdc.com');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  }
}));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contacts', contactRoutes);

// API Documentation Route
app.get('/api-docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

// Health Check Route
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Error Handling
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
