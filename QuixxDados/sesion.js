// ===== PERSISTENCIA DE SESION (RECONEXION) =====
const SESSION_KEY = 'quixx_session_v1';
const REGISTRY_KEY = 'quixx_players_v1';

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
        const raw = localStorage.getItem(SESSION_KEY);
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
        const raw = localStorage.getItem(REGISTRY_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) { 
        return {}; 
    }
}

function saveRegistryEntry(room, name, id, moves) {
    try {
        const registry = loadRegistry();
        registry[registryKey(room, name)] = { id: id, moves: moves, updatedAt: Date.now() };
        localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    } catch (e) { 
        console.error('No se pudo guardar el registro de jugador', e); 
    }
}

function getRegistryEntry(room, name) {
    const registry = loadRegistry();
    return registry[registryKey(room, name)] || null;
}

function reconnectToSession() {
    const session = loadSession();
    if (!session) return;

    myId = session.myId;
    myName = session.myName;
    moveHistory = session.moveHistory || [];
    updateVisuals();
    calculateScores();

    connectToRoom(session.roomCode, true);
}

function dismissSession() {
    clearSession();
    const banner = document.getElementById('sessionBanner');
    if (banner) banner.style.display = 'none';
}