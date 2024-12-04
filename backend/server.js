require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');

const app = express();

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Node.js MongoDB Project!');
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
        username: 'achilles',
        email: 'aqib@achilles.com',
        password: 'pass123',
        first_name: 'Achilles',
        last_name: 'Sium',
        phone_number: '+1234567890',
        address: '123 Hervanta Street',
        role: 'admin',
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
