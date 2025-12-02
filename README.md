# Never Have I Ever - MERN Stack Game

A fun interactive web application for playing the classic "Never Have I Ever" party game, built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- 🎮 Interactive game interface
- 👥 Single player mode
- 🌐 **Multiplayer online rooms** - Create or join rooms to play with friends in real-time!
- 📊 Score tracking
- 🎲 Random question generation
- 🎨 Modern, beautiful UI with gradient design
- 📱 Responsive design for mobile and desktop
- ⚡ Real-time synchronization using Socket.io

## Tech Stack

- **Frontend**: React, CSS3, Socket.io Client
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB, Mongoose
- **HTTP Client**: Axios
- **Real-time**: WebSocket (Socket.io)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

### 1. Clone or navigate to the project directory

```bash
cd "C:\Users\ASUS\OneDrive\Desktop\projects\New folder"
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Set up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd ../backend
```

Create `.env` file with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/never-have-i-ever
```

Or if using MongoDB Atlas:
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
```

### 5. Seed the Database

Run the seed script to populate the database with questions:

```bash
node seedQuestions.js
```

## Running the Application

### Start the Backend Server

In the `backend` directory:

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Start the Frontend

In a new terminal, navigate to the `frontend` directory:

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## How to Play

### Single Player Mode
1. **Setup**: Add 2-10 player names to start the game
2. **Gameplay**: 
   - Read the "Never Have I Ever..." question
   - Click on players who have done the action
   - Submit your selections
   - See who drank and current scores
   - Click "Next Question" to continue
3. **Scoring**: Players who have done the action get a point (drink)

### Multiplayer Mode
1. **Create or Join Room**: 
   - Click "Multiplayer" from the main menu
   - Create a room (you become the host) or join with a room code
   - Share the room code with friends
2. **Lobby**: 
   - Wait for players to join (minimum 2 players)
   - Host can start the game when ready
3. **Gameplay**:
   - All players see the same question simultaneously
   - Each player selects who has done the action
   - Scores update in real-time for all players
   - Host controls when to move to the next question
4. **Scoring**: Players who have done the action get a point (drink)
5. **Winning**: The player with the most drinks at the end wins (or loses, depending on how you see it!)

## Project Structure

```
.
├── backend/
│   ├── models/
│   │   ├── Question.js
│   │   └── GameSession.js
│   ├── routes/
│   │   ├── questions.js
│   │   └── game.js
│   ├── server.js
│   ├── seedQuestions.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameSetup.js
│   │   │   ├── GameSetup.css
│   │   │   ├── GameBoard.js
│   │   │   └── GameBoard.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## API Endpoints

### Questions
- `GET /api/questions` - Get all questions (with optional category/difficulty filters)
- `GET /api/questions/random` - Get a random question
- `POST /api/questions` - Create a new question

### Game (Single Player)
- `POST /api/game/session` - Create a new game session
- `GET /api/game/session/:id` - Get game session details
- `PUT /api/game/session/:id/score` - Update player score
- `GET /api/game/session/:id/next-question` - Get next question for the game

### Rooms (Multiplayer)
- `GET /api/rooms/:roomCode` - Get room by code
- `POST /api/rooms/create` - Create a new room
- `DELETE /api/rooms/:roomCode` - Delete a room

### Socket.io Events (Multiplayer)
**Client → Server:**
- `create-room` - Create a new room
- `join-room` - Join an existing room
- `leave-room` - Leave a room
- `start-game` - Start the game (host only)
- `player-selection` - Submit player selections
- `next-question` - Get next question (host only)

**Server → Client:**
- `room-created` - Room created successfully
- `room-joined` - Joined room successfully
- `player-joined` - A player joined the room
- `player-left` - A player left the room
- `game-started` - Game has started
- `scores-updated` - Scores have been updated
- `next-question` - New question received
- `game-finished` - Game has ended
- `room-deleted` - Room was deleted
- `error` - Error occurred

## Customization

### Adding More Questions

You can add questions through:
1. The API endpoint: `POST /api/questions`
2. Modifying `backend/seedQuestions.js` and re-running the seed script
3. Directly in MongoDB

### Styling

The UI uses CSS with gradient themes. Modify the CSS files in `frontend/src/components/` to customize the appearance.

## Troubleshooting

- **MongoDB Connection Error**: Make sure MongoDB is running locally or your MongoDB Atlas connection string is correct
- **Port Already in Use**: Change the PORT in `.env` file or kill the process using the port
- **CORS Errors**: The backend has CORS enabled, but ensure the frontend proxy is set correctly in `package.json`

## License

This project is open source and available for personal use.

## Enjoy!

Have fun playing Never Have I Ever! 🎉

