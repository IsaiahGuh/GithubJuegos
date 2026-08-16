// ===== COLORES DE JUGADOR (asignacion "pegajosa", nunca duplicados) =====
var PLAYER_COLORS = [
    { id: 'rojo', hex: '#C7403F' },
    { id: 'azul', hex: '#4A6FA5' },
    { id: 'verde_oscuro', hex: '#265F56' },
    { id: 'amarillo', hex: '#D6A518' },
    { id: 'rosado', hex: '#E0729A' },
    { id: 'naranja', hex: '#D9822B' },
    { id: 'morado', hex: '#8B5FBF' },
    { id: 'celeste', hex: '#5BC0DE' },
    { id: 'lila', hex: '#B39DDB' },
    { id: 'verde_limon', hex: '#9CCC65' }
];

var playerColors = {};

function colorHexOf(colorId) {
    for (var i = 0; i < PLAYER_COLORS.length; i++) {
        if (PLAYER_COLORS[i].id === colorId) return PLAYER_COLORS[i].hex;
    }
    return '#808BC3';
}

// Reutiliza el color que cada jugador ya tenia (si sigue siendo valido y no esta tomado
// por otro jugador en el mismo calculo) y solo asigna colores nuevos a quien no tiene.
// Garantiza que 2 jugadores nunca compartan color y que el color de un jugador se
// mantenga igual entre la sala de espera, la partida y las reconexiones.
function computeStickyColors(order, existingColors) {
    existingColors = existingColors || {};
    var colors = {};
    var used = {};
    for (var i = 0; i < order.length; i++) {
        var id = order[i];
        var existing = existingColors[id];
        var isValid = false;
        for (var j = 0; j < PLAYER_COLORS.length; j++) {
            if (PLAYER_COLORS[j].id === existing) { isValid = true; break; }
        }
        if (existing && isValid && !used[existing]) {
            colors[id] = existing;
            used[existing] = true;
        }
    }
    for (var k = 0; k < order.length; k++) {
        var id2 = order[k];
        if (colors[id2]) continue;
        var free = null;
        for (var m = 0; m < PLAYER_COLORS.length; m++) {
            if (!used[PLAYER_COLORS[m].id]) { free = PLAYER_COLORS[m].id; break; }
        }
        var chosen = free || PLAYER_COLORS[k % PLAYER_COLORS.length].id;
        colors[id2] = chosen;
        used[chosen] = true;
    }
    return colors;
}

// ===== GESTION DE TURNOS Y SALA DE ESPERA =====

var turnOrder = [];
var currentTurnIndex = 0;
var gameStarted = false;
var isRoomCreator = false;
var hostId = null;
var turnLocked = false;  // indica si ya marcó en este turno
var pendingOrder = [];   // orden de jugadores en la sala de espera (antes de iniciar)

// ===== VENTANA DE ROBO =====
// Cuando el jugador en turno marca su casilla, se abre una ventana breve en la que
// los demas jugadores pueden "robar" esa jugada marcando 1 casilla en su propio
// tablero (como cuando los dados quedan en la mesa y cualquiera puede anotar el
// numero antes de que se relancen). El jugador en turno puede finalizar su turno en
// cualquier momento, hayan robado los demas o no.
var stealWindowOpen = false;   // true entre que el jugador en turno marca y termina su turno
var hasStolenThisTurn = false; // true si YO (no jugador en turno) ya use mi robo en esta ronda

// ===== FUNCIONES DE ESTADO =====

function isMyTurn() {
    return gameStarted && turnOrder.length > 0 && turnOrder[currentTurnIndex] === myId;
}

// ===== SALA DE ESPERA: orden y colores =====
// Mantiene el orden de llegada: los que ya estaban conservan su posicion, los nuevos
// se anaden al final. Los ocultos esperando resolucion de un reclamo de nombre
// duplicado todavia no entran al orden.
function updatePendingOrder() {
    var currentIds = Object.keys(playersData);
    var next = [];
    for (var i = 0; i < pendingOrder.length; i++) {
        if (currentIds.indexOf(pendingOrder[i]) !== -1) next.push(pendingOrder[i]);
    }
    for (var j = 0; j < currentIds.length; j++) {
        var id = currentIds[j];
        if (next.indexOf(id) === -1 && !(typeof hiddenJoiningIds !== 'undefined' && hiddenJoiningIds[id])) {
            next.push(id);
        }
    }
    pendingOrder = next;
    updateUI();
}

// Recalcula los colores (pegajosos, sin duplicados) para el orden actual de la sala de
// espera y lo transmite a todos, para que la vista previa sea igual en todos lados.
function hostSyncPregameOrder() {
    if (!isRoomCreator || gameStarted) return;
    playerColors = computeStickyColors(pendingOrder, playerColors);
    for (var id in playerColors) {
        if (playersData[id]) playersData[id].color = playerColors[id];
    }
    broadcastOrderUpdate();
    renderLeaderboard();
    updateUI();
}

