const express = require('express');
const router = express.Router();
const WordBankModel = require('../models/WordBank');

// Enhanced GET random word for GuessGuru game
router.get('/guessguru', async (req, res) => {
  try {
    // 1. Fetch the word bank document
    const wordbank = await WordBankModel.findOne();
    if (!wordbank) {
      return res.status(404).json({ 
        error: 'Word bank not found',
        solution: 'Please check your database connection'
      });
    }

    // 2. Process the data
    const wordData = wordbank.toObject();
    const categories = Object.keys(wordData).filter(key => 
      !['_id', '__v', 'metadata'].includes(key)
    );

    if (categories.length === 0) {
      return res.status(404).json({ 
        error: 'No valid categories found',
        availableCategories: await getAvailableCategories()
      });
    }

    // 3. Select random category and word
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryWords = wordData[randomCategory];
    const words = Object.keys(categoryWords);

    if (words.length === 0) {
      return res.status(404).json({
        error: `No words found in ${randomCategory} category`,
        availableCategories: categories
      });
    }

    const randomWord = words[Math.floor(Math.random() * words.length)];
    const hint = categoryWords[randomWord];

    // 4. Return formatted response
    res.json({
      success: true,
      word: randomWord.toUpperCase(),
      hint: hint,
      category: randomCategory,
      totalWords: words.length,
      wordLength: 5 // Explicitly stating word length
    });

  } catch (err) {
    console.error('Error in /guessguru route:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// GET all categories with counts
router.get('/categories', async (req, res) => {
  try {
    const wordbank = await WordBankModel.findOne();
    if (!wordbank) {
      return res.status(404).json({ error: 'Word bank not found' });
    }

    const wordData = wordbank.toObject();
    const categories = Object.keys(wordData).filter(key => 
      !['_id', '__v', 'metadata'].includes(key)
    );

    const categoryDetails = categories.map(category => ({
      name: category,
      wordCount: Object.keys(wordData[category]).length
    }));

    res.json({
      success: true,
      categories: categoryDetails,
      totalCategories: categories.length,
      totalWords: categoryDetails.reduce((sum, cat) => sum + cat.wordCount, 0)
    });

  } catch (err) {
    console.error('Error in /categories route:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Enhanced GET words for specific category
router.get('/category/:name', async (req, res) => {
  try {
    const categoryName = req.params.name;
    const wordbank = await WordBankModel.findOne(
      { [categoryName]: { $exists: true } },
      { [categoryName]: 1, _id: 0 }
    );

    if (!wordbank) {
      return res.status(404).json({ 
        error: 'Category not found',
        availableCategories: await getAvailableCategories()
      });
    }

    const words = wordbank[categoryName];
    const wordList = Object.keys(words);

    res.json({
      success: true,
      category: categoryName,
      words: wordList.map(word => ({
        word: word.toUpperCase(),
        hint: words[word]
      })),
      count: wordList.length
    });

  } catch (err) {
    console.error(`Error in /category/${req.params.name} route:`, err);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Helper function with caching
let availableCategoriesCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 300000; // 5 minutes

async function getAvailableCategories() {
  const now = Date.now();
  if (availableCategoriesCache && (now - cacheTimestamp) < CACHE_TTL) {
    return availableCategoriesCache;
  }

  try {
    const data = await WordBankModel.findOne();
    if (!data) return [];
    
    availableCategoriesCache = Object.keys(data.toObject())
      .filter(key => !['_id', '__v', 'metadata'].includes(key));
    cacheTimestamp = now;
    
    return availableCategoriesCache;
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

module.exports = router;