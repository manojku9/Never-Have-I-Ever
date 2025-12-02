const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Get room by code
router.get('/:roomCode', async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode.toUpperCase() })
      .populate('currentQuestion');
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new room
router.post('/create', async (req, res) => {
  try {
    const { hostId, hostName, maxPlayers } = req.body;
    
    if (!hostId || !hostName) {
      return res.status(400).json({ error: 'Host ID and name are required' });
    }
    
    let roomCode;
    let roomExists = true;
    
    // Generate unique room code
    while (roomExists) {
      roomCode = Room.generateRoomCode();
      roomExists = await Room.findOne({ roomCode });
    }
    
    const room = new Room({
      roomCode,
      hostId,
      maxPlayers: maxPlayers || 10,
      players: [{
        socketId: hostId,
        name: hostName,
        score: 0,
        isHost: true
      }]
    });
    
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete room
router.delete('/:roomCode', async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ 
      roomCode: req.params.roomCode.toUpperCase() 
    });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

