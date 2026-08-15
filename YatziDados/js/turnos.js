// ===== GESTIÓN DE TURNOS Y ESTADO DE LA PARTIDA =====

let turnOrder = [];
let playerColors = {};
let currentTurnIndex = 0;
let gameStarted = false;
let gameFinished = false;
let pendingOrder = [];

let isRoomCreator = false;
let hostId = null;

// ----------------------------------------------------------------------
// Funciones de estado de turnos
// ----------------------------------------------------------------------

function isMyTurn() {
    return gameStarted && turnOrder.length > 0 && turnOrder[currentTurnIndex] === myId;
}

function afterTurnBecameMine() {
    if (isMyTurn()) {
        myDice = [null, null, null, null, null];
        markedThisTurn = false;
        jokerModeActive = false;
        lastMarkedCatId = null;
        lastMarkedWasJoker = false;
    }
}

function endTurn() {
    if (!isMyTurn() || !markedThisTurn) return;
    logMove('end_turn', {});
    if (upperBonus(myScores) === 35) myBonusAnnounced = true;
    flushPendingEvents();
    sfxTurnEnd();
    const nextIndex = (currentTurnIndex + 1) % turnOrder.length;
    broadcastTurnAdvance(nextIndex);
    applyTurnAdvance(nextIndex);
}

function applyTurnAdvance(nextIndex) {
    currentTurnIndex = nextIndex;
    afterTurnBecameMine();
    renderTurnBanner();
    renderDice();
    renderScores();
    renderLeaderboard();
    updateStartButton();
}

function broadcastTurnAdvance(nextIndex) {
    if (mqttClient && currentRoom) {
        mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({
            action: 'turn_advance',
            id: myId,
            nextIndex
        }));
    }
}

// ----------------------------------------------------------------------
// Inicio de partida
// ----------------------------------------------------------------------

function startGame() {
    if (!isRoomCreator || gameStarted || pendingOrder.length === 0) return;
    turnOrder = [...pendingOrder];
    const colors = {};
    turnOrder.forEach((id, idx) => {
        colors[id] = PLAYER_COLORS[idx % PLAYER_COLORS.length].id;
    });
    playerColors = colors;
    Object.keys(playersData).forEach(id => {
        if (playersData[id]) playersData[id].color = colors[id];
    });
    currentTurnIndex = 0;
    gameStarted = true;
    gameFinished = false;
    broadcastGameStart();
    afterTurnBecameMine();
    renderTurnBanner();
    renderDice();
    renderScores();
    renderLeaderboard();
    updateStartButton();
    saveState();
}

function broadcastGameStart() {
    if (mqttClient && currentRoom) {
        mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({
            action: 'game_start',
            id: myId,
            turnOrder,
            colors: playerColors,
            hostId
        }));
    }
}

function broadcastGameStateSync() {
    if (mqttClient && currentRoom) {
        mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({
            action: 'game_state_sync',
            id: myId,
            turnOrder,
            colors: playerColors,
            currentTurnIndex,
            hostId
        }));
    }
}

// ----------------------------------------------------------------------
// Orden de jugadores (solo actualización, sin UI)
// ----------------------------------------------------------------------

function updatePendingOrder() {
    // Mantiene el orden de llegada: los que ya estaban conservan su posición,
    // los nuevos se añaden al final.
    const currentIds = Object.keys(playersData);
    // Eliminar los que ya no están
    pendingOrder = pendingOrder.filter(id => currentIds.includes(id));
    // Añadir los nuevos al final
    currentIds.forEach(id => {
        if (!pendingOrder.includes(id)) pendingOrder.push(id);
    });
    // Notificar cambios en el botón de inicio
    updateStartButton();
}

// ----------------------------------------------------------------------
// Reinicio de la partida
// ----------------------------------------------------------------------

function requestGameReset() {
    if (!isRoomCreator) return;
    document.getElementById('resetGameModal').style.display = 'flex';
}

function confirmGameReset() {
    closeResetGameModal();
    broadcastGameReset();
    applyGameReset();
}

function applyGameReset() {
    myScores = emptyScores();
    myExtraYatzys = 0;
    myBonusAnnounced = false;
    markedThisTurn = false;
    jokerModeActive = false;
    lastMarkedCatId = null;
    lastMarkedWasJoker = false;
    gameStarted = false;
    gameFinished = false;
    turnOrder = [];
    currentTurnIndex = 0;
    pendingEvents = [];

    Object.keys(playersData).forEach(id => {
        playersData[id].scores = emptyScores();
        playersData[id].extraYatzys = 0;
        playersData[id].score = 0;
        playersData[id].color = null;
    });

    logMove('reset', {});
    document.getElementById('gameOverModal').style.display = 'none';
    renderTurnBanner();
    renderDice();
    renderScores();
    renderLeaderboard();
    updateStartButton();
    saveState();
}

function broadcastGameReset() {
    if (mqttClient && currentRoom) {
        mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({
            action: 'game_reset',
            id: myId
        }));
    }
}

// ----------------------------------------------------------------------
// Fin de la partida
// ----------------------------------------------------------------------

function checkGameFinished() {
    if (!gameStarted || gameFinished || turnOrder.length === 0) return;
    const allDone = turnOrder.every(id => {
        const p = playersData[id];
        return p && p.scores && Object.values(p.scores).every(v => v !== null);
    });
    if (allDone) {
        gameFinished = true;
        showGameOverModal();
    }
}

// ----------------------------------------------------------------------
// Gestión de anfitrión (host)
// ----------------------------------------------------------------------

function refreshHostStatus() {
    isRoomCreator = (hostId !== null && hostId === myId);
    updateStartButton();
}

function hostIsPresent() {
    return hostId !== null && !!playersData[hostId];
}

function claimHost() {
    hostId = myId;
    isRoomCreator = true;
    broadcastSync();
    if (gameStarted) broadcastGameStateSync();
    updateHostWarning();
    renderLeaderboard();
    updateStartButton();
}