function reorderPendingPlayer(id, direction) {
    if (!isRoomCreator || gameStarted) return;
    var idx = pendingOrder.indexOf(id);
    var swapIdx = idx + direction;
    if (idx === -1 || swapIdx < 0 || swapIdx >= pendingOrder.length) return;
    var tmp = pendingOrder[idx];
    pendingOrder[idx] = pendingOrder[swapIdx];
    pendingOrder[swapIdx] = tmp;
    hostSyncPregameOrder();
}
function movePlayerUp(id) { reorderPendingPlayer(id, -1); }
function movePlayerDown(id) { reorderPendingPlayer(id, 1); }

// Antes de iniciar: elimina al instante. Durante la partida: solo si esta desconectado,
// y pide confirmacion antes de sacarlo del orden de turnos.
function requestRemovePlayer(id) {
    if (!isRoomCreator || id === myId || !playersData[id]) return;
    if (!gameStarted) { hostRemovePlayer(id); return; }
    if (!playersData[id].offline) return;
    pendingRemoveId = id;
    var name = playersData[id].name || 'este jugador';
    var text = document.getElementById('removePlayerText');
    if (text) text.textContent = '"' + name + '" figura como desconectado. ¿Quieres sacarlo de la partida y del orden de turnos? Su puntaje ya anotado se mantiene en el registro.';
    var modal = document.getElementById('removePlayerModal');
    if (modal) modal.style.display = 'flex';
}

function hostRemovePlayer(id) {
    if (!isRoomCreator || gameStarted || id === myId) return;
    delete playersData[id];
    pendingOrder = pendingOrder.filter(function(pid) { return pid !== id; });
    delete playerColors[id];
    broadcastRemove(id);
    hostSyncPregameOrder();
    renderLeaderboard();
}

var pendingRemoveId = null;
function closeRemovePlayerModal() {
    pendingRemoveId = null;
    var modal = document.getElementById('removePlayerModal');
    if (modal) modal.style.display = 'none';
}
function confirmRemovePlayer() {
    var id = pendingRemoveId;
    closeRemovePlayerModal();
    if (id) hostRemovePlayerDuringGame(id);
}

function hostRemovePlayerDuringGame(id) {
    if (!isRoomCreator || !gameStarted || id === myId || !playersData[id] || !playersData[id].offline) return;

    var removedIdx = turnOrder.indexOf(id);
    var newTurnOrder = turnOrder.filter(function(pid) { return pid !== id; });
    var newIndex = currentTurnIndex;
    if (removedIdx !== -1) {
        if (newTurnOrder.length === 0) {
            newIndex = 0;
        } else {
            if (removedIdx < currentTurnIndex) newIndex -= 1;
            if (newIndex >= newTurnOrder.length) newIndex = 0;
        }
    }
    applyIngameRemoval(id, newTurnOrder, newIndex);
    broadcastIngameRemoval(id, newTurnOrder, newIndex);
}

// Aplica la eliminacion localmente. La usan tanto el anfitrion (que la origina) como el
// resto de clientes (via el mensaje 'ingame_remove'), para que el estado quede identico.
function applyIngameRemoval(id, newTurnOrder, newIndex) {
    delete playersData[id];
    pendingOrder = pendingOrder.filter(function(pid) { return pid !== id; });
    delete playerColors[id];
    turnOrder = Array.isArray(newTurnOrder) ? newTurnOrder : turnOrder.filter(function(pid) { return pid !== id; });
    currentTurnIndex = newIndex || 0;
    afterTurnBecameMine();
    updateVisuals();
    calculateScores();
    renderLeaderboard();
    updateUI();
    checkGameEnd();
    saveSession();
}

function broadcastIngameRemoval(id, newTurnOrder, newIndex) {
    publishRoom({ action: 'ingame_remove', id: id, turnOrder: newTurnOrder, nextIndex: newIndex });
}

// ===== INICIAR PARTIDA (solo anfitrion) =====
function startGame() {
    if (!isRoomCreator || gameStarted || pendingOrder.length === 0) return;
    turnOrder = pendingOrder.slice();
    // Los colores ya se fueron mostrando en la sala de espera; solo nos aseguramos de
    // que todos tengan uno, sin reasignar los que ya tenian.
    playerColors = computeStickyColors(turnOrder, playerColors);
    for (var id in playerColors) {
        if (playersData[id]) playersData[id].color = playerColors[id];
    }
    currentTurnIndex = 0;
    gameStarted = true;
    turnLocked = false;
    stealWindowOpen = false;
    hasStolenThisTurn = false;
    startRoundSnapshot();
    broadcastGameStart();
    afterTurnBecameMine();
    renderLeaderboard();
    updateUI();
    saveSession();
}

