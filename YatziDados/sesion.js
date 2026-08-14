// ===== PERSISTENCIA (RECONEXION MISMO DISPOSITIVO) =====
const SESSION_KEY = 'yatzy_session_v1';
const REGISTRY_KEY = 'yatzy_players_v1';

// ===== DETECCION DE PARAMETROS URL (LINKS DE INVITACION) =====
// Permite compartir un link tipo ?nombre=Leo&sala=ABCD que precarga
// el nombre y abre el modal de "Unirse" con el codigo ya escrito.
(function detectarYGuardarParamsURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const nombre = urlParams.get('nombre');
    const sala = urlParams.get('sala');

    if (nombre) {
        localStorage.setItem('yatzy_nombre_prefill', nombre);
    }
    if (sala && sala.length >= 4) {
        localStorage.setItem('yatzy_sala_prefill', sala.toUpperCase());
    }
})();

function getPrefilledName() {
    const name = localStorage.getItem('yatzy_nombre_prefill');
    if (name) {
        localStorage.removeItem('yatzy_nombre_prefill');
        return name;
    }
    return null;
}

function getPrefilledRoom() {
    const room = localStorage.getItem('yatzy_sala_prefill');
    if (room && room.length === 4) {
        localStorage.removeItem('yatzy_sala_prefill');
        return room;
    }
    return null;
}

// Aplica los datos de la URL a los campos del lobby al cargar la pagina.
function applyPrefillFromURL() {
    const nombre = getPrefilledName();
    const sala = getPrefilledRoom();

    if (nombre) {
        const nameInput = document.getElementById('playerName');
        if (nameInput) nameInput.value = nombre;
    }

    if (sala) {
        const codeInput = document.getElementById('roomCodeInput');
        if (codeInput) codeInput.value = sala;
        showJoinModal();
    }
}

function persistSession() {
    if (!currentRoom) return;
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            roomCode: currentRoom, myId, myName, scores: myScores, extraYatzys: myExtraYatzys, updatedAt: Date.now()
        }));
    } catch (e) { console.error("No se pudo guardar la sesion", e); }
}
function loadSession() {
    try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function clearSession() { try { localStorage.removeItem(SESSION_KEY); } catch (e) {} }

function registryKey(room, name) { return `${room}::${name}`; }
function loadRegistry() {
    try { const raw = localStorage.getItem(REGISTRY_KEY); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; }
}
function persistRegistry() {
    if (!currentRoom) return;
    try {
        const registry = loadRegistry();
        registry[registryKey(currentRoom, myName)] = { id: myId, scores: myScores, extraYatzys: myExtraYatzys, updatedAt: Date.now() };
        localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    } catch (e) { console.error("No se pudo guardar el registro de jugador", e); }
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
    myScores = session.scores || emptyScores();
    myExtraYatzys = session.extraYatzys || 0;
    isRoomCreator = false;
    connectToRoom(session.roomCode, true);
}
function dismissSession() {
    clearSession();
    const banner = document.getElementById('sessionBanner');
    if (banner) banner.style.display = 'none';
}
