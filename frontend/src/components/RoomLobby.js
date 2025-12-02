import React from 'react';
import './RoomLobby.css';

const RoomLobby = ({ room, playerName, isHost, onStartGame, onLeaveRoom }) => {
  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    alert('Room code copied to clipboard!');
  };

  return (
    <div className="room-lobby">
      <div className="lobby-card">
        <div className="lobby-header">
          <h1>Room: {room.roomCode}</h1>
          <button onClick={copyRoomCode} className="btn-copy">
            📋 Copy Code
          </button>
        </div>

        <div className="room-code-display">
          <div className="code-label">Share this code with friends:</div>
          <div className="code-value">{room.roomCode}</div>
        </div>

        <div className="players-section">
          <h2>Players ({room.players.length}/{room.maxPlayers})</h2>
          <div className="players-list">
            {room.players.map((player, index) => (
              <div key={index} className={`player-item ${player.isHost ? 'host' : ''}`}>
                <span className="player-name">
                  {player.name}
                  {player.isHost && <span className="host-badge">👑 Host</span>}
                </span>
                <span className="player-score">Score: {player.score || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lobby-actions">
          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={room.players.length < 2}
              className="btn-start"
            >
              {room.players.length < 2
                ? 'Waiting for players... (Need at least 2)'
                : 'Start Game'}
            </button>
          ) : (
            <div className="waiting-message">
              Waiting for host to start the game...
            </div>
          )}
          <button onClick={onLeaveRoom} className="btn-leave">
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomLobby;

