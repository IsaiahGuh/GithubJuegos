// ===== CONFIGURACION =====
var pointSystem = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78];
var rowsConfig = [
    { id: 'red', numbers: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { id: 'yellow', numbers: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { id: 'green', numbers: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2] },
    { id: 'blue', numbers: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2] }
];

var moveHistory = [];
var myTotalScore = 0;
var gameEnded = false;

// ===== REGISTRO DE JUGADAS (LOG ANTI-TRAMPAS, SIN DUPLICADOS) =====
var activityLog = [];
var seenLogIds = {};
var colorNames = { red: 'Rojo', yellow: 'Amarillo', green: 'Verde', blue: 'Azul' };
var LOG_MAX_ENTRIES = 300;

// ===== SNAPSHOT DE RONDA (para no registrar el vaiven de marcar/desmarcar) =====
// Una "ronda" va desde que le toca a alguien hasta que el turno avanza (incluye la
// ventana de robo de los demas). En vez de registrar cada click, guardamos como estaba
// moveHistory al empezar la ronda y, cuando esta termina de verdad (se finaliza el
// turno o acaba la partida), comparamos contra el moveHistory actual: solo lo que quedo
// marcado (la diferencia) se anota en el registro. Asi, si alguien marca y desmarca
// varias veces mientras decide, no queda ningun rastro de esa indecision.
var roundSnapshot = null;      // copia de moveHistory al iniciar la ronda para este jugador
var roundRole = null;          // 'mark' si esta ronda soy el jugador en turno, 'steal' si soy quien puede robar
var roundAutoPenaltyIds = [];  // moveIds de fallas automaticas ocurridas en esta ronda

function startRoundSnapshot() {
    roundSnapshot = moveHistory.slice();
    roundRole = isMyTurn() ? 'mark' : 'steal';
    roundAutoPenaltyIds = [];
}

function clearRoundSnapshot() {
    roundSnapshot = null;
    roundRole = null;
    roundAutoPenaltyIds = [];
}

// Compara el moveHistory actual contra el snapshot del inicio de la ronda y registra
// solo lo que realmente quedo marcado (nunca lo que se marco y luego se deshizo).
function commitRoundLog() {
    if (roundSnapshot === null) return;
    var added = [];
    for (var i = 0; i < moveHistory.length; i++) {
        if (roundSnapshot.indexOf(moveHistory[i]) === -1) added.push(moveHistory[i]);
    }
    for (var j = 0; j < added.length; j++) {
        var moveId = added[j];
        var sep = moveId.lastIndexOf('-');
        var color = moveId.substring(0, sep);
        var index = parseInt(moveId.substring(sep + 1));
        var isAuto = roundAutoPenaltyIds.indexOf(moveId) !== -1;
        var action = isAuto ? 'mark' : (roundRole === 'steal' ? 'steal' : 'mark');
        logMove(color, index, action, isAuto);
    }
    clearRoundSnapshot();
}

function logMove(color, index, action, auto) {
    var label;
    if (color === 'penalty') {
        label = auto ? 'Falla automatica (bloqueo 2 colores)' : 'Falla';
    } else if (index === 11) {
        label = 'Candado ' + colorNames[color];
    } else {
        var rc = null;
        for (var i = 0; i < rowsConfig.length; i++) {
            if (rowsConfig[i].id === color) { rc = rowsConfig[i]; break; }
        }
        var num = rc.numbers[index];
        label = num + ' ' + colorNames[color];
    }
    var entry = {
        logId: myId + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        id: myId, name: myName, label: label, action: action, color: color, ts: Date.now()
    };
    addLogEntry(entry, true);
}

// Agrega una entrada al log solo si no la habiamos visto antes (por logId), para que
// nunca aparezca duplicada aunque llegue dos veces (broadcast + reenvio de estado).
function addLogEntry(entry, shouldBroadcast) {
    if (!entry || !entry.logId || seenLogIds[entry.logId]) return;
    seenLogIds[entry.logId] = true;
    activityLog.push(entry);
    if (activityLog.length > LOG_MAX_ENTRIES) activityLog.splice(0, activityLog.length - LOG_MAX_ENTRIES);
    renderLog();
    if (shouldBroadcast) broadcastLogEntry(entry);
}

