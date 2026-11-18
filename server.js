const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// Timer settings (seconds) & static file serving
const SPYMASTER_TIME = 90;
const OPERATIVE_TIME = 120;
let turnTimerInterval = null;
app.use(express.static(__dirname));

// Word bank for the game (includes ~400 standard Codenames terms from AFRICA to YARD)
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

// Initial game state structure
let gameState = {
  players: {}, words: [], revealed: [], redTeam: [], blueTeam: [],
  redSpymaster: null, blueSpymaster: null, currentTeam: 'red',
  currentClue: null, guessesRemaining: 0, redScore: 0, blueScore: 0,
  redTotal: 9, blueTotal: 8, gameStarted: false, gameOver: false,
  winner: null, winReason: null, pendingGuesses: {},
  timeRemaining: SPYMASTER_TIME, turnPhase: 'spymaster'
};
function stopTurnTimer() {
  if (turnTimerInterval) {
    clearInterval(turnTimerInterval);
    turnTimerInterval = null;
  }
}

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
      const timedOutTeam = gameState.currentTeam;
      gameState.currentTeam = gameState.currentTeam === 'red' ? 'blue' : 'red';
      gameState.guessesRemaining = 0;
      gameState.currentClue = null;
      gameState.pendingGuesses = {};

      io.emit('turnTimeout', {
        timedOutTeam,
        nextTeam: gameState.currentTeam
      });

      startTurnTimer('spymaster');

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

function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

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

function removePendingForPlayer(socketId) {
  Object.keys(gameState.pendingGuesses).forEach(k => {
    gameState.pendingGuesses[k] = (gameState.pendingGuesses[k] || []).filter(id => id !== socketId);
  });
}
function resolveGuess(wordIndex) {
  const word = gameState.words[wordIndex];
  if (!word || word.revealed) return;

  word.revealed = true;
  gameState.revealed[wordIndex] = true;

  if (word.type === 'red') {
    gameState.redScore++;
  } else if (word.type === 'blue') {
    gameState.blueScore++;
  }

  // Stop timer immediately on Victory or Assassin
  if (word.type === 'assassin') {
    gameState.gameOver = true;
    gameState.winner = gameState.currentTeam === 'red' ? 'blue' : 'red';
    gameState.winReason = 'assassin';
    stopTurnTimer();
  } else if (gameState.redScore === gameState.redTotal) {
    gameState.gameOver = true;
    gameState.winner = 'red';
    gameState.winReason = 'foundAll';
    stopTurnTimer();
  } else if (gameState.blueScore === gameState.blueTotal) {
    gameState.gameOver = true;
    gameState.winner = 'blue';
    gameState.winReason = 'foundAll';
    stopTurnTimer();
  }

  if (!gameState.gameOver) {
    if (word.type === gameState.currentTeam) {
      gameState.guessesRemaining--;
      if (gameState.guessesRemaining <= 0) {
        gameState.currentTeam = gameState.currentTeam === 'red' ? 'blue' : 'red';
        gameState.guessesRemaining = 0;
        gameState.currentClue = null;
        startTurnTimer('spymaster');
      }
    } else {
      gameState.currentTeam = gameState.currentTeam === 'red' ? 'blue' : 'red';
      gameState.guessesRemaining = 0;
      gameState.currentClue = null;
      startTurnTimer('spymaster');
    }
  }

  gameState.pendingGuesses = {};
}

function broadcastGameState() {
  Object.keys(gameState.players).forEach(playerId => {
    io.to(playerId).emit('gameState', getPublicGameState(playerId));
  });
}

