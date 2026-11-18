const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// Timer settings (seconds)
const SPYMASTER_TIME = 90;
const OPERATIVE_TIME = 120;
let turnTimerInterval = null;

// Serve static files
app.use(express.static(__dirname));

// Word bank for the game (full word list can be referenced in the implementation data)
const WORD_BANK = [
  'AFRICA', 'AGENT', 'AIR', 'ALIEN', 'ALPS', 'AMAZON', 'AMBULANCE', 'AMERICA', 'ANGEL', 'ANTARCTICA',
  'APPLE', 'ARM', 'ATLANTIS', 'AUSTRALIA', 'AZTEC', 'BACK', 'BALL', 'BAND', 'BANK', 'BAR',
  // ... (refer to for the full list of words)
];

// Game state
let gameState = {
  players: {},
  words: [],
  revealed: [],
  redTeam: [],
  blueTeam: [],
  redSpymaster: null,
  blueSpymaster: null,
  currentTeam: 'red',
  currentClue: null,
  guessesRemaining: 0,
  redScore: 0,
  blueScore: 0,
  redTotal: 9,
  blueTotal: 8,
  gameStarted: false,
  gameOver: false,
  winner: null,
  winReason: null,
  pendingGuesses: {},
  timeRemaining: SPYMASTER_TIME,
  turnPhase: 'spymaster' // 'spymaster' or 'operative'
};

// Stop and clear any running timer
function stopTurnTimer() {
  if (turnTimerInterval) {
    clearInterval(turnTimerInterval);
    turnTimerInterval = null;
  }
}

// Start or reset the countdown timer for a phase
function startTurnTimer(phase) {
  stopTurnTimer();
  if (!gameState.gameStarted || gameState.gameOver) return;

  gameState.turnPhase = phase;
  gameState.timeRemaining = phase === 'spymaster' ? SPYMASTER_TIME : OPERATIVE_TIME;

  io.emit('timerTick', {
    timeRemaining: gameState.timeRemaining,
    turnPhase: gameState.turnPhase,
    currentTeam: gameState.currentTeam
  });

  turnTimerInterval = setInterval(() => {
    if (!gameState.gameStarted || gameState.gameOver) {
      stopTurnTimer();
      return;
    }

    gameState.timeRemaining--;

    if (gameState.timeRemaining <= 0) {
      stopTurnTimer();

      // Switch turns on timeout
      const timedOutTeam = gameState.currentTeam;
      gameState.currentTeam = gameState.currentTeam === 'red' ? 'blue' : 'red';
      gameState.guessesRemaining = 0;
      gameState.currentClue = null;
      gameState.pendingGuesses = {};

      // Notify clients to show XXX overlay & buzzer
      io.emit('turnTimeout', {
        timedOutTeam,
        nextTeam: gameState.currentTeam
      });

      // Start the next team's spymaster clock
      startTurnTimer('spymaster');

      // Broadcast updated game state to everyone
      Object.keys(gameState.players).forEach(playerId => {
        io.to(playerId).emit('gameState', getPublicGameState(playerId));
      });
    } else {
      io.emit('timerTick', {
        timeRemaining: gameState.timeRemaining,
        turnPhase: gameState.turnPhase,
        currentTeam: gameState.currentTeam
      });
    }
  }, 1000);
}

// Helper function to shuffle array
function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Initialize a new game
function initializeGame() {
  const selectedWords = shuffle(WORD_BANK).slice(0, 25);
  const wordTypes = shuffle([
    ...Array(9).fill('red'),
    ...Array(8).fill('blue'),
    ...Array(7).fill('neutral'),
    'assassin'
  ]);

  gameState.words = selectedWords.map((word, index) => ({
    word,
    type: wordTypes[index],
    revealed: false
  }));

  gameState.revealed = Array(25).fill(false);
  gameState.currentTeam = 'red';
  gameState.currentClue = null;
  gameState.guessesRemaining = 0;
  gameState.redScore = 0;
  gameState.blueScore = 0;
  gameState.redTotal = 9;
  gameState.blueTotal = 8;
  gameState.gameStarted = true;
  gameState.gameOver = false;
  gameState.winner = null;
  gameState.winReason = null;
  gameState.pendingGuesses = {};

  startTurnTimer('spymaster');
}

// Get public game state (hides word types from operatives)
function getPublicGameState(socketId) {
  const player = gameState.players[socketId];
  const isSpymaster = player && player.spymaster;

  const pendingConfirmations = {};
  Object.keys(gameState.pendingGuesses).forEach(k => {
    const ids = gameState.pendingGuesses[k] || [];
    pendingConfirmations[k] = ids.map(id => (gameState.players[id] ? gameState.players[id].name : 'Unknown'));
  });

  return {
    players: Object.values(gameState.players),
    words: gameState.words.map((w, idx) => ({
      word: w.word,
      type: (isSpymaster || w.revealed) ? w.type : 'hidden',
      revealed: w.revealed,
      pendingConfirmations: pendingConfirmations[idx] || []
    })),
    redTeam: gameState.redTeam,
    blueTeam: gameState.blueTeam,
    redSpymaster: gameState.redSpymaster,
    blueSpymaster: gameState.blueSpymaster,
    currentTeam: gameState.currentTeam,
    currentClue: gameState.currentClue,
    guessesRemaining: gameState.guessesRemaining,
    redScore: gameState.redScore,
    blueScore: gameState.blueScore,
    redTotal: gameState.redTotal,
    blueTotal: gameState.blueTotal,
    gameStarted: gameState.gameStarted,
    gameOver: gameState.gameOver,
    winner: gameState.winner,
    winReason: gameState.winReason,
    timeRemaining: gameState.timeRemaining,
    turnPhase: gameState.turnPhase
  };
}

// Automatically assign a new player to the smaller team
function autoAssignTeamForNewPlayer(socketId) {
  const redCount = gameState.redTeam.length;
  const blueCount = gameState.blueTeam.length;
  return redCount <= blueCount ? 'red' : 'blue';
}

function addToTeamArray(socketId, team) {
  if (team === 'red') {
    if (!gameState.redTeam.includes(socketId)) gameState.redTeam.push(socketId);
  } else if (team === 'blue') {
    if (!gameState.blueTeam.includes(socketId)) gameState.blueTeam.push(socketId);
  }
}

function removeFromTeamArray(socketId, team) {
  if (team === 'red') {
    gameState.redTeam = gameState.redTeam.filter(id => id !== socketId);
  } else if (team === 'blue') {
    gameState.blueTeam = gameState.blueTeam.filter(id => id !== socketId);
  }
}

// Remove a player's pending confirmations from all pending lists
function removePendingForPlayer(socketId) {
  Object.keys(gameState.pendingGuesses).forEach(k => {
    gameState.pendingGuesses[k] = (gameState.pendingGuesses[k] || []).filter(id => id !== socketId);
  });
}
```
