// server.js

const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // Import body-parser
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();

// Configure body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: true,
    saveUninitialized: true
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/user_auth', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Display login page
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/home'); // Redirect to home if user is already logged in
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username: username });

    // Check if user exists and password is correct
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user; // Create session
        res.redirect('/home'); // Redirect to home page after successful login
    } else {
        res.send('Invalid username or password');
    }
});

// Display home page
app.get('/home', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    } else {
        res.redirect('/login'); // Redirect to login if user is not logged in
    }
});

// Display registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Display login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle registration form submission
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
        return res.send('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
        username: username,
        password: hashedPassword
    });

    // Save the user to the database
    await newUser.save();

    res.redirect('/login'); // Redirect to login after registration
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
