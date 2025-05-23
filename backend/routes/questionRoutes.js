const express = require('express');
const router = express.Router();
const models = require('../models/Subject');

// GET /api/questions/:subject
router.get('/:subject', async (req, res) => {
  try {
    const subject = req.params.subject.toLowerCase();
    
    // Validate subject exists in models
    if (!models[subject]) {
      const availableSubjects = Object.keys(models).join(', ');
      return res.status(404).json({ 
        error: 'Invalid subject name',
        message: `Available subjects are: ${availableSubjects}` 
      });
    }

    const Model = models[subject];
    const { page, limit, ...filters } = req.query;

    // Build query with optional filters
    let query = Model.find();
    
    // Apply filters if any (excluding pagination params)
    if (Object.keys(filters).length > 0) {
      query = Model.find(filters);
    }

    // Apply pagination if requested
    if (page && limit) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      const total = await Model.countDocuments(filters);
      const questions = await query.skip(skip).limit(limitNum);

      return res.json({
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum,
        questions,
      });
    }

    // Return all questions if no pagination specified
    const questions = await query.exec();
    res.json({
      total: questions.length,
      questions,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
});

module.exports = router;