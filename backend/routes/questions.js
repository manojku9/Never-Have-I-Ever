const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Get all questions
router.get('/', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    const questions = await Question.find(filter);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get random question
router.get('/random', async (req, res) => {
  try {
    const { category, difficulty, exclude } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (exclude) {
      const excludeIds = exclude.split(',').map(id => id.trim());
      filter._id = { $nin: excludeIds };
    }
    
    const count = await Question.countDocuments(filter);
    if (count === 0) {
      return res.status(404).json({ error: 'No questions found' });
    }
    
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(filter).skip(random);
    
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new question
router.post('/', async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

