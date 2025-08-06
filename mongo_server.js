const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 4000; // Use environment variable for port or default to 4000
// IMPORTANT: Set MONGO_URI and JWT_SECRET as environment variables in your deployment environment (e.g., Render)
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key'; // Fallback for local development, CHANGE THIS IN PROD!

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI environment variable is not set. Please set it to your MongoDB connection string.');
  process.exit(1); // Exit if essential config is missing
}

mongoose
  .connect(MONGO_URI, {
    // useNewUrlParser and useUnifiedTopology are deprecated and no longer needed in Mongoose 6.x+
    dbName: 'Users' // Ensure your database name is correct
  })
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch(err => {
    console.error('❌ Could not connect to MongoDB:', err.message);
    console.error('Please check your MONGO_URI environment variable and network access settings.');
    process.exit(1); // Exit process on database connection failure
  });

// Define the User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['viewer', 'streamer'] }
});

const User = mongoose.model('User', userSchema);

// User Signup Route
app.post('/api/signup', async (req, res) => {
  const { username, email, password, role } = req.body;
  console.log(`➡️ Received signup request for email: ${email}`);

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await user.save();
    console.log(`✅ User '${username}' (${email}) created successfully.`);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error (e.g., email already exists)
      console.error(`❌ Signup failed: Email '${email}' already exists.`);
      return res.status(409).json({ message: 'Email already registered.' });
    }
    console.error(`❌ Error creating user for email '${email}':`, err.message);
    res.status(500).json({ message: 'Error creating user. Please try again.' });
  }
});

// User Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`➡️ Received login request for email: ${email}`);

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`⚠️ Login failed for email '${email}': User not found.`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`⚠️ Login failed for email '${email}': Incorrect password.`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    console.log(`✅ User '${user.username}' (${email}) logged in successfully.`);
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(`❌ Error during login for email '${email}':`, err.message);
    res.status(500).json({ message: 'An error occurred during login. Please try again.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} in your browser (if applicable)`);
});
