const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  players: [{
    name: String,
    score: { type: Number, default: 0 }
  }],
  currentRound: {
    type: Number,
    default: 1
  },
  questionsUsed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GameSession', gameSessionSchema);

