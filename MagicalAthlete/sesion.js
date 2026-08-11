// ===== PERSISTENCIA DE SESION (RECONEXION) =====
var SESSION_KEY = 'magical_athlete_session_v1';
var REGISTRY_KEY = 'magical_athlete_players_v1';

(function detectarYGuardarParamsURL() {
    var urlParams = new URLSearchParams(window.location.search);
    var nombre = urlParams.get('nombre');
    var sala = urlParams.get('sala');
    
    console.log('MagicalAthlete - Parametros URL:', { nombre: nombre, sala: sala });
    
    if (nombre) {
        localStorage.setItem('magical_athlete_nombre_prefill', nombre);
    }
    if (sala && sala.length >= 4) {
        localStorage.setItem('magical_athlete_sala_prefill', sala.toUpperCase());
    }
})();

function getPrefilledName() {
    var name = localStorage.getItem('magical_athlete_nombre_prefill');
    if (name) {
        localStorage.removeItem('magical_athlete_nombre_prefill');
        return name;
    }
    return null;
}

function getPrefilledRoom() {
    var room = localStorage.getItem('magical_athlete_sala_prefill');
    if (room && room.length === 4) {
        localStorage.removeItem('magical_athlete_sala_prefill');
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
            misSelecciones: misSelecciones,
            cartas: cartas,
            gameStarted: gameStarted,
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

function saveRegistryEntry(room, name, id, selecciones) {
    try {
        var registry = loadRegistry();
        registry[registryKey(room, name)] = { 
            id: id, 
            selecciones: selecciones, 
            updatedAt: Date.now() 
        };
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

    document.getElementById('lobbyModal').style.display = 'none';
    
    myId = session.myId;
    myName = session.myName;
    misSelecciones = session.misSelecciones || [];
    cartas = session.cartas || [];
    gameStarted = session.gameStarted || false;
    
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();

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