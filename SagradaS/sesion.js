// ===== SESION.JS =====
// Persistencia de sesion (reconexion) para SagradaS

var SESSION_KEY = 'sagradas_session_v1';
var REGISTRY_KEY = 'sagradas_players_v1';

// ============================================================
// DETECCION DE PARAMETROS URL
// ============================================================

(function detectarYGuardarParamsURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const nombre = urlParams.get('nombre');
    const sala = urlParams.get('sala');
    
    console.log('SagradaS - Parametros URL:', { nombre, sala });
    
    if (nombre) {
        localStorage.setItem('sagradas_nombre_prefill', nombre);
    }
    if (sala && sala.length >= 4) {
        localStorage.setItem('sagradas_sala_prefill', sala.toUpperCase());
    }
})();

// ============================================================
// OBTENER DATOS PREFILL (desde URL)
// ============================================================

function getPrefilledName() {
    const name = localStorage.getItem('sagradas_nombre_prefill');
    if (name) {
        localStorage.removeItem('sagradas_nombre_prefill');
        return name;
    }
    return null;
}

function getPrefilledRoom() {
    const room = localStorage.getItem('sagradas_sala_prefill');
    if (room && room.length === 4) {
        localStorage.removeItem('sagradas_sala_prefill');
        return room;
    }
    return null;
}

// ============================================================
// GUARDAR/CARGAR SESION
// ============================================================

