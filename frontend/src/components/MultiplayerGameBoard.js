// ...existing code...
import React, { useState, useEffect } from 'react';
import './GameBoard.css';

// ...existing code...
const MultiplayerGameBoard = ({ 
  room, 
  playerName, 
  isHost, 
  socket,
  onLeaveRoom 
}) => {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [waitingForOthers, setWaitingForOthers] = useState(false);

  useEffect(() => {
    if (room && room.currentQuestion) {
      setSelectedPlayers([]);
      setShowResults(false);
      setWaitingForOthers(false);
    }
  }, [room, room.currentQuestion]);

  useEffect(() => {
    if (!socket) return;

    const handleScoresUpdated = (data) => {
      setShowResults(true);
      setWaitingForOthers(false);
    };

    const handleNextQuestion = (updatedRoom) => {
      setSelectedPlayers([]);
      setShowResults(false);
      setWaitingForOthers(false);
    };

    socket.on('scores-updated', handleScoresUpdated);
    socket.on('next-question', handleNextQuestion);

    return () => {
      socket.off('scores-updated', handleScoresUpdated);
      socket.off('next-question', handleNextQuestion);
    };
  }, [socket]);

  const handlePlayerClick = (playerName) => {
    if (showResults || waitingForOthers) return;
    
    setSelectedPlayers(prev => {
      if (prev.includes(playerName)) {
        return prev.filter(name => name !== playerName);
      }
      return [...prev, playerName];
    });
  };

  const handleSubmit = () => {
    if (selectedPlayers.length === 0) return;
    if (!socket) {
      console.warn('Socket not connected - cannot submit selection');
      return;
    }
    
    setWaitingForOthers(true);
    socket.emit('player-selection', {
      roomCode: room?.roomCode,
      selectedPlayers: selectedPlayers
    });
  };

  const handleNext = () => {
    if (!isHost) return;
    if (!socket) {
      console.warn('Socket not connected - cannot go to next question');
      return;
    }
    socket.emit('next-question', { roomCode: room?.roomCode });
  };

  if (!room || !room.currentQuestion) {
    return (
      <div className="game-board">
        <div className="loading">Loading question...</div>
      </div>
    );
  }

  // Handle both populated question object and ObjectId string
  let questionText = '';
  if (typeof room.currentQuestion === 'string') {
    // If it's just an ObjectId string, show loading
    questionText = 'Loading question...';
  } else if (room.currentQuestion && room.currentQuestion.text) {
    // If it's a populated question object
    questionText = room.currentQuestion.text;
  } else {
    questionText = 'Loading question...';
  }

  return (
    <div className="game-board">
      <div className="game-header">
        <div className="round-info">
          Round {room.currentRound} | Room: {room.roomCode}
        </div>
        <button onClick={onLeaveRoom} className="btn-reset">
          Leave Game
        </button>
      </div>

      <div className="question-card">
        <div className="question-label">Never Have I Ever...</div>
        <h2 className="question-text">{questionText}</h2>
      </div>

      {!showResults ? (
        <>
          <div className="players-section">
            <h3 className="section-title">Who has done this? (Click to select)</h3>
            <div className="players-grid">
              {(room.players || []).map((player) => (
                <button
                  key={player.socketId}
                  onClick={() => handlePlayerClick(player.name)}
                  className={`player-card ${selectedPlayers.includes(player.name) ? 'selected' : ''}`}
                  disabled={waitingForOthers}
                >
                  <div className="player-name">{player.name}</div>
                  <div className="player-score">Score: {player.score || 0}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="actions">
            <button
              onClick={handleSubmit}
              className="btn-primary"
              disabled={selectedPlayers.length === 0 || waitingForOthers}
            >
              {waitingForOthers 
                ? 'Waiting for other players...' 
                : `Submit (${selectedPlayers.length} selected)`}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="results-section">
            <h3 className="section-title">Scores Updated!</h3>
            <div className="current-scores">
              <h3 className="section-title">Current Scores</h3>
              <div className="scores-list">
                {room.players
                  .sort((a, b) => (b.score || 0) - (a.score || 0))
                  .map((player) => (
                    <div key={player.socketId} className="score-row">
                      <span className="score-name">{player.name}</span>
                      <span className="score-value">{player.score || 0} drinks</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="actions">
            {isHost ? (
              <button onClick={handleNext} className="btn-primary">
                Next Question
              </button>
            ) : (
              <div className="waiting-message">
                Waiting for host to continue...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MultiplayerGameBoard;
// ...existing code...