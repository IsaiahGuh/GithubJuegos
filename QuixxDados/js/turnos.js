// ===== GESTION DE TURNOS =====

var turnOrder = [];
var currentTurnIndex = 0;
var gameStarted = false;
var isRoomCreator = false;
var hostId = null;
var turnLocked = false;  // indica si ya marcó en este turno (como markedThisTurn en Yatzy)

// ===== FUNCIONES DE ESTADO =====

function isMyTurn() {
    return gameStarted && turnOrder.length > 0 && turnOrder[currentTurnIndex] === myId;
}

// ===== INICIAR PARTIDA (solo anfitrion) =====
function startGame() {
    if (!isRoomCreator || gameStarted) return;
    // Orden de turnos: el orden actual de jugadores (sin mínimo)
    var ids = Object.keys(playersData);
    if (ids.length === 0) return;
    turnOrder = ids;
    currentTurnIndex = 0;
    gameStarted = true;
    turnLocked = false;
    broadcastGameStart();
    afterTurnBecameMine();
    updateUI();
    saveSession();
}

function afterTurnBecameMine() {
    // Se llama cuando el turno pasa a ser nuestro (o al iniciar)
    if (isMyTurn()) {
        turnLocked = false;
    }
    updateUI();
}

// ===== FINALIZAR TURNO =====
function endTurn() {
    if (!isMyTurn() || !turnLocked) return;
    // Avanzar al siguiente
    var nextIndex = (currentTurnIndex + 1) % turnOrder.length;
    broadcastTurnAdvance(nextIndex);
    applyTurnAdvance(nextIndex);
}

function applyTurnAdvance(nextIndex) {
    currentTurnIndex = nextIndex;
    turnLocked = false;
    afterTurnBecameMine();
    updateUI();
}

// ===== BROADCASTS MQTT =====

function broadcastGameStart() {
    if (mqttClient && currentRoom) {
        mqttClient.publish('quixx_app_xyz/room/' + currentRoom, JSON.stringify({
            action: 'game_start',
            id: myId,
            turnOrder: turnOrder,
            hostId: hostId
        }));
    }
}

function broadcastTurnAdvance(nextIndex) {
    if (mqttClient && currentRoom) {
        mqttClient.publish('quixx_app_xyz/room/' + currentRoom, JSON.stringify({
            action: 'turn_advance',
            id: myId,
            nextIndex: nextIndex
        }));
    }
}

function broadcastReset() {
    if (mqttClient && currentRoom) {
        mqttClient.publish('quixx_app_xyz/room/' + currentRoom, JSON.stringify({
            action: 'reset_all',
            id: myId
        }));
    }
}

function broadcastSync() {
    if (mqttClient && currentRoom) {
        mqttClient.publish('quixx_app_xyz/room/' + currentRoom, JSON.stringify({
            action: 'sync',
            id: myId,
            name: myName,
            score: myTotalScore,
            moves: moveHistory.slice(),
            hostId: hostId
        }));
    }
}

// ===== RECLAMO DE ANFITRION =====

function claimHost() {
    hostId = myId;
    isRoomCreator = true;
    broadcastSync();
    if (gameStarted) {
        // Reenviar estado de partida
        broadcastGameStart();
        broadcastTurnAdvance(currentTurnIndex);
    }
    updateUI();
}

function hostIsPresent() {
    return hostId !== null && !!playersData[hostId];
}

function refreshHostStatus() {
    isRoomCreator = (hostId !== null && hostId === myId);
    updateUI();
}