function renderLog() {
    var listEl = document.getElementById('logList');
    if (!listEl) return;
    var html = '';
    for (var i = 0; i < activityLog.length; i++) {
        var entry = activityLog[i];
        var time = new Date(entry.ts).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        var actionText = entry.action === 'steal' ? 'robo' : (entry.action === 'mark' ? 'marco' : 'desmarco');
        html = '<div class="log-entry ' + entry.action + '">' +
            '<span class="log-player">' + entry.name + '</span>' +
            '<span class="log-detail">' + actionText + ' ' + entry.label + '</span>' +
            '<span class="log-time">' + time + '</span>' +
            '</div>' + html; // mas recientes arriba
    }
    listEl.innerHTML = html || '';
}

function broadcastLogEntry(entry) {
    publishRoom({ action: 'log_entry', id: myId, entry: entry });
}

// ===== FUNCIONES DEL LOBBY =====
function entrarSala() {
    var nombre = localStorage.getItem('quixx_nombre_prefill');
    var sala = localStorage.getItem('quixx_sala_prefill');
    
    if (!nombre) {
        showNotice('No se ha configurado un nombre. Usa ?nombre=XXX en la URL.', 'Falta nombre');
        return;
    }
    
    if (!sala || sala.length !== 4) {
        showNotice('No se ha configurado una sala valida. Usa ?sala=XXXX en la URL.', 'Sala invalida');
        return;
    }
    
    myName = nombre;
    myId = Math.random().toString(36).substr(2, 9);
    moveHistory = [];
    isRoomCreator = false;
    hostId = null;
    pendingOrder = [];
    playerColors = {};
    
    localStorage.removeItem('quixx_nombre_prefill');
    localStorage.removeItem('quixx_sala_prefill');
    
    connectToRoom(sala.toUpperCase());
}

function joinSuccess(code) {
    hideLoading();
    document.getElementById('lobbyModal').style.display = 'none';
    sfxJoin();
    
    var info = document.getElementById('roomInfoDisplay');
    info.style.display = 'inline-block';
    info.textContent = 'SALA: ' + code;
    
    document.getElementById('leaderboardPanel').style.display = 'flex';
    document.getElementById('logPanel').style.display = 'flex';
    renderLeaderboard();
    renderLog();
    updateUI();
}

// ===== REINICIAR (solo anfitrion) =====
function showModal() {
    if (!isRoomCreator) return;
    document.getElementById('confirmTitle').textContent = 'Reiniciar partida para todos';
    document.getElementById('confirmText').textContent = 'Esto borrara los tableros de TODOS los jugadores en la sala y volvera a la sala de espera para reordenar turnos.';
    document.getElementById('confirmModal').style.display = 'flex';
}

function closeModal() { 
    document.getElementById('confirmModal').style.display = 'none'; 
}

function confirmReset() {
    if (!isRoomCreator) return;
    broadcastReset();
    applyReset();
    closeModal();
}

function applyReset() {
    moveHistory = [];
    gameStarted = false;
    turnOrder = [];
    currentTurnIndex = 0;
    activityLog = [];
    seenLogIds = {};
    gameEnded = false;
    stealWindowOpen = false;
    hasStolenThisTurn = false;
    clearPendingEvents();
    clearRoundSnapshot();
    cancelEndTurnReminder();
    closeRemovePlayerModal();
    var goModal = document.getElementById('gameOverModal');
    if (goModal) goModal.style.display = 'none';
    // Limpiar datos de jugadores (pero no los nombres ni los colores: se mantienen igual
    // que en Yatzy, para que cada jugador conserve su identidad visual entre partidas)
    for (var id in playersData) {
        playersData[id].moves = [];
        playersData[id].score = 0;
    }
    updatePendingOrder();
    updateVisuals();
    calculateScores();
    renderLeaderboard();
    renderLog();
    updateUI();
    saveSession();
    // Volvemos a mostrar los controles de orden/eliminar de la sala de espera con los
    // mismos colores que ya tenian los jugadores.
    if (isRoomCreator) hostSyncPregameOrder();
}

