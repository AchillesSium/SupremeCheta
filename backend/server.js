// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const User = require('./models/user');

// const app = express();

// // Middleware
// app.use(express.json());

// // MongoDB Connection
// mongoose
//     .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('Connected to MongoDB'))
//     .catch((err) => console.error('Error connecting to MongoDB:', err));

// // Routes
// app.get('/', (req, res) => {
//     res.send('Welcome to the Node.js MongoDB Project!');
// });

// // Create a new user
// app.post('/users', async (req, res) => {
//     try {
//         const user = new User(req.body);
//         await user.save();
//         res.status(201).json(user);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// app.get('/save-user', (req, res) => {
//     const newUser = new User({
//         username: 'achilles',
//         email: 'aqib@achilles.com',
//         password: 'pass123',
//         first_name: 'Achilles',
//         last_name: 'Sium',
//         phone_number: '+1234567890',
//         address: '123 Hervanta Street',
//         role: 'admin',
//         status: 'active',
//     });

//     newUser.save()
//     .then((result) => {
//         res.send(result)
//     })
//     .catch((err) => {
//         console.log(err)
//     });
// });

// // Get all users
// app.get('/users', async (req, res) => {
//     try {
//         const users = await User.find();
//         res.json(users);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });



require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categoryRoutes');
const swaggerUi = require('swagger-ui-express');
const specs = require('./src/config/swagger');
const User = require('./models/user');

const app = express();
const PORT = process.env.PORT || 5001;
const db = process.env.MONGODB_URI || 'test' ;

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
    .connect(db)
    .then(() => {
        console.log('Connected to MongoDB');
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

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Supreme Cheta API is running' });
});

// Create a new user
app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/save-user', (req, res) => {
    const newUser = new User({
        username: 'achilles 1',
        email: 'aqib@achilles1.com',
        password: 'pass1234',
        first_name: 'Achilles',
        last_name: 'Sium',
        phone_number: '+1234567891',
        role: 'user',
        status: 'active',
    });

    newUser.save()
    .then((result) => {
        res.send(result)
    })
    .catch((err) => {
        console.log(err)
    });
});

// Get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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