function afterTurnBecameMine() {
    // Se llama cuando el turno pasa a ser nuestro (o al iniciar)
    cancelEndTurnReminder();
    if (isMyTurn()) {
        turnLocked = false;
    }
    updateUI();
}

// ===== RECORDATORIO DE FINALIZAR TURNO (igual que Yatzy) =====
// Si ya marcamos (turnLocked) pero no presionamos "Finalizar turno", lo recordamos con
// un aviso y sonido, repitiendo si se sigue ignorando.
var END_TURN_REMINDER_FIRST_DELAY = 10000;  // ms antes del primer aviso
var END_TURN_REMINDER_REPEAT_DELAY = 20000; // ms entre avisos si se sigue ignorando
var endTurnReminderTimer = null;

function scheduleEndTurnReminder(delay) {
    if (delay === undefined) delay = END_TURN_REMINDER_FIRST_DELAY;
    clearTimeout(endTurnReminderTimer);
    endTurnReminderTimer = setTimeout(function() {
        if (turnLocked && isMyTurn()) showEndTurnReminder();
    }, delay);
}
function cancelEndTurnReminder() {
    clearTimeout(endTurnReminderTimer);
    endTurnReminderTimer = null;
    var modal = document.getElementById('endTurnReminderModal');
    if (modal) modal.style.display = 'none';
}
function showEndTurnReminder() {
    var modal = document.getElementById('endTurnReminderModal');
    if (!modal) return;
    modal.style.display = 'flex';
    sfxReminder();
    // Si lo sigue ignorando, se lo volvemos a recordar mas adelante.
    scheduleEndTurnReminder(END_TURN_REMINDER_REPEAT_DELAY);
}
function closeEndTurnReminder() {
    var modal = document.getElementById('endTurnReminderModal');
    if (modal) modal.style.display = 'none';
}
function endTurnFromReminder() {
    cancelEndTurnReminder();
    endTurn();
}

// ===== FINALIZAR TURNO =====
function endTurn() {
    if (!isMyTurn() || !turnLocked) return;
    sfxTurnEnd();
    var nextIndex = (currentTurnIndex + 1) % turnOrder.length;
    broadcastTurnAdvance(nextIndex);
    applyTurnAdvance(nextIndex);
}

function applyTurnAdvance(nextIndex) {
    // El turno recien se cierra de verdad aca: es el momento seguro de anunciar los
    // eventos que se habian encolado (candado, falla automatica, robo) porque ya nadie
    // puede deshacerlos (la ventana de robo se cierra para todos en este mismo instante).
    flushPendingEvents();
    // Registrar en el log solo lo que quedo realmente marcado en la ronda que acaba de
    // cerrarse (ignora cualquier marcar/desmarcar intermedio mientras alguien decidia).
    commitRoundLog();
    currentTurnIndex = nextIndex;
    turnLocked = false;
    stealWindowOpen = false;
    hasStolenThisTurn = false;
    afterTurnBecameMine();
    // Empieza una nueva ronda para el registro de jugadas (con el turno ya actualizado,
    // asi cada jugador sabe si en esta ronda le toca jugar o solo puede robar).
    startRoundSnapshot();
    renderLeaderboard();
    updateUI();
    if (isMyTurn()) {
        showEventToast('¡Es tu turno!');
    }
}

// ===== BROADCASTS MQTT =====

function broadcastGameStart() {
    publishRoom({ action: 'game_start', id: myId, turnOrder: turnOrder, colors: playerColors, hostId: hostId });
}

function broadcastGameStateSync() {
    publishRoom({ action: 'game_state_sync', id: myId, turnOrder: turnOrder, colors: playerColors, currentTurnIndex: currentTurnIndex, hostId: hostId });
}

function broadcastTurnAdvance(nextIndex) {
    publishRoom({ action: 'turn_advance', id: myId, nextIndex: nextIndex });
}

// Avisa a los demas que se abrio la ventana de robo (el jugador en turno acaba de marcar).
function broadcastTurnMarked(open) {
    publishRoom({ action: 'turn_marked', id: myId, open: !!open });
}

function broadcastReset() {
    publishRoom({ action: 'reset_all', id: myId });
}

function broadcastSync(action) {
    publishRoom({
        action: action || 'sync',
        id: myId,
        name: myName,
        color: playerColors[myId] || null,
        score: myTotalScore,
        moves: moveHistory.slice(),
        hostId: hostId
    });
}

function broadcastOrderUpdate() {
    publishRoom({ action: 'order_update', id: myId, order: pendingOrder, colors: playerColors, hostId: hostId });
}

// ===== RECLAMO DE ANFITRION (con margen aleatorio para evitar choques) =====

