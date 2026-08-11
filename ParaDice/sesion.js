// ============================================
// SESION.JS - PERSISTENCIA DE SESION (RECONEXION)
// ============================================

var SESSION_KEY = 'paradice_session_v1';

// ============================================
// DETECCION DE PARAMETROS URL
// ============================================

(function detectarYGuardarParamsURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const nombre = urlParams.get('nombre');
    const sala = urlParams.get('sala');
    
    console.log('ParaDice - Parametros URL:', { nombre, sala });
    
    if (nombre) {
        localStorage.setItem('paradice_nombre_prefill', nombre);
    }
    if (sala && sala.length >= 4) {
        localStorage.setItem('paradice_sala_prefill', sala.toUpperCase());
    }
})();

// ============================================
// FUNCIONES DE PREFILL
// ============================================

function getPrefilledName() {
    const name = localStorage.getItem('paradice_nombre_prefill');
    if (name) {
        localStorage.removeItem('paradice_nombre_prefill');
        return name;
    }
    return null;
}

function getPrefilledRoom() {
    const room = localStorage.getItem('paradice_sala_prefill');
    if (room && room.length === 4) {
        localStorage.removeItem('paradice_sala_prefill');
        return room;
    }
    return null;
}

// ============================================
// GUARDAR SESION
// ============================================

function saveSession() {
    if (!window.state || !window.state.currentRoom) return;
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            roomCode: window.state.currentRoom,
            myId: window.state.myId,
            myName: window.state.myName,
            updatedAt: Date.now()
        }));
    } catch (e) { 
        console.error('No se pudo guardar la sesion', e); 
    }
}

// ============================================
// CARGAR SESION
// ============================================

function loadSession() {
    try {
        var raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) { 
        return null; 
    }
}

// ============================================
// LIMPIAR SESION
// ============================================

function clearSession() {
    try { 
        localStorage.removeItem(SESSION_KEY); 
        // También borramos el snapshot de progreso (cartas, tablero,
        // tickets, etc.) guardado por mqtt.js para esta sesión.
        localStorage.removeItem('paradice_snapshot_v1');
    } catch (e) {}
}

// ============================================
// RECONECTAR A SESION
// ============================================

function reconnectToSession() {
    var session = loadSession();
    if (!session) {
        alert('No hay sesion guardada para reconectar.');
        return;
    }

    document.getElementById('lobbyModal').style.display = 'none';
    
    window.state.myId = session.myId;
    window.state.myName = session.myName;
    
    var banner = document.getElementById('sessionBanner');
    if (banner) banner.style.display = 'none';
    
    var reconnectBtn = document.getElementById('reconnectBtn');
    if (reconnectBtn) {
        reconnectBtn.disabled = true;
        reconnectBtn.style.opacity = '0.5';
        reconnectBtn.style.cursor = 'not-allowed';
    }

    window.connectToRoom(session.roomCode, true);
}

// ============================================
// DESCARTAR SESION
// ============================================

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

// ============================================
// EXPONER FUNCIONES GLOBALES
// ============================================

window.getPrefilledName = getPrefilledName;
window.getPrefilledRoom = getPrefilledRoom;
window.saveSession = saveSession;
window.loadSession = loadSession;
window.clearSession = clearSession;
window.reconnectToSession = reconnectToSession;
window.dismissSession = dismissSession;