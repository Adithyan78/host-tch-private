const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const documentRoutes = require('./routes/documents');

// Firebase Admin SDK initialization
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// MongoDB connection
mongoose.connect('mongodb+srv://techcodehub2024:1234@cluster0.8mc5s56.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Define MongoDB schema
const userSchema = new mongoose.Schema({
  uid: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String },
  loginTime: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

// Endpoint to handle email and password login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ uid: user._id, email: user.email, isAdmin: user.isAdmin }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token, isAdmin: user.isAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Endpoint to handle Google Sign-In
app.post('/login/google', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const avatar = decodedToken.picture;
    const name = decodedToken.name;

    const isAdmin = email === 'techcodehub.2024@gmail.com';

    const user = await User.findOneAndUpdate(
      { uid },
      { uid, email, name, avatar, isAdmin },
      { upsert: true, new: true }
    );

    const jwtToken = jwt.sign({ uid: user.uid, email: user.email, isAdmin: user.isAdmin }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token: jwtToken, isAdmin: user.isAdmin });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error });
  }
});

// Endpoint to handle password reset
app.post('/resetPassword', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email required' });
  }

  try {
    // Implement your password reset logic here
    res.status(200).json({ message: 'Password reset functionality not yet implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Error handling password reset', error });
  }
});

// Endpoint to create a new user (for sign-up)
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = email === 'techcodehub.2024@gmail.com';
    const user = new User({ name, email, password: hashedPassword, isAdmin });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Document routes
app.use('/api/documents', documentRoutes);

// Admin-specific routes for user management
app.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, 'uid name email avatar loginTime');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

app.get('/admin/users/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const user = await User.findOne({ uid }, 'name email avatar loginTime');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
});

app.delete('/admin/users/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    await User.findOneAndDelete({ uid });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
