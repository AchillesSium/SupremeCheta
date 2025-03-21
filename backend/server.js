require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const specs = require('./src/config/swagger');

// Import routes
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5001;
const db = process.env.MONGO_URI || 'mongodb://localhost:27017/supreme-cheta';

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Supreme Cheta API Documentation"
}));

// MongoDB Connection
mongoose
    .connect(db, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    })
    .then(() => {
        console.log('Successfully connected to MongoDB');
        console.log('Database name:', mongoose.connection.name);
        // Start server only after successful database connection
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process with failure
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Supreme Cheta API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: err.message 
    });
});