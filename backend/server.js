const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const models = require('./models/Subject'); // your combined models export

const questionRoutes = require('./routes/questionRoutes');
const wordBankRoutes = require('./routes/wordBankRoutes');

dotenv.config();
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route middleware
app.use('/api/questions', questionRoutes);
app.use('/api/wordbank', wordBankRoutes);

app.get("/",(req,res)=>{
  res.send("Welcom to Abhyaas zone!")
});

// Combined questions endpoint
app.post('/api/questions/combined', async (req, res) => {
  try {
    const { subjects, count } = req.body;

    // Validate subjects array
    if (!subjects || !Array.isArray(subjects)) {
      return res.status(400).json({ success: false, message: 'Subjects must be an array' });
    }
    if (subjects.length < 2) {
      return res.status(400).json({ success: false, message: 'At least two subjects required' });
    }

    // Validate count
    if (!count || isNaN(count) || count < 1) {
      return res.status(400).json({ success: false, message: 'Invalid question count' });
    }

    // Prepare valid subjects (lowercase keys matching models)
    const validSubjects = subjects
      .map(s => s.toLowerCase())
      .filter(s => models[s]);

    if (validSubjects.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid subjects provided' });
    }

    const perSubject = Math.ceil(count / validSubjects.length);

    // Fetch random questions from each subject collection
    const promises = validSubjects.map(subject =>
      models[subject].aggregate([
        { $match: {} }, // Add any filters here if needed
        { $sample: { size: perSubject } }
      ])
    );

    const results = await Promise.all(promises);
    const combinedQuestions = results.flat();

    // Shuffle combined array and slice to requested count
    const shuffled = combinedQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    res.json({
      success: true,
      count: selected.length,
      questions: selected,
    });

  } catch (err) {
    console.error('Combined questions error:', err);

    // Send detailed error in development, else generic message
    res.status(500).json({
      success: false,
      message: 'Server error while fetching combined questions',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
