import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import RoomSelection from './components/RoomSelection';
import RoomLobby from './components/RoomLobby';
import MultiplayerGameBoard from './components/MultiplayerGameBoard';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function App() {
  // Single player state
  const [gameMode, setGameMode] = useState(() => {
    const saved = localStorage.getItem('gameMode');
    return saved || 'menu';
  });
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('gameState');
    return saved || 'setup';
  });
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('players');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const saved = localStorage.getItem('currentQuestion');
    return saved ? JSON.parse(saved) : null;
  });
  const [gameSessionId, setGameSessionId] = useState(() => {
    return localStorage.getItem('gameSessionId') || null;
  });
  const [round, setRound] = useState(() => {
    const saved = localStorage.getItem('round');
    return saved ? parseInt(saved) : 1;
  });
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('scores');
    return saved ? JSON.parse(saved) : {};
  });

  // Multiplayer state
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(() => {
    const saved = localStorage.getItem('room');
    return saved ? JSON.parse(saved) : null;
  });
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('playerName') || '';
  });
  const [isHost, setIsHost] = useState(() => {
    const saved = localStorage.getItem('isHost');
    return saved === 'true';
  });
  const socketRef = useRef(null);
  const isRestoringRef = useRef(false);

  const startGame = async (playerNames) => {
    try {
      const response = await axios.post(`${API_URL}/game/session`, {
        players: playerNames
      });
      
      setGameSessionId(response.data._id);
      setPlayers(response.data.players);
      setScores(response.data.players.reduce((acc, p) => {
        acc[p.name] = p.score;
        return acc;
      }, {}));
      setGameState('playing');
      loadNextQuestion(response.data._id);
    } catch (error) {
      console.error('Error starting game:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      let detailedMessage;
      
      if (error.code === 'ECONNREFUSED') {
        detailedMessage = 'Cannot connect to server. Make sure the backend is running on port 5000.';
      } else if (error.response?.status === 503) {
        detailedMessage = `Database Error: ${errorMessage}\n\nPlease ensure MongoDB is running. See backend/SETUP.md for instructions.`;
      } else if (error.response?.status === 400) {
        detailedMessage = `Invalid request: ${errorMessage}`;
      } else {
        detailedMessage = `Failed to start game: ${errorMessage}`;
      }
      alert(detailedMessage);
    }
  };

  const loadNextQuestion = async (sessionId) => {
    try {
      const response = await axios.get(`${API_URL}/game/session/${sessionId}/next-question`);
      setCurrentQuestion(response.data);
    } catch (error) {
      console.error('Error loading question:', error);
      if (error.response?.status === 404) {
        alert('No more questions available! Game over!');
        setGameState('finished');
      }
    }
  };

  const handlePlayerDrink = async (playerName) => {
    try {
      await axios.put(`${API_URL}/game/session/${gameSessionId}/score`, {
        playerName,
        increment: 1
      });
      
      setScores(prev => ({
        ...prev,
        [playerName]: (prev[playerName] || 0) + 1
      }));
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleNextQuestion = () => {
    setRound(prev => prev + 1);
    loadNextQuestion(gameSessionId);
  };

  const resetGame = () => {
    setGameState('setup');
    setPlayers([]);
    setCurrentQuestion(null);
    setGameSessionId(null);
    setRound(1);
    setScores({});
    // Clear localStorage
    localStorage.removeItem('gameState');
    localStorage.removeItem('players');
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('gameSessionId');
    localStorage.removeItem('round');
    localStorage.removeItem('scores');
  };

  // Save state to localStorage
  useEffect(() => {
    if (gameMode !== 'menu') {
      localStorage.setItem('gameMode', gameMode);
    } else {
      localStorage.removeItem('gameMode');
    }
  }, [gameMode]);

  useEffect(() => {
    if (gameState !== 'setup') {
      localStorage.setItem('gameState', gameState);
    }
  }, [gameState]);

  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem('players', JSON.stringify(players));
    }
  }, [players]);

  useEffect(() => {
    if (currentQuestion) {
      localStorage.setItem('currentQuestion', JSON.stringify(currentQuestion));
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (gameSessionId) {
      localStorage.setItem('gameSessionId', gameSessionId);
    }
  }, [gameSessionId]);

  useEffect(() => {
    if (round > 1) {
      localStorage.setItem('round', round.toString());
    }
  }, [round]);

  useEffect(() => {
    if (Object.keys(scores).length > 0) {
      localStorage.setItem('scores', JSON.stringify(scores));
    }
  }, [scores]);

  useEffect(() => {
    if (room) {
      localStorage.setItem('room', JSON.stringify(room));
    } else {
      localStorage.removeItem('room');
    }
  }, [room]);

  useEffect(() => {
    if (playerName) {
      localStorage.setItem('playerName', playerName);
    }
  }, [playerName]);

  useEffect(() => {
    localStorage.setItem('isHost', isHost.toString());
  }, [isHost]);

  // Restore game state on mount
  useEffect(() => {
    const restoreGame = async () => {
      // Restore single player game
      if (gameMode === 'single' && gameSessionId && gameState === 'playing') {
        try {
          // Restore game session
          const sessionResponse = await axios.get(`${API_URL}/game/session/${gameSessionId}`);
          if (sessionResponse.data) {
            setPlayers(sessionResponse.data.players);
            setScores(sessionResponse.data.players.reduce((acc, p) => {
              acc[p.name] = p.score;
              return acc;
            }, {}));
            // Load current question
            if (!currentQuestion) {
              loadNextQuestion(gameSessionId);
            }
          }
        } catch (error) {
          console.error('Error restoring game:', error);
          // If session doesn't exist, reset
          resetGame();
          setGameMode('menu');
        }
      }

      // Restore multiplayer room
      if (gameMode === 'multiplayer' && room && playerName) {
        isRestoringRef.current = true;
        // Socket connection will be established in the multiplayer useEffect
        // and will attempt to rejoin on connect
      }
    };

    restoreGame();
  }, []);

  // Multiplayer functions - initialize socket when in multiplayer mode
  useEffect(() => {
    if (gameMode === 'multiplayer' && !socketRef.current) {
      const newSocket = io(SOCKET_URL);
      socketRef.current = newSocket;
      setSocket(newSocket);

      const tryRejoinRoom = () => {
        const savedRoom = localStorage.getItem('room');
        const savedPlayerName = localStorage.getItem('playerName');
        if (savedRoom && savedPlayerName) {
          const roomData = JSON.parse(savedRoom);
          // Try to rejoin the room
          newSocket.emit('join-room', { 
            roomCode: roomData.roomCode, 
            playerName: savedPlayerName 
          });
        }
      };

      // If socket is already connected, try to rejoin immediately
      if (newSocket.connected) {
        tryRejoinRoom();
      }

      newSocket.on('connect', () => {
        // Try to restore room connection on reconnect
        tryRejoinRoom();
      });

      newSocket.on('room-created', (roomData) => {
        setRoom(roomData);
        setIsHost(true);
        setPlayerName(roomData.players[0].name);
      });

      newSocket.on('room-joined', (roomData) => {
        setRoom(roomData);
        const player = roomData.players.find(p => p.socketId === newSocket.id);
        setIsHost(player?.isHost || false);
        setPlayerName(player?.name || '');
        isRestoringRef.current = false;
      });

      newSocket.on('player-joined', (data) => {
        setRoom(data.room);
      });

      newSocket.on('player-left', (roomData) => {
        setRoom(roomData);
      });

      newSocket.on('game-started', (roomData) => {
        setRoom(roomData);
      });

      newSocket.on('scores-updated', (data) => {
        setRoom(data.room);
      });

      newSocket.on('next-question', (roomData) => {
        setRoom(roomData);
      });

      newSocket.on('game-finished', (roomData) => {
        setRoom(roomData);
      });

      newSocket.on('room-deleted', () => {
        alert('Room was deleted by host');
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        setSocket(null);
        setRoom(null);
        setIsHost(false);
        setPlayerName('');
        setGameMode('menu');
        // Clear localStorage
        localStorage.removeItem('room');
        localStorage.removeItem('playerName');
        localStorage.removeItem('isHost');
        localStorage.removeItem('gameMode');
      });

      newSocket.on('error', (error) => {
        const errorMsg = error.message || 'An error occurred';
        alert(errorMsg);
        // If error is about room not found or can't join, clear saved state
        if (errorMsg.includes('Room not found') || errorMsg.includes('already in progress') || errorMsg.includes('already taken')) {
          localStorage.removeItem('room');
          localStorage.removeItem('playerName');
          localStorage.removeItem('isHost');
          setRoom(null);
          setPlayerName('');
          setIsHost(false);
          isRestoringRef.current = false;
        }
      });

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
      };
    }
  }, [gameMode]);

  const handleCreateRoom = (name) => {
    if (socket) {
      socket.emit('create-room', { hostName: name, maxPlayers: 10 });
    }
  };

  const handleJoinRoom = (code, name) => {
    if (socket) {
      socket.emit('join-room', { roomCode: code, playerName: name });
    }
  };

  const handleStartGame = () => {
    if (socket && room) {
      socket.emit('start-game', { roomCode: room.roomCode });
    }
  };

  const handleLeaveRoom = () => {
    if (socket && room) {
      socket.emit('leave-room', { roomCode: room.roomCode });
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
    setRoom(null);
    setIsHost(false);
    setPlayerName('');
    setGameMode('menu');
    // Clear localStorage
    localStorage.removeItem('room');
    localStorage.removeItem('playerName');
    localStorage.removeItem('isHost');
    localStorage.removeItem('gameMode');
  };

  return (
    <div className="App">
      <div className="creator-credit">
        Created by <a href="https://x.com/manojdotdev" target="_blank" rel="noopener noreferrer">manojdotdev</a>
      </div>
      <div className="container">
        {gameMode === 'menu' && (
          <div className="menu-selection">
            <div className="menu-card">
              <h1 className="title">Never Have I Ever</h1>
              <div className="menu-options">
                <button
                  onClick={() => setGameMode('single')}
                  className="menu-btn primary"
                >
                  Single Player
                </button>
                <button
                  onClick={() => setGameMode('multiplayer')}
                  className="menu-btn secondary"
                >
                  Multiplayer
                </button>
              </div>
            </div>
          </div>
        )}

        {gameMode === 'single' && (
          <>
            {gameState === 'setup' && (
              <GameSetup 
                onStartGame={startGame} 
                onBack={() => setGameMode('menu')}
              />
            )}
            {gameState === 'playing' && (
              <GameBoard
                question={currentQuestion}
                players={players}
                scores={scores}
                round={round}
                onPlayerDrink={handlePlayerDrink}
                onNextQuestion={handleNextQuestion}
                onReset={() => {
                  resetGame();
                  setGameMode('menu');
                  localStorage.removeItem('gameMode');
                }}
              />
            )}
            {gameState === 'finished' && (
              <div className="game-finished">
                <h1>Game Over!</h1>
                <div className="final-scores">
                  <h2>Final Scores</h2>
                  {Object.entries(scores)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, score]) => (
                      <div key={name} className="score-item">
                        <span className="player-name">{name}</span>
                        <span className="player-score">{score} drinks</span>
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => {
                    resetGame();
                    setGameMode('menu');
                    localStorage.removeItem('gameMode');
                  }}
                  className="btn-primary"
                >
                  Back to Menu
                </button>
              </div>
            )}
          </>
        )}

        {gameMode === 'multiplayer' && (
          <>
            {!room && (
              <RoomSelection
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                onBack={handleLeaveRoom}
              />
            )}
            {room && room.gameState === 'waiting' && (
              <RoomLobby
                room={room}
                playerName={playerName}
                isHost={isHost}
                onStartGame={handleStartGame}
                onLeaveRoom={handleLeaveRoom}
              />
            )}
            {room && room.gameState === 'playing' && (
              <MultiplayerGameBoard
                room={room}
                playerName={playerName}
                isHost={isHost}
                socket={socket}
                onLeaveRoom={handleLeaveRoom}
              />
            )}
            {room && room.gameState === 'finished' && (
              <div className="game-finished">
                <h1>Game Over!</h1>
                <div className="final-scores">
                  <h2>Final Scores</h2>
                  {room.players
                    .sort((a, b) => (b.score || 0) - (a.score || 0))
                    .map((player) => (
                      <div key={player.socketId} className="score-item">
                        <span className="player-name">{player.name}</span>
                        <span className="player-score">{player.score || 0} drinks</span>
                      </div>
                    ))}
                </div>
                <button onClick={handleLeaveRoom} className="btn-primary">
                  Back to Menu
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

