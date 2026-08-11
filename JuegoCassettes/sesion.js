// sesion.js (raíz)
// ===== PERSISTENCIA DE SESION (RECONEXION) =====
var SESSION_KEY = 'cassettes_session_v1';
var REGISTRY_KEY = 'cassettes_players_v1';

// ===== DETECCIÓN DE PARÁMETROS URL =====
(function detectarYGuardarParamsURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const nombre = urlParams.get('nombre');
    const sala = urlParams.get('sala');
    
    console.log('Cassettes - Parametros URL:', { nombre, sala });
    
    if (nombre) {
        localStorage.setItem('cassettes_nombre_prefill', nombre);
    }
    if (sala && sala.length >= 4) {
        localStorage.setItem('cassettes_sala_prefill', sala.toUpperCase());
    }
})();

function getPrefilledName() {
    const name = localStorage.getItem('cassettes_nombre_prefill');
    if (name) {
        localStorage.removeItem('cassettes_nombre_prefill');
        return name;
    }
    return null;
}

function getPrefilledRoom() {
    const room = localStorage.getItem('cassettes_sala_prefill');
    if (room && room.length === 4) {
        localStorage.removeItem('cassettes_sala_prefill');
        return room;
    }
    return null;
}

function saveSession() {
    if (!window.salaActual) return;
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            roomCode: window.salaActual,
            myId: window.estadoJugador?.id || null,
            myName: window.estadoJugador?.nombre || 'Jugador',
            myEquipo: window.estadoJugador?.equipo || 'A',
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

function saveRegistryEntry(room, name, id, equipo) {
    try {
        var registry = loadRegistry();
        registry[registryKey(room, name)] = { id: id, equipo: equipo, updatedAt: Date.now() };
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

    // Usamos ocultarLobby() en vez de tocar el display a mano, para que
    // tambien se quite la clase 'modal-open' del body (si no, el scroll
    // queda bloqueado despues de reconectar).
    if (window.ocultarLobby) {
        window.ocultarLobby();
    } else {
        document.getElementById('lobbyModal').style.display = 'none';
    }
    
    if (window.estadoJugador) {
        window.estadoJugador.id = session.myId;
        window.estadoJugador.nombre = session.myName;
        window.estadoJugador.equipo = session.myEquipo || 'A';
        window.estadoJugador.sala = session.roomCode;
        window.estadoJugador.conectado = true;
    }
    
    if (window.conectarSala) {
        window.conectarSala(session.roomCode, session.myName, session.myEquipo || 'A', true);
    }
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

// Exponer funciones globales
window.saveSession = saveSession;
window.loadSession = loadSession;
window.clearSession = clearSession;
window.reconnectToSession = reconnectToSession;
window.dismissSession = dismissSession;
window.getPrefilledName = getPrefilledName;
window.getPrefilledRoom = getPrefilledRoom;
window.saveRegistryEntry = saveRegistryEntry;
window.getRegistryEntry = getRegistryEntry;