function saveSession() {
    if (!window.currentRoom) return;
    try {
        var cardState = (typeof window.getCardStateForSync === 'function')
            ? window.getCardStateForSync()
            : null;

        var favores = (window.herramientasState && window.herramientasState.favores)
            ? { ...window.herramientasState.favores }
            : null;

        localStorage.setItem(SESSION_KEY, JSON.stringify({
            roomCode: window.currentRoom,
            myId: window.myId,
            myName: window.myName,
            moveHistory: window.gameState ? window.gameState.moveHistory : [],
            cardId: window.gameState ? window.gameState.currentCardId : null,
            cardState: cardState,
            privateObjectiveId: window.gameState ? window.gameState.privateObjectiveId : null,
            publicObjectives: window.gameState ? window.gameState.publicObjectives : [],
            tools: window.gameState ? window.gameState.tools : [],
            gameStarted: window.gameState ? window.gameState.gameStarted : false,
            isFinished: window.gameState ? window.gameState.isFinished : false,
            initialCardSelectionDone: window.cartillasState ? window.cartillasState.initialCardSelectionDone : false,
            favores: favores,
            herramientasUsadas: window.herramientasState ? window.herramientasState.herramientas_usadas : [],
            miColor: window.coloresState ? window.coloresState.miColor : null,
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

// ============================================================
// REGISTRO DE JUGADORES (para reconexion)
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

function saveRegistryEntry(room, name, id, moves, cardId, privateObjectiveId) {
    try {
        var registry = loadRegistry();
        registry[registryKey(room, name)] = { 
            id: id, 
            moves: moves || [], 
            cardId: cardId || null,
            privateObjectiveId: privateObjectiveId || null,
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

// ============================================================
// RECONECTAR A SESION GUARDADA
// ============================================================

function reconnectToSession() {
    var session = loadSession();
    if (!session) {
        alert('No hay sesion guardada para reconectar.');
        return;
    }

    var lobbyModal = document.getElementById('lobbyModal');
    if (lobbyModal) lobbyModal.style.display = 'none';
    
    var banner = document.getElementById('sessionBanner');
    if (banner) banner.style.display = 'none';
    
    var reconnectBtn = document.getElementById('reconnectBtn');
    if (reconnectBtn) {
        reconnectBtn.disabled = true;
        reconnectBtn.style.opacity = '0.5';
        reconnectBtn.style.cursor = 'not-allowed';
    }

    window.myId = session.myId;
    window.myName = session.myName;
    
    myId = window.myId;
    myName = window.myName;
    
    if (window.gameState) {
        window.gameState.moveHistory = session.moveHistory || [];
        window.gameState.currentCardId = session.cardId || null;
        window.gameState.privateObjectiveId = session.privateObjectiveId || null;
        window.gameState.publicObjectives = session.publicObjectives || [];
        window.gameState.tools = session.tools || [];
        window.gameState.gameStarted = session.gameStarted || false;
        window.gameState.isFinished = session.isFinished || false;
    }
    
    if (window.cartillasState) {
        window.cartillasState.initialCardSelectionDone = session.initialCardSelectionDone || false;
        window.cartillasState.currentCardId = session.cardId || null;
    }

    // ===== RESTAURAR EL TABLERO EXACTO (colores/valores elegidos por el jugador) =====
    // getCurrentCard() devuelve la carta original desde CARTILLAS; sin esto,
    // las casillas que el jugador llenó libremente (sin color o valor predefinido)
    // volverían a aparecer vacías tras recargar la página.
    if (session.cardId && session.cardState && session.cardState.rows && typeof getCardById === 'function') {
        var originalCard = getCardById(session.cardId);
        if (originalCard && originalCard.rows) {
            session.cardState.rows.forEach(function(row, r) {
                row.forEach(function(savedCell, c) {
                    if (originalCard.rows[r] && originalCard.rows[r][c]) {
                        originalCard.rows[r][c].value = savedCell.value;
                        originalCard.rows[r][c].color = savedCell.color;
                    }
                });
            });
        }
    }

    // ===== RESTAURAR HERRAMIENTAS / FAVORES =====
    if (window.herramientasState) {
        if (session.favores) {
            window.herramientasState.favores.total = session.favores.total || 0;
            window.herramientasState.favores.gastados = session.favores.gastados || 0;
            window.herramientasState.favores.disponibles = session.favores.disponibles || 0;
        }
        window.herramientasState.herramientas_usadas = session.herramientasUsadas || [];
        window.herramientasState.herramientas_seleccionadas = session.tools || [];
        window.herramientasState.herramientas_disponibles = session.tools || [];
    }

    // ===== RESTAURAR COLOR ASIGNADO =====
    if (window.coloresState && session.miColor) {
        window.coloresState.miColor = session.miColor;
        window.coloresState.asignaciones = window.coloresState.asignaciones || {};
        window.coloresState.asignaciones[window.myId] = session.miColor;
    }

    // ===== RESTAURAR HISTORIAL DE DESHACER (para resaltar la última marcada) =====
    if (window.undoState) {
        window.undoState.history = [...(session.moveHistory || [])];
        window.undoState.lastMarked = window.undoState.history.length > 0
            ? window.undoState.history[window.undoState.history.length - 1]
            : null;
    }

    // ===== RESTAURAR VISIBILIDAD DE LA UI DE PARTIDA EN CURSO =====
    if (session.gameStarted || session.initialCardSelectionDone) {
        var gameInfo = document.getElementById('gameInfo');
        if (gameInfo) gameInfo.style.display = 'block';

        var finishBtn = document.getElementById('finishGameBtn');
        if (finishBtn) {
            finishBtn.disabled = false;
            finishBtn.style.opacity = '1';
            finishBtn.style.cursor = 'pointer';
        }

        var startBtn = document.getElementById('startGameBtn');
        if (startBtn) {
            startBtn.textContent = 'Vitrinas';
            startBtn.style.opacity = '0.7';
            startBtn.style.cursor = 'default';
        }
    }

    if (typeof renderBoard === 'function') renderBoard();
    if (typeof calculateScores === 'function') calculateScores();
    if (typeof renderGameInfo === 'function') renderGameInfo();
    if (typeof renderLeaderboard === 'function') renderLeaderboard();
    if (typeof renderFavoresConColor === 'function') renderFavoresConColor();

    if (typeof connectToRoom === 'function') {
        connectToRoom(session.roomCode, true);
    }
}

// ============================================================
// LIMPIAR SESION DESDE UI
// ============================================================

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
    
    if (window.gameState) {
        window.gameState.moveHistory = [];
        window.gameState.currentCardId = null;
        window.gameState.gameStarted = false;
    }
    if (window.cartillasState) {
        window.cartillasState.initialCardSelectionDone = false;
        window.cartillasState.availableCards = [];
    }
    
    if (typeof renderBoard === 'function') renderBoard();
    if (typeof calculateScores === 'function') calculateScores();
    if (typeof renderLeaderboard === 'function') renderLeaderboard();
}

// ============================================================
// FUNCION PRINCIPAL: ENTRAR A SALA
// ============================================================

function entrarSala() {
    var nombre = localStorage.getItem('sagradas_nombre_prefill');
    var sala = localStorage.getItem('sagradas_sala_prefill');
    
    if (!nombre) {
        alert('No se ha configurado un nombre. Usa ?nombre=XXX en la URL.');
        return;
    }
    
    if (!sala || sala.length !== 4) {
        alert('No se ha configurado una sala valida. Usa ?sala=XXXX en la URL.');
        return;
    }
    
    localStorage.removeItem('sagradas_nombre_prefill');
    localStorage.removeItem('sagradas_sala_prefill');
    
    window.myName = nombre;
    window.myId = Math.random().toString(36).substr(2, 9);
    
    myId = window.myId;
    myName = window.myName;
    
    console.log('Entrando a sala como:', { myId: window.myId, myName: window.myName });
    
    if (window.gameState) {
        window.gameState.moveHistory = [];
        window.gameState.gameStarted = false;
        window.gameState.currentCardId = null;
        window.gameState.isFinished = false;
    }
    if (window.cartillasState) {
        window.cartillasState.initialCardSelectionDone = false;
        window.cartillasState.availableCards = [];
        window.cartillasState.cardsDealt = false;
        window.cartillasState.allPlayerCards = {};
    }
    
    if (typeof connectToRoom === 'function') {
        connectToRoom(sala.toUpperCase());
    }
}

// ============================================================
// EXPORTAR
// ============================================================

window.SESSION_KEY = SESSION_KEY;
window.REGISTRY_KEY = REGISTRY_KEY;
window.getPrefilledName = getPrefilledName;
window.getPrefilledRoom = getPrefilledRoom;
window.saveSession = saveSession;
window.loadSession = loadSession;
window.clearSession = clearSession;
window.loadRegistry = loadRegistry;
window.saveRegistryEntry = saveRegistryEntry;
window.getRegistryEntry = getRegistryEntry;
window.reconnectToSession = reconnectToSession;
window.dismissSession = dismissSession;
window.entrarSala = entrarSala;

console.log('sesion.js cargado - Sistema de sesion para SagradaS');