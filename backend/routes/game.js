const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const GameSession = require('../models/GameSession');
const Question = require('../models/Question');

// Create a new game session
router.post('/session', async (req, res) => {
  try {
    const { players } = req.body;
    
    if (!players || !Array.isArray(players) || players.length === 0) {
      return res.status(400).json({ error: 'Players array is required and must not be empty' });
    }
    
    const gameSession = new GameSession({
      players: players.map(name => ({ name: String(name), score: 0 }))
    });
    await gameSession.save();
    res.status(201).json(gameSession);
  } catch (error) {
    console.error('Error creating game session:', error);
    if (error.message.includes('buffering timed out') || error.message.includes('connection')) {
      return res.status(503).json({ 
        error: 'Database connection timeout. Please ensure MongoDB is running and accessible.',
        details: 'Make sure MongoDB is installed and running. For local setup, run: mongod'
      });
    }
    res.status(400).json({ error: error.message });
  }
});

// Get game session
router.get('/session/:id', async (req, res) => {
  try {
    const gameSession = await GameSession.findById(req.params.id);
    if (!gameSession) {
      return res.status(404).json({ error: 'Game session not found' });
    }
    res.json(gameSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update player score
router.put('/session/:id/score', async (req, res) => {
  try {
    const { playerName, increment } = req.body;
    const gameSession = await GameSession.findById(req.params.id);
    
    if (!gameSession) {
      return res.status(404).json({ error: 'Game session not found' });
    }
    
    const player = gameSession.players.find(p => p.name === playerName);
    if (player) {
      player.score += increment || 1;
      await gameSession.save();
    }
    
    res.json(gameSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get next round question
router.get('/session/:id/next-question', async (req, res) => {
  try {
    const gameSession = await GameSession.findById(req.params.id);
    if (!gameSession) {
      return res.status(404).json({ error: 'Game session not found' });
    }
    
    // Initialize questionsUsed if it doesn't exist
    if (!gameSession.questionsUsed) {
      gameSession.questionsUsed = [];
    }
    
    const excludeIds = gameSession.questionsUsed.map(id => 
      typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
    );
    
    // If no questions exist, return error
    const totalQuestions = await Question.countDocuments();
    if (totalQuestions === 0) {
      return res.status(404).json({ error: 'No questions found in database. Please seed the database first.' });
    }
    
    const question = await Question.aggregate([
      { $match: { _id: { $nin: excludeIds } } },
      { $sample: { size: 1 } }
    ]);
    
    if (question.length === 0) {
      return res.status(404).json({ error: 'No more questions available' });
    }
    
    gameSession.questionsUsed.push(question[0]._id);
    gameSession.currentRound += 1;
    await gameSession.save();
    
    res.json(question[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

