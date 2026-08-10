// ===== PERSISTENCIA DE SESION (RECONEXION) =====
var SESSION_KEY = 'quixx_session_v1';
var REGISTRY_KEY = 'quixx_players_v1';

// ===== DETECCIÓN DE PARÁMETROS URL =====
(function detectarYGuardarParamsURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const nombre = urlParams.get('nombre');
    const sala = urlParams.get('sala');
    
    console.log('📥 QuixxDados - Parámetros URL:', { nombre, sala });
    
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
        alert('No hay sesion guardada para reconectar.');
        return;
    }

    // Cerrar el modal de lobby
    document.getElementById('lobbyModal').style.display = 'none';
    
    // Restaurar datos de sesion
    myId = session.myId;
    myName = session.myName;
    moveHistory = session.moveHistory || [];
    updateVisuals();
    calculateScores();

    // Conectar a la sala
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