function claimHost() {
    var claimJitter = 200 + Math.random() * 700;
    setTimeout(function() {
        // Si alguien mas ya se convirtio en anfitrion (o el original volvio), no pisamos ese reclamo.
        if (hostId && hostId !== myId && hostIsPresent()) return;
        hostId = myId;
        isRoomCreator = true;
        broadcastSync();
        if (gameStarted) {
            broadcastGameStateSync();
        } else {
            hostSyncPregameOrder();
        }
        renderLeaderboard();
        updateUI();
    }, claimJitter);
}

function hostIsPresent() {
    return hostId !== null && !!playersData[hostId] && !playersData[hostId].offline;
}

function refreshHostStatus() {
    isRoomCreator = (hostId !== null && hostId === myId);
    updateUI();
}

// ===== FIN DE PARTIDA =====
// La partida termina cuando: (a) alguien llega a 4 fallas (pierde), o (b) los 4 colores
// quedan bloqueados (por cualquier jugador, entre todos).
function checkGameEnd() {
    if (gameEnded) return;

    var allPlayers = {};
    for (var pid in playersData) allPlayers[pid] = playersData[pid];
    allPlayers[myId] = { name: myName, score: myTotalScore, moves: moveHistory.slice(), color: playerColors[myId] };

    var loser = null;
    for (var id in allPlayers) {
        var p = allPlayers[id];
        var pCount = 0;
        var pMoves = p.moves || [];
        for (var i = 0; i < pMoves.length; i++) {
            if (pMoves[i].indexOf('penalty-') === 0) pCount++;
        }
        if (pCount >= 4) { loser = p; break; }
    }

    var colors = ['red', 'yellow', 'green', 'blue'];
    var allLocked = true;
    for (var c = 0; c < colors.length; c++) {
        var color = colors[c];
        var lockedByAny = false;
        for (var pid2 in allPlayers) {
            var moves2 = allPlayers[pid2].moves || [];
            if (moves2.indexOf(color + '-11') !== -1) { lockedByAny = true; break; }
        }
        if (!lockedByAny) { allLocked = false; break; }
    }

    if (loser || allLocked) {
        gameEnded = true;
        // La partida puede terminar sin que el turno llegue a avanzar (p.ej. la misma
        // jugada que bloquea el ultimo color o llega a 4 fallas). Igual anunciamos
        // cualquier evento que hubiera quedado pendiente de esa jugada final, y
        // registramos en el log la jugada final de esta ronda.
        flushPendingEvents();
        commitRoundLog();
        showGameOver(loser, allPlayers);
    }
}

function showGameOver(loser, allPlayers) {
    var reasonEl = document.getElementById('gameOverReason');
    var standingsEl = document.getElementById('gameOverStandings');
    if (reasonEl) {
        reasonEl.textContent = loser
            ? (loser.name + ' llego a 4 fallas y pierde la partida.')
            : 'Se completaron los 4 colores. Partida terminada.';
    }
    if (standingsEl) {
        var ranked = [];
        for (var id in allPlayers) ranked.push(allPlayers[id]);
        ranked.sort(function(a, b) { return b.score - a.score; });
        var html = '';
        for (var i = 0; i < ranked.length; i++) {
            var p = ranked[i];
            var isLoser = loser && p.name === loser.name;
            var isWinner = i === 0 && !isLoser;
            var hex = colorHexOf(p.color);
            html += '<div class="standing-row' + (isLoser ? ' is-loser' : '') + (isWinner ? ' winner' : '') +
                '" style="border-left:4px solid ' + hex + '; animation-delay:' + (i * 0.1) + 's;">' +
                '<span>' + (i + 1) + '. ' + p.name + (isLoser ? ' (perdio)' : '') + '</span>' +
                '<span>' + p.score + ' pts</span>' +
                '</div>';
        }
        standingsEl.innerHTML = html;
    }
    var modal = document.getElementById('gameOverModal');
    if (modal) modal.style.display = 'flex';
    var amILoser = !!(loser && loser.name === myName);
    if (amILoser) sfxLose(); else sfxWin();
    var resetBtn = document.getElementById('gameOverResetBtn');
    if (resetBtn) resetBtn.style.display = isRoomCreator ? 'block' : 'none';
    updateVisuals();
    updateUI();
}

function closeGameOverAndReset() {
    var modal = document.getElementById('gameOverModal');
    if (modal) modal.style.display = 'none';
    if (isRoomCreator && currentRoom) {
        broadcastReset();
        applyReset();
    } else if (currentRoom) {
        // Un jugador no-anfitrion solo puede cerrar el modal; espera a que el anfitrion reinicie.
        showNotice('Solo el anfitrion puede reiniciar la partida.', 'Sin permisos');
    }
}