const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables first
dotenv.config();

// Models
const models = require('./models/Subject');
const User = require('./models/User');

// Routes
const questionRoutes = require('./routes/questionRoutes');
const wordBankRoutes = require('./routes/wordBankRoutes');

// Middleware
const authMiddleware = require('./middleware/auth');

// Initialize Express app
const app = express();

// Database connection
connectDB();

// Enhanced Middleware Configuration
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Routes
app.use('/api/questions', questionRoutes);
app.use('/api/wordbank', wordBankRoutes);

// Enhanced Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide name, email, and password' 
    });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword 
    });

    await newUser.save();

    // Generate token for immediate login after signup
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    newUser.activeToken = token;
    await newUser.save();

    // Remove password from response
    const userResponse = { ...newUser._doc };
    delete userResponse.password;

    res.status(201).json({ 
      success: true, 
      message: 'Signup successful',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Signup failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide email and password' 
    });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' // Don't reveal if user exists
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    user.activeToken = token;
    await user.save();

    // Remove password from response
    const userResponse = { ...user._doc };
    delete userResponse.password;

    res.json({ 
      success: true, 
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -activeToken');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({ 
      success: true, 
      user 
    });
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Protected route example
app.get('/api/protected/testzone', authMiddleware, (req, res) => {
  res.json({ 
    success: true,
    message: `Welcome to Test Zone, ${req.user.email}` 
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "Welcome to ExamaniaHub API!",
    documentation: process.env.API_DOCS_URL || '/api-docs'
  });
});

// Combined questions route
app.post('/api/questions/combined', async (req, res) => {
  try {
    const { subjects, count } = req.body;

    // Enhanced validation
    if (!subjects || !Array.isArray(subjects)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subjects must be an array' 
      });
    }
    
    if (subjects.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least two subjects required' 
      });
    }

    if (!count || isNaN(count) || count < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid question count' 
      });
    }

    const validSubjects = subjects
      .map(s => s.toLowerCase())
      .filter(s => models[s]);
      
    if (validSubjects.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid subjects provided' 
      });
    }

    const perSubject = Math.ceil(count / validSubjects.length);
    const promises = validSubjects.map(subject =>
      models[subject].aggregate([{ $match: {} }, { $sample: { size: perSubject } }])
    );

    const results = await Promise.all(promises);
    const combinedQuestions = results
      .flat()
      .sort(() => 0.5 - Math.random())
      .slice(0, count);

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
    });
  }
});

// Enhanced 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Resource not found',
    path: req.originalUrl
  });
});

// Enhanced Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({ 
    success: false, 
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});