io.on('connection', (socket) => {
  socket.on('join', (name) => {
    const team = autoAssignTeamForNewPlayer(socket.id);
    addToTeamArray(socket.id, team);
    gameState.players[socket.id] = {
      id: socket.id,
      name: String(name || 'Player').slice(0, 20),
      team,
      spymaster: false,
      readyNewGame: false
    };
    io.emit('playerUpdate', Object.values(gameState.players));
    socket.emit('gameState', getPublicGameState(socket.id));
  });

  socket.on('joinTeam', (team) => {
    const player = gameState.players[socket.id];
    if (!player || gameState.gameStarted) return;
    if (team !== 'red' && team !== 'blue') return;

    removeFromTeamArray(socket.id, player.team);
    if (gameState.redSpymaster === socket.id) gameState.redSpymaster = null;
    if (gameState.blueSpymaster === socket.id) gameState.blueSpymaster = null;

    player.team = team;
    player.spymaster = false;
    addToTeamArray(socket.id, team);

    io.emit('playerUpdate', Object.values(gameState.players));
    broadcastGameState();
  });

  socket.on('becomeSpymaster', () => {
    const player = gameState.players[socket.id];
    if (!player || !player.team || gameState.gameStarted) return;

    if (player.team === 'red') {
      if (gameState.redSpymaster && gameState.redSpymaster !== socket.id) return;
      gameState.redSpymaster = socket.id;
      player.spymaster = true;
    } else if (player.team === 'blue') {
      if (gameState.blueSpymaster && gameState.blueSpymaster !== socket.id) return;
      gameState.blueSpymaster = socket.id;
      player.spymaster = true;
    }

    io.emit('playerUpdate', Object.values(gameState.players));
    broadcastGameState();
  });

  socket.on('startGame', () => {
    if (gameState.gameStarted && !gameState.gameOver) return;
    initializeGame();
    io.emit('playerUpdate', Object.values(gameState.players));
    broadcastGameState();
  });

  socket.on('giveClue', ({ word, number }) => {
    const player = gameState.players[socket.id];
    if (!player || !player.spymaster || player.team !== gameState.currentTeam) return;
    if (!gameState.gameStarted || gameState.gameOver || gameState.currentClue) return;

    const parsedNum = parseInt(number, 10) || 1;
    gameState.currentClue = { word: String(word).toUpperCase(), number: parsedNum };
    gameState.guessesRemaining = parsedNum + 1;
    gameState.pendingGuesses = {};

    startTurnTimer('operative');
    broadcastGameState();
  });

  socket.on('proposeGuess', (wordIndex) => {
    const player = gameState.players[socket.id];
    if (!player || player.spymaster || player.team !== gameState.currentTeam) return;
    if (!gameState.gameStarted || gameState.gameOver || !gameState.currentClue) return;

    const operatives = Object.values(gameState.players).filter(
      p => p.team === gameState.currentTeam && !p.spymaster
    );

    if (operatives.length <= 1) {
      resolveGuess(wordIndex);
      broadcastGameState();
      return;
    }

    removePendingForPlayer(socket.id);
    if (!gameState.pendingGuesses[wordIndex]) {
      gameState.pendingGuesses[wordIndex] = [];
    }
    gameState.pendingGuesses[wordIndex].push(socket.id);

    if (gameState.pendingGuesses[wordIndex].length >= operatives.length) {
      resolveGuess(wordIndex);
    }
    broadcastGameState();
  });

  socket.on('guess', (wordIndex) => {
    const player = gameState.players[socket.id];
    if (!player || player.spymaster || player.team !== gameState.currentTeam) return;
    if (!gameState.gameStarted || gameState.gameOver || !gameState.currentClue) return;

    resolveGuess(wordIndex);
    broadcastGameState();
  });

  socket.on('endTurn', () => {
    const player = gameState.players[socket.id];
    if (!player || player.spymaster || player.team !== gameState.currentTeam) return;
    if (!gameState.gameStarted || gameState.gameOver || !gameState.currentClue) return;

    gameState.currentTeam = gameState.currentTeam === 'red' ? 'blue' : 'red';
    gameState.guessesRemaining = 0;
    gameState.currentClue = null;
    gameState.pendingGuesses = {};

    startTurnTimer('spymaster');
    broadcastGameState();
  });

  socket.on('teamMessage', (text) => {
    const player = gameState.players[socket.id];
    if (!player || player.spymaster || !player.team) return;
    io.emit('teamMessage', {
      team: player.team,
      from: player.name,
      text: String(text || '').slice(0, 300)
    });
  });

  socket.on('playerReadyNewGame', () => {
    const player = gameState.players[socket.id];
    if (!player) return;
    player.readyNewGame = true;
    io.emit('playerUpdate', Object.values(gameState.players));

    const allPlayers = Object.values(gameState.players);
    if (allPlayers.length > 0 && allPlayers.every(p => p.readyNewGame)) {
      allPlayers.forEach(p => { p.readyNewGame = false; });
      initializeGame();
      io.emit('playerUpdate', Object.values(gameState.players));
      broadcastGameState();
    }
  });

  socket.on('disconnect', () => {
    const player = gameState.players[socket.id];
    if (player) {
      removeFromTeamArray(socket.id, player.team);
      removePendingForPlayer(socket.id);
      if (gameState.redSpymaster === socket.id) gameState.redSpymaster = null;
      if (gameState.blueSpymaster === socket.id) gameState.blueSpymaster = null;
      delete gameState.players[socket.id];
      io.emit('playerUpdate', Object.values(gameState.players));
    }
  });
});

http.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
