const Room = require('../models/Room');
const Question = require('../models/Question');
const mongoose = require('mongoose');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Create a new room
    socket.on('create-room', async (data) => {
      try {
        const { hostName, maxPlayers } = data;
        
        let roomCode;
        let roomExists = true;
        
        while (roomExists) {
          roomCode = Room.generateRoomCode();
          roomExists = await Room.findOne({ roomCode });
        }
        
        const room = new Room({
          roomCode,
          hostId: socket.id,
          maxPlayers: maxPlayers || 10,
          players: [{
            socketId: socket.id,
            name: hostName,
            score: 0,
            isHost: true
          }]
        });
        
        await room.save();
        socket.join(roomCode);
        socket.emit('room-created', room);
        console.log(`Room created: ${roomCode} by ${hostName}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to create room', error: error.message });
      }
    });

    // Join a room
    socket.on('join-room', async (data) => {
      try {
        const { roomCode, playerName } = data;
        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
        
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        if (room.players.length >= room.maxPlayers) {
          socket.emit('error', { message: 'Room is full' });
          return;
        }
        
        if (room.gameState === 'playing') {
          socket.emit('error', { message: 'Game is already in progress' });
          return;
        }
        
        // Check if player name already exists in room
        if (room.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
          socket.emit('error', { message: 'Player name already taken' });
          return;
        }
        
        room.players.push({
          socketId: socket.id,
          name: playerName,
          score: 0,
          isHost: false
        });
        
        await room.save();
        socket.join(roomCode);
        
        const populatedRoom = await Room.findById(room._id).populate('currentQuestion');
        socket.emit('room-joined', populatedRoom);
        io.to(roomCode).emit('player-joined', {
          room: populatedRoom,
          newPlayer: { name: playerName, socketId: socket.id }
        });
        
        console.log(`${playerName} joined room ${roomCode}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join room', error: error.message });
      }
    });

    // Leave room
    socket.on('leave-room', async (data) => {
      try {
        const { roomCode } = data;
        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
        
        if (room) {
          room.players = room.players.filter(p => p.socketId !== socket.id);
          
          // If host left, assign new host or delete room
          if (room.players.length === 0) {
            await Room.findByIdAndDelete(room._id);
            io.to(roomCode).emit('room-deleted');
          } else {
            // If host left, make first player the new host
            if (room.players.every(p => !p.isHost)) {
              room.players[0].isHost = true;
            }
            await room.save();
            const populatedRoom = await Room.findById(room._id).populate('currentQuestion');
            io.to(roomCode).emit('player-left', populatedRoom);
          }
        }
        
        socket.leave(roomCode);
        console.log(`User ${socket.id} left room ${roomCode}`);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // Start game
    socket.on('start-game', async (data) => {
      try {
        const { roomCode } = data;
        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
        
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Check if user is host
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player || !player.isHost) {
          socket.emit('error', { message: 'Only the host can start the game' });
          return;
        }
        
        if (room.players.length < 2) {
          socket.emit('error', { message: 'Need at least 2 players to start' });
          return;
        }
        
        // Get first question
        const question = await Question.aggregate([
          { $sample: { size: 1 } }
        ]);
        
        if (question.length === 0) {
          socket.emit('error', { message: 'No questions available. Please seed the database.' });
          return;
        }
        
        room.gameState = 'playing';
        room.currentQuestion = question[0]._id;
        room.currentRound = 1;
        room.questionsUsed = [question[0]._id];
        await room.save();
        
        const populatedRoom = await Room.findById(room._id).populate('currentQuestion');
        io.to(roomCode).emit('game-started', populatedRoom);
        console.log(`Game started in room ${roomCode}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to start game', error: error.message });
      }
    });

    // Player selection (who drank)
    socket.on('player-selection', async (data) => {
      try {
        const { roomCode, selectedPlayers } = data;
        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
        
        if (!room || room.gameState !== 'playing') {
          return;
        }
        
        // Update scores
        selectedPlayers.forEach(playerName => {
          const player = room.players.find(p => p.name === playerName);
          if (player) {
            player.score += 1;
          }
        });
        
        await room.save();
        const populatedRoom = await Room.findById(room._id).populate('currentQuestion');
        io.to(roomCode).emit('scores-updated', {
          room: populatedRoom,
          selectedPlayers,
          round: room.currentRound
        });
      } catch (error) {
        console.error('Error updating scores:', error);
      }
    });

    // Get next question
    socket.on('next-question', async (data) => {
      try {
        const { roomCode } = data;
        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
        
        if (!room || room.gameState !== 'playing') {
          return;
        }
        
        const excludeIds = room.questionsUsed.map(id => 
          typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
        );
        
        const question = await Question.aggregate([
          { $match: { _id: { $nin: excludeIds } } },
          { $sample: { size: 1 } }
        ]);
        
        if (question.length === 0) {
          room.gameState = 'finished';
          await room.save();
          const populatedRoom = await Room.findById(room._id).populate('currentQuestion');
          io.to(roomCode).emit('game-finished', populatedRoom);
          return;
        }
        
        room.currentQuestion = question[0]._id;
        room.currentRound += 1;
        room.questionsUsed.push(question[0]._id);
        await room.save();
        
        const populatedRoom = await Room.findById(room._id).populate('currentQuestion');
        io.to(roomCode).emit('next-question', populatedRoom);
      } catch (error) {
        console.error('Error getting next question:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        const rooms = await Room.find({ 'players.socketId': socket.id });
        
        for (const room of rooms) {
          room.players = room.players.filter(p => p.socketId !== socket.id);
          
          if (room.players.length === 0) {
            await Room.findByIdAndDelete(room._id);
          } else {
            if (room.players.every(p => !p.isHost)) {
              room.players[0].isHost = true;
            }
            await room.save();
            const populatedRoom = await Room.findById(room._id).populate('currentQuestion');
            io.to(room.roomCode).emit('player-left', populatedRoom);
          }
        }
        
        console.log(`User disconnected: ${socket.id}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
};

