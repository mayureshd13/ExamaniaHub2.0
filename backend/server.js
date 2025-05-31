const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const models = require('./models/Subject');
const User = require('./models/User'); // ⬅️ Add this file (shown below)

// Routes
const questionRoutes = require('./routes/questionRoutes');
const wordBankRoutes = require('./routes/wordBankRoutes');

// Middleware
const authMiddleware = require('./middleware/auth'); // ⬅️ Add this file (shown below)

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Routes
app.use('/api/questions', questionRoutes);
app.use('/api/wordbank', wordBankRoutes);

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const {name,email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
if (userExists) return res.status(400).json({ success: false, msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name,email, password: hashed });
    await newUser.save();

res.status(201).json({ success: true, msg: 'Signup successful' });
  } catch (err) {
res.status(500).json({ success: false, msg: 'Signup failed', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });

    user.activeToken = token;
    await user.save();

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Protected route example
app.get('/api/protected/testzone', authMiddleware, (req, res) => {
  res.json({ msg: `Welcome to Test Zone, ${req.user.email}` });
});

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to ExamaniaHub API!");
});

// Combined questions route (unchanged)
app.post('/api/questions/combined', async (req, res) => {
  try {
    const { subjects, count } = req.body;

    if (!subjects || !Array.isArray(subjects)) {
      return res.status(400).json({ success: false, message: 'Subjects must be an array' });
    }
    if (subjects.length < 2) {
      return res.status(400).json({ success: false, message: 'At least two subjects required' });
    }

    if (!count || isNaN(count) || count < 1) {
      return res.status(400).json({ success: false, message: 'Invalid question count' });
    }

    const validSubjects = subjects.map(s => s.toLowerCase()).filter(s => models[s]);
    if (validSubjects.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid subjects provided' });
    }

    const perSubject = Math.ceil(count / validSubjects.length);
    const promises = validSubjects.map(subject =>
      models[subject].aggregate([{ $match: {} }, { $sample: { size: perSubject } }])
    );

    const results = await Promise.all(promises);
    const combinedQuestions = results.flat().sort(() => 0.5 - Math.random()).slice(0, count);

    res.json({
      success: true,
      count: combinedQuestions.length,
      questions: combinedQuestions,
    });
  } catch (err) {
    console.error('Combined questions error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching combined questions',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

// 404 and Error Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
