const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  topic: String,
  question: { type: String, required: true },
  options: {
    A: String,
    B: String,
    C: String,
    D: String
  },
  answer: { type: String, required: true },
  explanation: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
});

module.exports = questionSchema; 