const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Word bank for the game (unchanged)
const WORD_BANK = [
  'AFRICA', 'AGENT', 'AIR', 'ALIEN', 'ALPS', 'AMAZON', 'AMBULANCE', 'AMERICA', 'ANGEL', 'ANTARCTICA',
  'APPLE', 'ARM', 'ATLANTIS', 'AUSTRALIA', 'AZTEC', 'BACK', 'BALL', 'BAND', 'BANK', 'BAR',
  'BARK', 'BAT', 'BATTERY', 'BEACH', 'BEAR', 'BEAT', 'BED', 'BEIJING', 'BELL', 'BELT',
  'BERLIN', 'BERMUDA', 'BERRY', 'BILL', 'BLOCK', 'BOARD', 'BOLT', 'BOMB', 'BOND', 'BOOM',
  'BOOT', 'BOTTLE', 'BOW', 'BOX', 'BRIDGE', 'BRUSH', 'BUCK', 'BUFFALO', 'BUG', 'BUGLE',
  'BUTTON', 'CALF', 'CANADA', 'CAP', 'CAPITAL', 'CAR', 'CARD', 'CARROT', 'CASINO', 'CAST',
  'CAT', 'CELL', 'CENTAUR', 'CENTER', 'CHAIR', 'CHANGE', 'CHARGE', 'CHECK', 'CHEST', 'CHICK',
  'CHINA', 'CHOCOLATE', 'CHURCH', 'CIRCLE', 'CLIFF', 'CLOAK', 'CLUB', 'CODE', 'COLD', 'COMIC',
  'COMPOUND', 'CONCERT', 'CONDUCTOR', 'CONTRACT', 'COOK', 'COPPER', 'COTTON', 'COURT', 'COVER', 'CRANE',
  'CRASH', 'CRICKET', 'CROSS', 'CROWN', 'CYCLE', 'CZECH', 'DANCE', 'DATE', 'DAY', 'DEATH',
  'DECK', 'DEGREE', 'DIAMOND', 'DICE', 'DINOSAUR', 'DISEASE', 'DOCTOR', 'DOG', 'DRAFT', 'DRAGON',
  'DRESS', 'DRILL', 'DROP', 'DUCK', 'DWARF', 'EAGLE', 'EGYPT', 'EMBASSY', 'ENGINE', 'ENGLAND',
  'EUROPE', 'EYE', 'FACE', 'FAIR', 'FALL', 'FAN', 'FENCE', 'FIELD', 'FIGHTER', 'FIGURE',
  'FILE', 'FILM', 'FIRE', 'FISH', 'FLUTE', 'FLY', 'FOOT', 'FORCE', 'FOREST', 'FORK',
  'FRANCE', 'GAME', 'GAS', 'GENIUS', 'GERMANY', 'GHOST', 'GIANT', 'GLASS', 'GLOVE', 'GOLD',
  'GRACE', 'GRASS', 'GREECE', 'GREEN', 'GROUND', 'HAM', 'HAND', 'HAWK', 'HEAD', 'HEART',
  'HELICOPTER', 'HIMALAYAS', 'HOLE', 'HOLLYWOOD', 'HONEY', 'HOOD', 'HOOK', 'HORN', 'HORSE', 'HORSESHOE',
  'HOSPITAL', 'HOTEL', 'ICE', 'ICE CREAM', 'INDIA', 'IRON', 'IVORY', 'JACK', 'JAM', 'JET',
  'JUPITER', 'KANGAROO', 'KETCHUP', 'KEY', 'KID', 'KING', 'KIWI', 'KNIFE', 'KNIGHT', 'LAB',
  'LAP', 'LASER', 'LAWYER', 'LEAD', 'LEMON', 'LEPRECHAUN', 'LIFE', 'LIGHT', 'LIMOUSINE', 'LINE',
  'LINK', 'LION', 'LITTER', 'LOCH NESS', 'LOCK', 'LOG', 'LONDON', 'LUCK', 'MAIL', 'MAMMOTH',
  'MAPLE', 'MARBLE', 'MARCH', 'MASS', 'MATCH', 'MERCURY', 'MEXICO', 'MICROSCOPE', 'MILLIONAIRE', 'MINE',
  'MINT', 'MISSILE', 'MODEL', 'MOLE', 'MOON', 'MOSCOW', 'MOUNT', 'MOUSE', 'MOUTH', 'MUG',
  'NAIL', 'NEEDLE', 'NET', 'NEW YORK', 'NIGHT', 'NINJA', 'NOTE', 'NOVEL', 'NURSE', 'NUT',
  'OCTOPUS', 'OIL', 'OLIVE', 'OLYMPUS', 'OPERA', 'ORANGE', 'ORGAN', 'PALM', 'PAN', 'PANTS',
  'PAPER', 'PARACHUTE', 'PARK', 'PART', 'PASS', 'PASTE', 'PENGUIN', 'PHOENIX', 'PIANO', 'PIE',
  'PILOT', 'PIN', 'PIPE', 'PIRATE', 'PISTOL', 'PIT', 'PITCH', 'PLANE', 'PLASTIC', 'PLATE',
  'PLATYPUS', 'PLAY', 'PLOT', 'POINT', 'POISON', 'POLE', 'POLICE', 'POOL', 'PORT', 'POST',
  'POUND', 'PRESS', 'PRINCESS', 'PUMPKIN', 'PUPIL', 'PYRAMID', 'QUEEN', 'RABBIT', 'RACKET', 'RAY',
  'REVOLUTION', 'RING', 'ROBIN', 'ROBOT', 'ROCK', 'ROME', 'ROOT', 'ROSE', 'ROULETTE', 'ROUND',
  'ROW', 'RULER', 'SATELLITE', 'SATURN', 'SCALE', 'SCHOOL', 'SCIENTIST', 'SCORPION', 'SCREEN', 'SCUBA DIVER',
  'SEAL', 'SERVER', 'SHADOW', 'SHAKESPEARE', 'SHARK', 'SHIP', 'SHOE', 'SHOP', 'SHOT', 'SINK',
  'SKYSCRAPER', 'SLIP', 'SLUG', 'SMUGGLER', 'SNOW', 'SNOWMAN', 'SOCK', 'SOLDIER', 'SOUL', 'SOUND',
  'SPACE', 'SPELL', 'SPIDER', 'SPIKE', 'SPINE', 'SPOT', 'SPRING', 'SPY', 'SQUARE', 'STADIUM',
  'STAFF', 'STAR', 'STATE', 'STICK', 'STOCK', 'STRAW', 'STREAM', 'STRIKE', 'STRING', 'SUB',
  'SUIT', 'SUPERHERO', 'SWING', 'SWITCH', 'TABLE', 'TABLET', 'TAG', 'TAIL', 'TAP', 'TEACHER',
  'TELESCOPE', 'TEMPLE', 'THEATER', 'THIEF', 'THUMB', 'TICK', 'TIE', 'TIME', 'TOKYO', 'TOOTH',
  'TORCH', 'TOWER', 'TRACK', 'TRAIN', 'TRIANGLE', 'TRIP', 'TRUNK', 'TUBE', 'TURKEY', 'UNDERTAKER',
  'UNICORN', 'VACUUM', 'VAN', 'VET', 'WAKE', 'WALL', 'WAR', 'WASHER', 'WASHINGTON', 'WATCH',
  'WATER', 'WAVE', 'WEB', 'WELL', 'WHALE', 'WHIP', 'WIND', 'WITCH', 'WORM', 'YARD'
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
  // pendingGuesses: { wordIndex: [socketId,...] }
  pendingGuesses: {}
};

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
}

