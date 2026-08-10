// ============================================================
// SESION.JS - PERSISTENCIA Y RECLAMO DE IDENTIDAD
// ============================================================

var SESSION_KEY = 'cleverdados_session_v1';
var REGISTRY_KEY = 'cleverdados_players_v1';

// ============================================================
// DETECCIÓN DE PARÁMETROS URL
// ============================================================

(function detectarYGuardarParamsURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const nombre = urlParams.get('nombre');
    const sala = urlParams.get('sala');
    
    console.log('📥 CleverDados - Parámetros URL:', { nombre, sala });
    
    if (nombre) {
        localStorage.setItem('cleverdados_nombre_prefill', nombre);
    }
    if (sala && sala.length >= 4) {
        localStorage.setItem('cleverdados_sala_prefill', sala.toUpperCase());
    }
})();

// ============================================================
// OBTENER DATOS PREFILL
// ============================================================

function getPrefilledName() {
    const name = localStorage.getItem('cleverdados_nombre_prefill');
    if (name) {
        localStorage.removeItem('cleverdados_nombre_prefill');
        return name;
    }
    return null;
}

function getPrefilledRoom() {
    const room = localStorage.getItem('cleverdados_sala_prefill');
    if (room && room.length === 4) {
        localStorage.removeItem('cleverdados_sala_prefill');
        return room;
    }
    return null;
}

// ============================================================
// GUARDAR Y CARGAR SESIÓN
// ============================================================

function saveSession() {
    if (!currentRoom) {
        console.warn('No se puede guardar sesion: currentRoom no definido');
        return;
    }
    if (!miNombre) {
        console.warn('No se puede guardar sesion: miNombre no definido');
        return;
    }
    if (!miId) {
        console.warn('No se puede guardar sesion: miId no definido');
        return;
    }
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            roomCode: currentRoom,
            myId: miId,
            myName: miNombre,
            moveHistory: historialMovimientos.slice(),
            updatedAt: Date.now()
        }));
        console.log('Sesion guardada correctamente:', { roomCode: currentRoom, myName: miNombre });
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

// ============================================================
// REGISTRO DE JUGADORES (para reconexión)
// ============================================================

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

// ============================================================
// ENTRAR A SALA (desde el lobby)
// ============================================================

function entrarSala() {
    var nombre = localStorage.getItem('cleverdados_nombre_prefill');
    var sala = localStorage.getItem('cleverdados_sala_prefill');
    
    if (!nombre) {
        nombre = 'Jugador_' + Math.floor(Math.random() * 1000);
    }
    
    if (!sala || sala.length !== 4) {
        alert('No se ha configurado una sala valida. Usa ?sala=XXXX en la URL.');
        return;
    }
    
    // Establecer variables globales
    window.miNombre = nombre;
    window.miId = Math.random().toString(36).substr(2, 9);
    window.historialMovimientos = [];
    window.currentRoom = sala.toUpperCase();
    
    // Sincronizar variables locales
    miNombre = window.miNombre;
    miId = window.miId;
    historialMovimientos = window.historialMovimientos;
    salaActual = window.currentRoom;
    
    localStorage.removeItem('cleverdados_nombre_prefill');
    localStorage.removeItem('cleverdados_sala_prefill');
    
    conectarSala(sala.toUpperCase());
}

// ============================================================
// RECONECTAR A SESIÓN GUARDADA
// ============================================================

function reconnectToSession() {
    var session = loadSession();
    if (!session || !session.roomCode || !session.myName) {
        alert('No hay sesion valida para reconectar.');
        if (session) clearSession();
        return;
    }

    document.getElementById('lobbyModal').style.display = 'none';
    
    // Restaurar variables globales
    window.miId = session.myId || Math.random().toString(36).substr(2, 9);
    window.miNombre = session.myName;
    window.historialMovimientos = session.moveHistory || [];
    window.currentRoom = session.roomCode;
    
    // Sincronizar variables locales
    miId = window.miId;
    miNombre = window.miNombre;
    salaActual = session.roomCode;
    historialMovimientos = window.historialMovimientos;
    
    if (typeof actualizarVisuales === 'function') {
        actualizarVisuales();
    }
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    }
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }

    conectarSala(session.roomCode, true);
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

