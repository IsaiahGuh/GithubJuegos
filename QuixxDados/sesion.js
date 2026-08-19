// ===== PERSISTENCIA DE SESION (RECONEXION) =====
var SESSION_KEY = 'quixx_session_v1';
var REGISTRY_KEY = 'quixx_players_v1';

// ===== DETECCIÓN DE PARÁMETROS URL =====
(function detectarYGuardarParamsURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const nombre = urlParams.get('nombre');
    const sala = urlParams.get('sala');
    
    console.log('Quixx - Parametros URL:', { nombre, sala });
    
    if (nombre) {
        localStorage.setItem('quixx_nombre_prefill', nombre);
    }
    if (sala && sala.length >= 4) {
        localStorage.setItem('quixx_sala_prefill', sala.toUpperCase());
    }
})();

function getPrefilledName() {
    const name = localStorage.getItem('quixx_nombre_prefill');
    if (name) {
        localStorage.removeItem('quixx_nombre_prefill');
        return name;
    }
    return null;
}

function getPrefilledRoom() {
    const room = localStorage.getItem('quixx_sala_prefill');
    if (room && room.length === 4) {
        localStorage.removeItem('quixx_sala_prefill');
        return room;
    }
    return null;
}

function saveSession() {
    if (!currentRoom) return;
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            roomCode: currentRoom,
            myId: myId,
            myName: myName,
            moveHistory: moveHistory,
            gameStarted: gameStarted,
            turnOrder: turnOrder,
            currentTurnIndex: currentTurnIndex,
            hostId: hostId,
            color: playerColors[myId] || null,
            updatedAt: Date.now()
        }));
    } catch (e) { 
        console.error('No se pudo guardar la sesion', e); 
    }
}

function loadSession() {
    try {
        var raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) { 
        return null; 
    }
}

function clearSession() {
    try { 
        localStorage.removeItem(SESSION_KEY); 
    } catch (e) {}
}

function registryKey(room, name) { 
    return room + '::' + name; 
}

function loadRegistry() {
    try {
        var raw = localStorage.getItem(REGISTRY_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) { 
        return {}; 
    }
}

function saveRegistryEntry(room, name, id, moves) {
    try {
        var registry = loadRegistry();
        registry[registryKey(room, name)] = { id: id, moves: moves, updatedAt: Date.now() };
        localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    } catch (e) { 
        console.error('No se pudo guardar el registro de jugador', e); 
    }
}

function getRegistryEntry(room, name) {
    var registry = loadRegistry();
    return registry[registryKey(room, name)] || null;
}

function reconnectToSession() {
    var session = loadSession();
    if (!session) {
        showNotice('No hay sesion guardada para reconectar.', 'Sin sesion');
        return;
    }

    document.getElementById('lobbyModal').style.display = 'none';
    
    myId = session.myId;
    myName = session.myName;
    moveHistory = session.moveHistory || [];
    gameStarted = session.gameStarted || false;
    turnOrder = session.turnOrder || [];
    currentTurnIndex = session.currentTurnIndex || 0;
    hostId = session.hostId || null;
    // Antes esto se forzaba siempre a "false", por lo que un anfitrion que se reconectaba
    // perdia sus botones de Iniciar/Reiniciar aunque siguiera siendo el anfitrion real.
    // Lo derivamos del hostId guardado; si en la sala ya asumio otro anfitrion mientras
    // estabamos fuera, lo corregimos en cuanto llegue un game_state_sync/order_update.
    refreshHostStatus();
    pendingOrder = [];
    playerColors = {};
    if (session.color) playerColors[myId] = session.color;
    turnLocked = false;
    clearPendingEvents();
    startRoundSnapshot();
    
    updateVisuals();
    calculateScores();

    connectToRoom(session.roomCode, true);
}

function dismissSession() {
    clearSession();
    var banner = document.getElementById('sessionBanner');
    if (banner) banner.style.display = 'none';
    
    var reconnectBtn = document.getElementById('reconnectBtn');
    if (reconnectBtn) {
        reconnectBtn.disabled = true;
        reconnectBtn.style.opacity = '0.5';
        reconnectBtn.style.cursor = 'not-allowed';
    }
}