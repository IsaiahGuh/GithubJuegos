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

// ===== FUNCIONES DEL LOBBY =====
function entrarSala() {
    var nombre = localStorage.getItem('quixx_nombre_prefill');
    var sala = localStorage.getItem('quixx_sala_prefill');
    
    if (!nombre) {
        alert('No se ha configurado un nombre. Usa ?nombre=XXX en la URL.');
        return;
    }
    
    if (!sala || sala.length !== 4) {
        alert('No se ha configurado una sala valida. Usa ?sala=XXXX en la URL.');
        return;
    }
    
    myName = nombre;
    myId = Math.random().toString(36).substr(2, 9);
    moveHistory = [];
    
    localStorage.removeItem('quixx_nombre_prefill');
    localStorage.removeItem('quixx_sala_prefill');
    
    connectToRoom(sala.toUpperCase());
}

function joinSuccess(code) {
    hideLoading();
    document.getElementById('lobbyModal').style.display = 'none';
    
    var info = document.getElementById('roomInfoDisplay');
    info.style.display = 'inline-block';
    info.textContent = 'SALA: ' + code;
    
    document.getElementById('leaderboardPanel').style.display = 'flex';
    renderLeaderboard();
    // Mostrar controles de turno (los botones ya están visibles, se actualizan con updateUI)
    updateUI();
}

// ===== REINICIAR (solo anfitrion) =====
function showModal() {
    if (!isRoomCreator) return;
    document.getElementById('confirmTitle').textContent = 'Reiniciar partida para todos';
    document.getElementById('confirmText').textContent = 'Esto borrara los tableros de TODOS los jugadores en la sala.';
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
    // Limpiar datos de jugadores (pero no los nombres)
    for (var id in playersData) {
        playersData[id].moves = [];
        playersData[id].score = 0;
    }
    updateVisuals();
    calculateScores();
    renderLeaderboard();
    updateUI();
    saveSession();
}

// ===== MANEJO DE CLICKS EN CELDAS =====
function handleBoxClick(color, index) {
    // Solo se permite marcar si es tu turno y la partida ha empezado
    if (!isMyTurn()) {
        alert('No es tu turno.');
        return;
    }
    // No se puede marcar si ya se marcó algo en este turno (como en Yatzy, una acción por turno)
    if (turnLocked) {
        alert('Ya has marcado en este turno. Finaliza el turno o deshaz tu ultima accion.');
        return;
    }

    var moveId = color + '-' + index;
    var posInHistory = moveHistory.indexOf(moveId);
    
    if (posInHistory !== -1) {
        // Si ya está marcado y es el último movimiento, se puede deshacer (opcional)
        if (posInHistory >= moveHistory.length - 1) { 
            moveHistory.splice(posInHistory, 1);
            updateVisuals();
            calculateScores();
            broadcastSync();
            // Desbloquear turno para permitir otra acción (como en Yatzy, deshacer)
            turnLocked = false;
            updateUI();
        }
    } else {
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
            updateVisuals();
            calculateScores();
            broadcastSync();
            // Bloquear turno (ya marcó)
            turnLocked = true;
            updateUI();
        } else {
            alert('No puedes marcar un numero menor o igual al ultimo marcado en esa fila.');
        }
    }
}

function handlePenaltyClick(index) {
    if (!isMyTurn()) {
        alert('No es tu turno.');
        return;
    }
    if (turnLocked) {
        alert('Ya has marcado en este turno.');
        return;
    }
    var moveId = 'penalty-' + index;
    var posInHistory = moveHistory.indexOf(moveId);
    if (posInHistory !== -1) {
        if (posInHistory >= moveHistory.length - 1) {
            moveHistory.splice(posInHistory, 1);
            updateVisuals();
            calculateScores();
            broadcastSync();
            turnLocked = false;
            updateUI();
        }
    } else {
        moveHistory.push(moveId);
        updateVisuals();
        calculateScores();
        broadcastSync();
        turnLocked = true;
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
    
    document.getElementById('score-total').textContent = totalScore;
    myTotalScore = totalScore;

    if (currentRoom) {
        playersData[myId] = { 
            name: myName, 
            score: myTotalScore, 
            moves: moveHistory.slice()
        };
        renderLeaderboard();
        broadcastSync();
        saveSession();
        saveRegistryEntry(currentRoom, myName, myId, moveHistory);
    }
    // Podríamos verificar fin de partida aquí, pero lo dejamos opcional
}

function showLoading(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingModal').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingModal').style.display = 'none';
}