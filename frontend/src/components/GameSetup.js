import React, { useState } from 'react';
import './GameSetup.css';

const GameSetup = ({ onStartGame, onBack }) => {
  const [players, setPlayers] = useState(['']);
  const [error, setError] = useState('');

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const addPlayer = () => {
    if (players.length < 10) {
      setPlayers([...players, '']);
    }
  };

  const removePlayer = (index) => {
    if (players.length > 1) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const handleStart = () => {
    const playerNames = players
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (playerNames.length < 2) {
      setError('Please add at least 2 players');
      return;
    }

    if (new Set(playerNames).size !== playerNames.length) {
      setError('Player names must be unique');
      return;
    }

    setError('');
    onStartGame(playerNames);
  };

  return (
    <div className="game-setup">
      <div className="setup-card">
        <h1 className="title">Never Have I Ever</h1>
        <p className="subtitle">Add players to start the game</p>
        
        <div className="players-list">
          {players.map((player, index) => (
            <div key={index} className="player-input-group">
              <input
                type="text"
                placeholder={`Player ${index + 1}`}
                value={player}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                className="player-input"
                maxLength={20}
              />
              {players.length > 1 && (
                <button
                  onClick={() => removePlayer(index)}
                  className="btn-remove"
                  aria-label="Remove player"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {players.length < 10 && (
          <button onClick={addPlayer} className="btn-add">
            + Add Player
          </button>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="setup-actions">
          <button onClick={handleStart} className="btn-start">
            Start Game
          </button>
          {onBack && (
            <button onClick={onBack} className="btn-back">
              ← Back to Menu
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameSetup;

