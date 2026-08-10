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
function showJoinModal() {
    document.getElementById('lobbyModal').style.display = 'none';
    document.getElementById('joinModal').style.display = 'flex';
    
    var roomInput = document.getElementById('roomCodeInput');
    if (roomInput) {
        roomInput.value = '';
        roomInput.readOnly = false;
        roomInput.style.opacity = '1';
        roomInput.style.color = 'white';
    }
}

function backToLobby() {
    document.getElementById('joinModal').style.display = 'none';
    document.getElementById('lobbyModal').style.display = 'flex';
}

function getPlayerName() {
    var name = document.getElementById('playerName').value.trim();
    return name || 'Jugador ' + Math.floor(Math.random() * 100);
}

function createRoom() {
    myName = getPlayerName();
    myId = Math.random().toString(36).substr(2, 9);
    moveHistory = [];
    
    // Usar sala preconfigurada si existe
    var prefillSala = getPrefilledRoom(); // <-- NUEVO
    var code;
    
    if (prefillSala) {
        code = prefillSala;
        console.log('🏠 Usando sala desde URL:', code);
    } else {
        code = Math.random().toString(36).substring(2, 6).toUpperCase();
        console.log('🏠 Nueva sala generada:', code);
    }
    
    connectToRoom(code);
}

function joinRoom() {
    myName = getPlayerName();
    
    // Usar sala preconfigurada si existe, sino usar input
    var prefillSala = getPrefilledRoom(); // <-- NUEVO
    var code;
    
    if (prefillSala) {
        code = prefillSala;
        console.log('📥 Uniéndose a sala desde URL:', code);
    } else {
        code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    }
    
    if (code.length !== 4) {
        alert('El código debe tener 4 letras/números.');
        return;
    }

    var known = getRegistryEntry(code, myName);
    if (known) {
        myId = known.id;
        moveHistory = known.moves || [];
        updateVisuals();
        calculateScores();
        connectToRoom(code, true);
        return;
    }

    myId = Math.random().toString(36).substr(2, 9);
    moveHistory = [];
    connectToRoom(code);
}

function joinSuccess(code) {
    hideLoading();
    document.getElementById('lobbyModal').style.display = 'none';
    document.getElementById('joinModal').style.display = 'none';
    
    var info = document.getElementById('roomInfoDisplay');
    info.style.display = 'inline-block';
    info.textContent = 'SALA: ' + code;
    
    document.getElementById('leaderboardPanel').style.display = 'flex';
    renderLeaderboard();

    var resetBtn = document.getElementById('resetBtn');
    if (resetBtn) resetBtn.textContent = 'Reiniciar Partida (Todos)';
}

// ===== REINICIAR =====
function showModal() {
    var title = document.getElementById('confirmTitle');
    var text = document.getElementById('confirmText');
    if (currentRoom) {
        title.textContent = 'Reiniciar partida para todos';
        text.textContent = 'Esto borrara los tableros de TODOS los jugadores en la sala, no solo el tuyo.';
    } else {
        title.textContent = 'Reiniciar tablero';
        text.textContent = 'Se borraran tus marcas actuales.';
    }
    document.getElementById('confirmModal').style.display = 'flex';
}

function closeModal() { 
    document.getElementById('confirmModal').style.display = 'none'; 
}

function confirmReset() {
    if (currentRoom) {
        broadcastReset();
    }
    moveHistory = [];
    updateVisuals();
    calculateScores();
    closeModal();
}

// ===== MANEJO DE CLICKS =====
function handleBoxClick(color, index) {
    var moveId = color + '-' + index;
    var posInHistory = moveHistory.indexOf(moveId);
    
    if (posInHistory !== -1) {
        if (posInHistory >= moveHistory.length - 1) { 
            moveHistory.splice(posInHistory, 1);
            updateVisuals();
            calculateScores();
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
        }
    }
}

function handlePenaltyClick(index) {
    var moveId = 'penalty-' + index;
    var posInHistory = moveHistory.indexOf(moveId);
    if (posInHistory !== -1) {
        if (posInHistory >= moveHistory.length - 1) {
            moveHistory.splice(posInHistory, 1);
            updateVisuals();
            calculateScores();
        }
    } else {
        moveHistory.push(moveId);
        updateVisuals();
        calculateScores();
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
        broadcastScore('sync');
        saveSession();
        saveRegistryEntry(currentRoom, myName, myId, moveHistory);
    }
}

function showLoading(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingModal').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingModal').style.display = 'none';
}