// ===== BLOQUEO GLOBAL DE FILA (CANDADO "C") =====
// Devuelve quien tiene el candado de un color (el primero que lo marco), o null si nadie lo hizo aun.
// Se deriva de moveHistory (propio) + playersData (de los demas, sincronizado por MQTT).
function getGlobalLockOwner(color) {
    if (moveHistory.indexOf(color + '-11') !== -1) return { id: myId, name: myName };
    for (var pid in playersData) {
        if (pid === myId) continue;
        var p = playersData[pid];
        if (p.moves && p.moves.indexOf(color + '-11') !== -1) return { id: pid, name: p.name };
    }
    return null;
}

// ===== MANEJO DE CLICKS EN CELDAS =====
function handleBoxClick(color, index) {
    if (gameEnded) return;

    var amITurnPlayer = isMyTurn();
    var moveId = color + '-' + index;
    var posInHistory = moveHistory.indexOf(moveId);
    // Es la jugada que deshace mi propia ultima accion (la que acabo de marcar en este
    // turno/robo). Esto se permite aunque ya haya marcado, para poder corregir antes de
    // finalizar el turno.
    var isUndoOfLastMove = posInHistory !== -1 && posInHistory === moveHistory.length - 1;

    if (amITurnPlayer) {
        // No se puede marcar una casilla NUEVA si ya se marcó algo en este turno.
        // Pero SI se puede deshacer esa misma jugada mientras siga siendo mi turno.
        if (turnLocked && !isUndoOfLastMove) {
            showNotice('Ya has marcado en este turno. Finaliza el turno o deshaz tu ultima accion.', 'Ya marcaste');
            return;
        }
    } else {
        // No es mi turno: solo puedo actuar si hay una ventana de robo abierta y aun
        // no he usado mi robo en esta ronda (como cuando los dados quedan en la mesa).
        if (!gameStarted || !stealWindowOpen) {
            showNotice('No es tu turno.', 'Espera tu turno');
            return;
        }
        if (hasStolenThisTurn && !isUndoOfLastMove) {
            showNotice('Ya tomaste tu jugada de robo en esta ronda. Espera al siguiente turno.', 'Ya robaste');
            return;
        }
    }

    var isLockBox = (index === 11);
    
    if (posInHistory !== -1) {
        // Si ya está marcado y es el último movimiento, se puede deshacer
        if (posInHistory >= moveHistory.length - 1) { 
            moveHistory.splice(posInHistory, 1);
            dequeueEventsForMove(moveId);
            sfxUndo();
            triggerShake(moveId);
            updateVisuals();
            calculateScores();
            broadcastSync();
            // Desbloquear la accion correspondiente para permitir otra jugada
            if (amITurnPlayer) {
                turnLocked = false;
                cancelEndTurnReminder();
                // Si deshace su jugada, se cierra la ventana de robo para todos los demas:
                // ya no hay nada que robar hasta que vuelva a marcar algo.
                if (stealWindowOpen) {
                    stealWindowOpen = false;
                    broadcastTurnMarked(false);
                }
            } else {
                hasStolenThisTurn = false;
            }
            updateUI();
        }
    } else {
        // El candado "C" solo lo puede marcar el primero que llega: si otro jugador ya lo
        // bloqueo, esta casilla queda cerrada para todos los demas (pero ellos si pueden
        // seguir marcando los numeros anteriores de esa fila con normalidad).
        if (isLockBox) {
            var owner = getGlobalLockOwner(color);
            if (owner && owner.id !== myId) {
                showNotice('Esa casilla C ya fue bloqueada por ' + owner.name + '.', 'Candado bloqueado');
                return;
            }
        }

        var max = -1;
        for (var i = 0; i < moveHistory.length; i++) {
            var m = moveHistory[i];
            if (m.startsWith(color + '-')) {
                var val = parseInt(m.split('-')[1]);
                if (val > max) max = val;
            }
        }
        if (index > max) {
            moveHistory.push(moveId);
            if (isLockBox) sfxCandado(); else sfxMark();
            triggerPop(moveId);

            // Si este jugador acaba de bloquear su 2do color, se le marca una falla automatica.
            if (isLockBox) {
                var myLockCount = 0;
                for (var j = 0; j < moveHistory.length; j++) {
                    if (moveHistory[j].indexOf('-11') === moveHistory[j].length - 3) myLockCount++;
                }
                queueEvent(moveId, myName + ' bloqueo el color ' + colorNames[color] + '!');
                if (myLockCount === 2) {
                    var penaltyMoveId = autoPenalty();
                    if (penaltyMoveId) queueEvent(penaltyMoveId, myName + ' recibio una falla automatica (2 candados)');
                }
            }

            updateVisuals();
            calculateScores();
            broadcastSync();

            if (amITurnPlayer) {
                // Bloquear turno (ya marcó) y abrir la ventana de robo para los demas.
                turnLocked = true;
                stealWindowOpen = true;
                scheduleEndTurnReminder();
                broadcastTurnMarked(true);
                showEventToast('Los demas pueden robar esta jugada');
            } else {
                // Use mi robo de esta ronda. Se anuncia recien cuando el jugador en turno
                // finalice el turno (o al recibir ese avance), no al instante, por si el
                // robo se deshace antes.
                hasStolenThisTurn = true;
                queueEvent(moveId, myName + ' robo la jugada');
            }
            updateUI();
        } else {
            showNotice('No puedes marcar un numero menor o igual al ultimo marcado en esa fila.', 'Movimiento invalido');
        }
    }
}

