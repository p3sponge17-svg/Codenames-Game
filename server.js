// When all players click Start New Game, return to lobby with teams preserved & timer stopped
  socket.on('playerReadyNewGame', (payload) => {
    let player = gameState.players[socket.id];

    // Self-heal: if socket reconnected on victory.html without finishing 'rejoin', register them now
    if (!player && payload && payload.name) {
      const assignedTeam = (payload.team === 'red' || payload.team === 'blue')
        ? payload.team
        : autoAssignTeamForNewPlayer();

      // Remove any stale disconnected entry with the same name
      Object.keys(gameState.players).forEach(existingId => {
        const p = gameState.players[existingId];
        if (p && p.name === payload.name && existingId !== socket.id) {
          removeFromTeamArray(existingId, p.team);
          removePendingForPlayer(existingId);
          if (gameState.redSpymaster === existingId) gameState.redSpymaster = null;
          if (gameState.blueSpymaster === existingId) gameState.blueSpymaster = null;
          delete gameState.players[existingId];
        }
      });

      addToTeamArray(socket.id, assignedTeam);
      player = {
        id: socket.id,
        name: payload.name,
        team: assignedTeam,
        spymaster: false,
        readyNewGame: false
      };
      gameState.players[socket.id] = player;
    }

    if (!player) return;

    player.readyNewGame = true;
    io.emit('playerUpdate', Object.values(gameState.players));

    const allIds = Object.keys(gameState.players);
    if (allIds.length > 0 && allIds.every(id => gameState.players[id].readyNewGame)) {
      resetToLobby();
      io.emit('returnToLobby');
      io.emit('playerUpdate', Object.values(gameState.players));
      Object.keys(gameState.players).forEach(playerId => {
        io.to(playerId).emit('gameState', getPublicGameState(playerId));
      });
    }
  });