// Get public game state (hides word types from operatives)
function getPublicGameState(socketId) {
  const player = gameState.players[socketId];
  const isSpymaster = player && player.spymaster;

  // Build pendingConfirmations: map word index -> array of player names
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
      // expose pending confirmation names for display
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
    winReason: gameState.winReason
  };
}

// Automatically assign a new player to the smaller team (even distribution)
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
    if (!gameState.pendingGuesses[k] || gameState.pendingGuesses[k].length === 0) {
      delete gameState.pendingGuesses[k];
    }
  });
}

// Execute the actual guess resolution (same logic as original guess handler)
function resolveGuess(wordIndex) {
  // Safety checks
  if (!gameState.words[wordIndex] || gameState.words[wordIndex].revealed) return;

  const word = gameState.words[wordIndex];
  word.revealed = true;
  gameState.guessesRemaining = Math.max(0, gameState.guessesRemaining - 1); // consume one guess

  if (word.type === 'red') {
    gameState.redScore++;
  } else if (word.type === 'blue') {
    gameState.blueScore++;
  }

  // Check for game over
  if (word.type === 'assassin') {
    gameState.gameOver = true;
    // winner is the opposite team
    gameState.winner = gameState.currentTeam === 'red' ? 'blue' : 'red';
    gameState.winReason = 'assassin';
  } else if (gameState.redScore === gameState.redTotal) {
    gameState.gameOver = true;
    gameState.winner = 'red';
    gameState.winReason = 'foundAll';
  } else if (gameState.blueScore === gameState.blueTotal) {
    gameState.gameOver = true;
    gameState.winner = 'blue';
    gameState.winReason = 'foundAll';
  }

  // If wrong team or neutral or out of guesses, switch teams
  if (word.type !== gameState.currentTeam || gameState.guessesRemaining === 0) {
    gameState.currentTeam = gameState.currentTeam === 'red' ? 'blue' : 'red';
    gameState.guessesRemaining = 0;
    gameState.currentClue = null;
  }

  // Clear all pending guesses (safe: after a resolved guess, other pending proposals should be dropped)
  gameState.pendingGuesses = {};
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Add player (initial join)
  socket.on('join', (playerName) => {
    const assignedTeam = autoAssignTeamForNewPlayer(socket.id);

    gameState.players[socket.id] = {
      id: socket.id,
      name: playerName,
      team: assignedTeam,
      spymaster: false,
      readyNewGame: false
    };

    addToTeamArray(socket.id, assignedTeam);
    socket.join(`team:${assignedTeam}`);

    io.emit('playerUpdate', Object.values(gameState.players));
    socket.emit('gameState', getPublicGameState(socket.id));
  });

  // Rejoin after redirect (victory page) or reconnect: register socket with provided name/team
  socket.on('rejoin', ({ name, team }) => {
    // Remove old entries matching this name (stale sockets)
    Object.keys(gameState.players).forEach(pid => {
      const p = gameState.players[pid];
      if (p && p.name === name && pid !== socket.id) {
        // Clean up stale
        removeFromTeamArray(pid, p.team);
        delete gameState.players[pid];
      }
    });

    gameState.players[socket.id] = {
      id: socket.id,
      name: name || `Player-${socket.id.slice(0,6)}`,
      team: team || null,
      spymaster: false,
      readyNewGame: false
    };

    if (team === 'red' || team === 'blue') {
      addToTeamArray(socket.id, team);
      socket.join(`team:${team}`);
    }

    io.emit('playerUpdate', Object.values(gameState.players));
    socket.emit('gameState', getPublicGameState(socket.id));
  });

  // Join team (manual)
  socket.on('joinTeam', (team) => {
    const player = gameState.players[socket.id];
    if (!player) return;

    // Reset ready flag and remove pending confirmations for this player
    player.readyNewGame = false;
    removePendingForPlayer(socket.id);

    // Leave old team room and array
    if (player.team) {
      socket.leave(`team:${player.team}`);
      removeFromTeamArray(socket.id, player.team);
      if (player.team === 'red' && gameState.redSpymaster === socket.id) {
        gameState.redSpymaster = null;
        player.spymaster = false;
      } else if (player.team === 'blue' && gameState.blueSpymaster === socket.id) {
        gameState.blueSpymaster = null;
        player.spymaster = false;
      }
    }

    // Add to new team
    player.team = team;
    addToTeamArray(socket.id, team);
    socket.join(`team:${team}`);

    io.emit('playerUpdate', Object.values(gameState.players));
    io.emit('gameState', getPublicGameState(socket.id));
  });

  // Become spymaster
  socket.on('becomeSpymaster', () => {
    const player = gameState.players[socket.id];
    if (!player || !player.team) return;

    if (player.team === 'red' && !gameState.redSpymaster) {
      gameState.redSpymaster = socket.id;
      player.spymaster = true;
    } else if (player.team === 'blue' && !gameState.blueSpymaster) {
      gameState.blueSpymaster = socket.id;
      player.spymaster = true;
    }

    io.emit('playerUpdate', Object.values(gameState.players));
    io.to(socket.id).emit('gameState', getPublicGameState(socket.id));
  });

  // Team chat
  socket.on('teamMessage', (text) => {
    const player = gameState.players[socket.id];
    if (!player || !player.team) return;
    // Only non-spymaster teammates should be sending messages in practice; no strict enforcement server-side
    const message = {
      from: player.name,
      text: String(text).slice(0, 1000),
      time: Date.now(),
      team: player.team
    };
    // Emit only to that team room
    io.to(`team:${player.team}`).emit('teamMessage', message);
  });

  // Player indicates they are ready to start a new game
  socket.on('playerReadyNewGame', () => {
    const player = gameState.players[socket.id];
    if (!player) return;

    player.readyNewGame = true;

    // Broadcast updated player list and state so clients can show who's ready
    io.emit('playerUpdate', Object.values(gameState.players));
    Object.keys(gameState.players).forEach(playerId => {
      io.to(playerId).emit('gameState', getPublicGameState(playerId));
    });

    // Check if everyone is ready
    const allPlayers = Object.values(gameState.players);
    if (allPlayers.length > 0 && allPlayers.every(p => p.readyNewGame)) {
      // Reset ready flags and spymasters, then initialize a new game
      allPlayers.forEach(p => {
        p.readyNewGame = false;
        p.spymaster = false;
      });
      gameState.redSpymaster = null;
      gameState.blueSpymaster = null;

      initializeGame();

      io.emit('playerUpdate', Object.values(gameState.players));
      Object.keys(gameState.players).forEach(playerId => {
        io.to(playerId).emit('gameState', getPublicGameState(playerId));
      });
    }
  });

  // Start game (manual start)
  socket.on('startGame', () => {
    if (gameState.redTeam.length > 0 && gameState.blueTeam.length > 0) {
      // Clear ready flags when a manual start is triggered
      Object.values(gameState.players).forEach(p => {
        p.readyNewGame = false;
        p.spymaster = p.spymaster || false;
      });

      initializeGame();

      // Send personalized game state to each player
      Object.keys(gameState.players).forEach(playerId => {
        io.to(playerId).emit('gameState', getPublicGameState(playerId));
      });
    }
  });

  // Give clue (spymaster only) - unchanged
  socket.on('giveClue', ({ word, number }) => {
    const player = gameState.players[socket.id];
    if (!player || !player.spymaster || player.team !== gameState.currentTeam) return;
    if (gameState.guessesRemaining > 0) return; // Can't give clue during guessing

    gameState.currentClue = { word, number };
    gameState.guessesRemaining = parseInt(number) + 1; // +1 for bonus guess

    io.emit('clueGiven', { word, number, team: gameState.currentTeam });

    Object.keys(gameState.players).forEach(playerId => {
      io.to(playerId).emit('gameState', getPublicGameState(playerId));
    });
  });

  // Proposed guess (confirmation flow). Non-spymaster operatives call this when they click a word.
  socket.on('proposeGuess', (wordIndex) => {
    const player = gameState.players[socket.id];
    if (!player || player.spymaster) return;
    if (player.team !== gameState.currentTeam) return;
    if (!gameState.gameStarted || gameState.gameOver) return;
    if (!gameState.words[wordIndex] || gameState.words[wordIndex].revealed) return;

    // Count non-spymaster players on current team
    const nonSpymPlayers = Object.values(gameState.players).filter(p => p.team === player.team && !p.spymaster);
    const nonSpymCount = nonSpymPlayers.length;

    // If 1 or less non-spym players, resolve immediately (backwards-compatible)
    if (nonSpymCount <= 1) {
      // treat as immediate guess (consume one guess)
      resolveGuess(wordIndex);

      // Broadcast updated state
      Object.keys(gameState.players).forEach(playerId => {
        io.to(playerId).emit('gameState', getPublicGameState(playerId));
      });
      return;
    }

    // Multi-player confirmation flow:
    // Ensure player's previous pending entries are removed so they only confirm one candidate at a time
    removePendingForPlayer(socket.id);

    // Add to pending for this word
    const key = String(wordIndex);
    gameState.pendingGuesses[key] = gameState.pendingGuesses[key] || [];
    if (!gameState.pendingGuesses[key].includes(socket.id)) {
      gameState.pendingGuesses[key].push(socket.id);
    }

    // Broadcast updated state so names show up on the square
    Object.keys(gameState.players).forEach(playerId => {
      io.to(playerId).emit('gameState', getPublicGameState(playerId));
    });

    // If everyone (all non spymaster teammates) has confirmed on this word, resolve it
    const pendingCount = gameState.pendingGuesses[key].filter(id => {
      const p = gameState.players[id];
      return p && p.team === player.team && !p.spymaster;
    }).length;

    if (pendingCount >= nonSpymCount) {
      // All non-spymaster teammates have clicked -> finalize guess
      resolveGuess(wordIndex);

      // Broadcast updated state after resolution
      Object.keys(gameState.players).forEach(playerId => {
        io.to(playerId).emit('gameState', getPublicGameState(playerId));
      });
    }
  });

  // Make guess legacy (operative only) - kept for backwards compatibility but now not used when team >2
  socket.on('guess', (wordIndex) => {
    const player = gameState.players[socket.id];
    if (!player || player.spymaster || player.team !== gameState.currentTeam) return;
    if (gameState.guessesRemaining <= 0) return;
    if (gameState.words[wordIndex].revealed) return;

    // Resolve as immediate guess
    resolveGuess(wordIndex);

    Object.keys(gameState.players).forEach(playerId => {
      io.to(playerId).emit('gameState', getPublicGameState(playerId));
    });
  });

  // End turn
  socket.on('endTurn', () => {
    const player = gameState.players[socket.id];
    if (!player || player.team !== gameState.currentTeam) return;

    gameState.currentTeam = gameState.currentTeam === 'red' ? 'blue' : 'red';
    gameState.guessesRemaining = 0;
    gameState.currentClue = null;
    // Clear pending confirmations when turn ends
    gameState.pendingGuesses = {};

    Object.keys(gameState.players).forEach(playerId => {
      io.to(playerId).emit('gameState', getPublicGameState(playerId));
    });
  });

  // New game (legacy/admin immediate start)
  socket.on('newGame', () => {
    // Reset spymasters and ready flags
    Object.values(gameState.players).forEach(player => {
      player.spymaster = false;
      player.readyNewGame = false;
    });
    gameState.redSpymaster = null;
    gameState.blueSpymaster = null;

    initializeGame();

    io.emit('playerUpdate', Object.values(gameState.players));
    Object.keys(gameState.players).forEach(playerId => {
      io.to(playerId).emit('gameState', getPublicGameState(playerId));
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    const player = gameState.players[socket.id];
    if (player) {
      // Remove from team arrays and room
      if (player.team === 'red') {
        gameState.redTeam = gameState.redTeam.filter(id => id !== socket.id);
        if (gameState.redSpymaster === socket.id) {
          gameState.redSpymaster = null;
        }
      } else if (player.team === 'blue') {
        gameState.blueTeam = gameState.blueTeam.filter(id => id !== socket.id);
        if (gameState.blueSpymaster === socket.id) {
          gameState.blueSpymaster = null;
        }
      }

      // Remove any pending confirmations from this player
      removePendingForPlayer(socket.id);

      delete gameState.players[socket.id];
    }

    io.emit('playerUpdate', Object.values(gameState.players));
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});