// ============================================================
// MOSTRAR DATOS EN EL LOBBY
// ============================================================

function mostrarDatosLobby() {
    var nombre = localStorage.getItem('cleverdados_nombre_prefill');
    var sala = localStorage.getItem('cleverdados_sala_prefill');
    
    var display = document.getElementById('urlDataDisplay');
    if (display) {
        if (nombre || sala) {
            display.style.display = 'block';
            document.getElementById('urlPlayerName').textContent = nombre || '---';
            document.getElementById('urlRoomCode').textContent = sala || '---';
            console.log('Datos configurados:', { nombre, sala });
        } else {
            display.style.display = 'none';
        }
    }
    
    var session = loadSession();
    var banner = document.getElementById('sessionBanner');
    var reconnectBtn = document.getElementById('reconnectBtn');
    
    if (session && session.roomCode && session.myName) {
        document.getElementById('sessionBannerText').textContent =
            'Tenías una partida abierta en la sala ' + session.roomCode + ' como "' + session.myName + '".';
        banner.style.display = 'block';
        
        if (reconnectBtn) {
            reconnectBtn.disabled = false;
            reconnectBtn.style.opacity = '1';
            reconnectBtn.style.cursor = 'pointer';
        }
    } else {
        if (banner) banner.style.display = 'none';
        if (reconnectBtn) {
            reconnectBtn.disabled = true;
            reconnectBtn.style.opacity = '0.5';
            reconnectBtn.style.cursor = 'not-allowed';
        }
        // Limpiar sesion corrupta
        if (session && (!session.roomCode || !session.myName)) {
            clearSession();
        }
    }
}

// ============================================================
// VOLVER AL LOBBY
// ============================================================

function backToLobby() {
    document.getElementById('joinModal').style.display = 'none';
    document.getElementById('lobbyModal').style.display = 'flex';
}

// ============================================================
// FUNCIONES DE RECLAMO
// ============================================================

function showClaimModal(claim) {
    var modal = document.getElementById('claimModal');
    var text = document.getElementById('claimText');
    if (text) {
        text.textContent = 'Ya hay un jugador "' + claim.name + '" en la sala con ' + claim.score + ' pts. ¿Eres tú (te desconectaste antes)?';
    }
    if (modal) modal.style.display = 'flex';
}

function acceptClaim() {
    if (!pendingClaim) return;
    
    // Guardar el ID antiguo para eliminar
    var staleTempId = window.miId;

    // Eliminar el jugador temporal
    if (typeof broadcastRemove === 'function') {
        broadcastRemove(staleTempId);
    }

    delete window.datosJugadores[staleTempId];
    
    // Actualizar con los datos del reclamo
    window.miId = pendingClaim.oldId;
    window.historialMovimientos = pendingClaim.moves.slice();
    
    // Actualizar visuales
    if (typeof actualizarVisuales === 'function') {
        actualizarVisuales();
    }
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    }
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
    
    // Cerrar modal
    document.getElementById('claimModal').style.display = 'none';
    pendingClaim = null;
}

function declineClaim() {
    pendingClaim = null;
    document.getElementById('claimModal').style.display = 'none';
}

// ============================================================
// EXPORTAR
// ============================================================

window.entrarSala = entrarSala;
window.reconnectToSession = reconnectToSession;
window.dismissSession = dismissSession;
window.backToLobby = backToLobby;
window.mostrarDatosLobby = mostrarDatosLobby;
window.showClaimModal = showClaimModal;
window.acceptClaim = acceptClaim;
window.declineClaim = declineClaim;
window.saveSession = saveSession;
window.loadSession = loadSession;
window.clearSession = clearSession;
window.getPrefilledName = getPrefilledName;
window.getPrefilledRoom = getPrefilledRoom;
window.saveRegistryEntry = saveRegistryEntry;
window.getRegistryEntry = getRegistryEntry;

console.log('💾 Sistema de sesión cargado correctamente');