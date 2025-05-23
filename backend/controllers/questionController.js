const Question = require('../models/QuestionSchema');

// Get all questions for a subject
const getQuestionsBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    const questions = await Question.find({ subject });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get combined questions from multiple subjects
const getCombinedQuestions = async (req, res) => {
  const { subjects, count } = req.body;

  if (!subjects || subjects.length < 2) {
    return res.status(400).json({ message: 'At least two subjects required' });
  }

  try {
    const perSubject = Math.ceil(count / subjects.length);

    const promises = subjects.map(subject =>
      Question.aggregate([
        { $match: { subject } },
        { $sample: { size: perSubject } }
      ])
    );

    const results = await Promise.all(promises);
    const allQuestions = results.flat();

    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    res.json({ questions: selected });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching combined questions' });
  }
};

module.exports = {
  getQuestionsBySubject,
  getCombinedQuestions
};
