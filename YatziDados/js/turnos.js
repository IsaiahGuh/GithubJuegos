// ===== GESTIÓN DE TURNOS Y ESTADO DE LA PARTIDA =====
// Este archivo agrupa toda la lógica relacionada con turnos, orden de jugadores,
// inicio de partida, reinicio y sincronización.

// Variables globales de turnos (se comparten con el resto de la aplicación)
let turnOrder = [];
let playerColors = {};
let currentTurnIndex = 0;
let gameStarted = false;
let gameFinished = false;
let pendingOrder = [];

// Variables de anfitrión (también utilizadas en mqtt.js)
let isRoomCreator = false;
let hostId = null;

// ----------------------------------------------------------------------
// Funciones de estado de turnos
// ----------------------------------------------------------------------

/** Indica si el jugador actual es el que tiene el turno */
function isMyTurn() {
    return gameStarted && turnOrder.length > 0 && turnOrder[currentTurnIndex] === myId;
}

/** Prepara el estado del jugador para su turno (reinicia dados, marca, etc.) */
function afterTurnBecameMine() {
    if (isMyTurn()) {
        myDice = [null, null, null, null, null];
        markedThisTurn = false;
        jokerModeActive = false;
        lastMarkedCatId = null;
        lastMarkedWasJoker = false;
    }
}

/** Finaliza el turno actual y pasa al siguiente */
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

/** Aplica el avance de turno en el cliente (sin broadcast) */
function applyTurnAdvance(nextIndex) {
    currentTurnIndex = nextIndex;
    afterTurnBecameMine();
    renderTurnBanner();
    renderDice();
    renderScores();
    renderLeaderboard();
}

/** Emite por MQTT el avance de turno */
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

/** Inicia la partida (solo el anfitrión) */
function startGame() {
    if (!isRoomCreator || pendingOrder.length === 0) return;
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
    renderPreGame();
    renderTurnBanner();
    renderDice();
    renderScores();
    renderLeaderboard();
    saveState();
}

/** Emite el inicio de partida a todos los jugadores */
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

/** Emite una sincronización completa del estado del juego (para reconexiones) */
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
// Orden de jugadores en la sala (pre‑game)
// ----------------------------------------------------------------------

/** Mueve un jugador en el orden de la sala (solo anfitrión) */
function moveOrder(idx, dir) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= pendingOrder.length) return;
    [pendingOrder[idx], pendingOrder[newIdx]] = [pendingOrder[newIdx], pendingOrder[idx]];
    renderPreGame();
}

// ----------------------------------------------------------------------
// Reinicio de la partida
// ----------------------------------------------------------------------

/** Solicita reiniciar la partida (solo anfitrión) – abre el modal de confirmación */
function requestGameReset() {
    if (!isRoomCreator) return;
    document.getElementById('resetGameModal').style.display = 'flex';
}

/** Confirma el reinicio después del modal */
function confirmGameReset() {
    closeResetGameModal();
    broadcastGameReset();
    applyGameReset();
}

/** Aplica el reinicio en el cliente */
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
    renderPreGame();
    renderTurnBanner();
    renderDice();
    renderScores();
    renderLeaderboard();
    saveState();
}

/** Emite el reinicio a todos los jugadores */
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

/** Verifica si todos los jugadores han completado su cartilla y lanza el modal de fin */
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

/** Actualiza el estado de anfitrión según el hostId actual */
function refreshHostStatus() {
    isRoomCreator = (hostId !== null && hostId === myId);
}

/** Indica si el anfitrión está presente en la sala */
function hostIsPresent() {
    return hostId !== null && !!playersData[hostId];
}

/** Reclama el rol de anfitrión (cuando el anterior se desconectó) */
function claimHost() {
    hostId = myId;
    isRoomCreator = true;
    broadcastSync();
    if (gameStarted) broadcastGameStateSync();
    updateHostWarning();
    renderPreGame();
    renderTurnBanner();
    renderLeaderboard();
}