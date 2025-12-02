import React, { useState } from 'react';
import './RoomSelection.css';

const RoomSelection = ({ onCreateRoom, onJoinRoom, onBack }) => {
  const [showJoin, setShowJoin] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    onCreateRoom(playerName.trim());
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }
    onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
  };

  return (
    <div className="room-selection">
      <div className="selection-card">
        <h1 className="title">Never Have I Ever</h1>
        <p className="subtitle">Play with friends online!</p>

        {!showJoin ? (
          <div className="selection-options">
            <div className="option-section">
              <h2>Create a Room</h2>
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="name-input"
                maxLength={20}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
              <button onClick={handleCreateRoom} className="btn-primary">
                Create Room
              </button>
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <button
              onClick={() => setShowJoin(true)}
              className="btn-secondary"
            >
              Join Existing Room
            </button>
            {onBack && (
              <button onClick={onBack} className="btn-back">
                ← Back to Menu
              </button>
            )}
          </div>
        ) : (
          <div className="selection-options">
            <div className="option-section">
              <h2>Join a Room</h2>
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="name-input"
                maxLength={20}
              />
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="room-code-input"
                maxLength={6}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <div className="join-actions">
                <button onClick={handleJoinRoom} className="btn-primary">
                  Join Room
                </button>
                <button
                  onClick={() => {
                    setShowJoin(false);
                    setRoomCode('');
                  }}
                  className="btn-back"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSelection;