// Marca automaticamente la primera falla libre (bloquear 2 colores cuesta 1 falla).
// Devuelve el moveId usado ('penalty-N') o null si no habia ninguna falla libre.
function autoPenalty() {
    for (var i = 0; i < 4; i++) {
        if (moveHistory.indexOf('penalty-' + i) === -1) {
            moveHistory.push('penalty-' + i);
            roundAutoPenaltyIds.push('penalty-' + i);
            sfxFalla();
            triggerPop('penalty-' + i);
            return 'penalty-' + i;
        }
    }
    return null;
}

function handlePenaltyClick(index) {
    if (gameEnded) return;
    if (!isMyTurn()) {
        showNotice('No es tu turno.', 'Espera tu turno');
        return;
    }
    var moveId = 'penalty-' + index;
    var posInHistory = moveHistory.indexOf(moveId);
    var isUndoOfLastMove = posInHistory !== -1 && posInHistory === moveHistory.length - 1;

    if (turnLocked && !isUndoOfLastMove) {
        showNotice('Ya has marcado en este turno. Finaliza el turno o deshaz tu ultima accion.', 'Ya marcaste');
        return;
    }

    if (posInHistory !== -1) {
        if (posInHistory >= moveHistory.length - 1) {
            moveHistory.splice(posInHistory, 1);
            dequeueEventsForMove(moveId);
            sfxUndo();
            triggerShake(moveId);
            updateVisuals();
            calculateScores();
            broadcastSync();
            turnLocked = false;
            cancelEndTurnReminder();
            updateUI();
        }
    } else {
        moveHistory.push(moveId);
        sfxFalla();
        triggerPop(moveId);
        updateVisuals();
        calculateScores();
        broadcastSync();
        turnLocked = true;
        scheduleEndTurnReminder();
        updateUI();
    }
}

// ===== CALCULO DE PUNTAJES =====
function calculateScores() {
    var totalScore = 0;

    var colors = ['red', 'yellow', 'green', 'blue'];
    for (var c = 0; c < colors.length; c++) {
        var color = colors[c];
        var count = 0;
        for (var i = 0; i < moveHistory.length; i++) {
            if (moveHistory[i].startsWith(color + '-')) count++;
        }
        if (count > 12) count = 12;
        var pts = pointSystem[count];
        document.getElementById('score-' + color).textContent = pts;
        totalScore += pts;
    }
    
    var pCount = 0;
    for (var i = 0; i < moveHistory.length; i++) {
        if (moveHistory[i].startsWith('penalty-')) pCount++;
    }
    totalScore -= (pCount * 5);
    
    var totalEl = document.getElementById('score-total');
    totalEl.textContent = totalScore;
    bumpElement(totalEl);
    myTotalScore = totalScore;

    if (currentRoom) {
        playersData[myId] = { 
            name: myName, 
            color: playerColors[myId] || null,
            score: myTotalScore, 
            moves: moveHistory.slice()
        };
        renderLeaderboard();
        broadcastSync();
        saveSession();
        saveRegistryEntry(currentRoom, myName, myId, moveHistory);
    }
    checkGameEnd();
}

function showLoading(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingModal').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingModal').style.display = 'none';
}