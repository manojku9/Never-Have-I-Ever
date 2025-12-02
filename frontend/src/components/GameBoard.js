import React, { useState, useEffect } from 'react';
import './GameBoard.css';

const GameBoard = ({ question, players, scores, round, onPlayerDrink, onNextQuestion, onReset }) => {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setSelectedPlayers([]);
    setShowResults(false);
  }, [question]);

  const handlePlayerClick = (playerName) => {
    if (showResults) return;
    
    setSelectedPlayers(prev => {
      if (prev.includes(playerName)) {
        return prev.filter(name => name !== playerName);
      }
      return [...prev, playerName];
    });
  };

  const handleSubmit = () => {
    selectedPlayers.forEach(playerName => {
      onPlayerDrink(playerName);
    });
    setShowResults(true);
  };

  const handleNext = () => {
    setSelectedPlayers([]);
    setShowResults(false);
    onNextQuestion();
  };

  if (!question) {
    return (
      <div className="game-board">
        <div className="loading">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="game-board">
      <div className="game-header">
        <div className="round-info">Round {round}</div>
        <button onClick={onReset} className="btn-reset">Reset Game</button>
      </div>

      <div className="question-card">
        <div className="question-label">Never Have I Ever..</div>
        <h2 className="question-text">{question.text}</h2>
      </div>

      {!showResults ? (
        <>
          <div className="players-section">
            <h3 className="section-title">Who has done this? (Click to select)</h3>
            <div className="players-grid">
              {players.map((player) => (
                <button
                  key={player.name}
                  onClick={() => handlePlayerClick(player.name)}
                  className={`player-card ${selectedPlayers.includes(player.name) ? 'selected' : ''}`}
                >
                  <div className="player-name">{player.name}</div>
                  <div className="player-score">Score: {scores[player.name] || 0}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="actions">
            <button
              onClick={handleSubmit}
              className="btn-primary"
              disabled={selectedPlayers.length === 0}
            >
              Submit ({selectedPlayers.length} selected)
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="results-section">
            <h3 className="section-title">
              {selectedPlayers.length > 0
                ? `${selectedPlayers.length} player(s) drank!`
                : 'No one drank!'}
            </h3>
            {selectedPlayers.length > 0 && (
              <div className="drinkers-list">
                {selectedPlayers.map((name) => (
                  <div key={name} className="drinker-badge">
                    {name} 🍺
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="current-scores">
            <h3 className="section-title">Current Scores</h3>
            <div className="scores-list">
              {players
                .sort((a, b) => (scores[b.name] || 0) - (scores[a.name] || 0))
                .map((player) => (
                  <div key={player.name} className="score-row">
                    <span className="score-name">{player.name}</span>
                    <span className="score-value">{scores[player.name] || 0} drinks</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="actions">
            <button onClick={handleNext} className="btn-primary">
              Next Question
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GameBoard;

