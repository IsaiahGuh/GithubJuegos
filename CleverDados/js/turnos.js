// ============================================================
// TURNOS.JS - SISTEMA DE TURNOS PARA CLEVERDADOS
// ============================================================

// ============================================================
// ESTADO GLOBAL DEL JUEGO
// ============================================================

let gameState = 'waiting';          // 'waiting' | 'playing' | 'finished'
let turnOrder = [];                // Array de IDs en orden de turno
let currentTurnIndex = 0;          // Índice en turnOrder
let hostId = null;                // ID del anfitrión (el primero que se conecta)
let marcasEnTurnoActual = [];     // IDs de casillas marcadas en el turno actual

// ============================================================
// REFERENCIAS A ELEMENTOS UI
// ============================================================

let turnBannerElement = null;
let startGameBtn = null;
let endTurnBtn = null;
let resetGameBtn = null;

// Elección de anfitrión: evita que dos jugadores se autodeclaren
// anfitriones al mismo tiempo cuando alguien se une a la sala.
let hostElectionTimer = null;
let hostElectionDone = false;

// ============================================================
// INICIALIZACIÓN DE UI
// ============================================================

function initTurnUI() {
    turnBannerElement = document.getElementById('turnBanner');
    startGameBtn = document.getElementById('startGameBtn');
    endTurnBtn = document.getElementById('endTurnBtn');
    resetGameBtn = document.getElementById('resetGameBtn');

    // Asignar event listeners (se llaman desde main.js después de cargar)
    if (startGameBtn) {
        startGameBtn.addEventListener('click', iniciarPartida);
    }
    if (endTurnBtn) {
        endTurnBtn.addEventListener('click', finalizarTurno);
    }
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', reiniciarPartida);
    }

    actualizarUIEstado();
}

// ============================================================
// FUNCIONES DE VERIFICACIÓN DE TURNO
// ============================================================

function puedeMarcar() {
    return gameState === 'playing' &&
           turnOrder.length > 0 &&
           turnOrder[currentTurnIndex] === window.miId;
}

function esMiTurno() {
    return turnOrder.length > 0 && turnOrder[currentTurnIndex] === window.miId;
}

function getJugadorActual() {
    if (turnOrder.length === 0) return null;
    const id = turnOrder[currentTurnIndex];
    return window.datosJugadores ? window.datosJugadores[id] : null;
}

// ============================================================
// REGISTRO Y DESREGISTRO DE MARCAS EN EL TURNO ACTUAL
// ============================================================

function registrarMarca(id) {
    if (!puedeMarcar()) return false;
    if (marcasEnTurnoActual.includes(id)) return false;

    marcasEnTurnoActual.push(id);
    habilitarBotonFinalizarTurno(true);
    return true;
}

function marcaDeshecha(id) {
    const idx = marcasEnTurnoActual.indexOf(id);
    if (idx !== -1) {
        marcasEnTurnoActual.splice(idx, 1);
        if (marcasEnTurnoActual.length === 0) {
            habilitarBotonFinalizarTurno(false);
        }
        return true;
    }
    return false;
}

// ============================================================
// CONTROL DE BOTONES
// ============================================================

function habilitarBotonFinalizarTurno(habilitado) {
    if (endTurnBtn) {
        endTurnBtn.disabled = !habilitado;
        endTurnBtn.style.opacity = habilitado ? '1' : '0.5';
        endTurnBtn.style.cursor = habilitado ? 'pointer' : 'not-allowed';
    }
}

function actualizarBotonesSegunEstado() {
    // Botón Iniciar: solo visible para el anfitrión cuando está en 'waiting'
    if (startGameBtn) {
        const soyHost = window.miId === hostId;
        const visible = soyHost && gameState === 'waiting';
        startGameBtn.style.display = visible ? 'inline-block' : 'none';
        startGameBtn.disabled = !visible;
    }

    // Botón Finalizar Turno: visible solo en 'playing' y se habilita con marcas
    if (endTurnBtn) {
        const visible = gameState === 'playing';
        endTurnBtn.style.display = visible ? 'inline-block' : 'none';
        if (visible) {
            const tieneMarcas = marcasEnTurnoActual.length > 0;
            endTurnBtn.disabled = !tieneMarcas;
            endTurnBtn.style.opacity = tieneMarcas ? '1' : '0.5';
        } else {
            endTurnBtn.disabled = true;
            endTurnBtn.style.opacity = '0.5';
        }
    }

    // Botón Reiniciar: solo visible para el anfitrión siempre
    if (resetGameBtn) {
        const soyHost = window.miId === hostId;
        resetGameBtn.style.display = soyHost ? 'inline-block' : 'none';
        resetGameBtn.disabled = !soyHost;
    }
}

// ============================================================
// ACTUALIZAR BANNER DE TURNO
// ============================================================

function actualizarBannerTurno() {
    if (!turnBannerElement) return;

    if (gameState === 'waiting') {
        turnBannerElement.textContent = '⏳ Esperando inicio...';
        turnBannerElement.style.color = '#a09888';
        return;
    }

    if (gameState === 'finished') {
        turnBannerElement.textContent = '🏁 Partida finalizada';
        turnBannerElement.style.color = '#ffd700';
        return;
    }

    // Estado 'playing'
    const jugador = getJugadorActual();
    if (!jugador) {
        turnBannerElement.textContent = '⚠️ Error: sin jugador actual';
        turnBannerElement.style.color = '#ff6b6b';
        return;
    }

    const esTurnoPropio = esMiTurno();
    const nombre = jugador.nombre || 'Desconocido';
    const texto = esTurnoPropio
        ? `🎯 Tu turno — marca las casillas que quieras`
        : `⏳ Turno de: ${nombre}`;
    turnBannerElement.textContent = texto;
    turnBannerElement.style.color = esTurnoPropio ? '#4caf50' : '#ECE5DB';
}

// ============================================================
// ACTUALIZACIÓN COMPLETA DE UI DE ESTADO
// ============================================================

function actualizarUIEstado() {
    // Mantener sincronizadas las copias globales para que otros módulos
    // (como sesion.js) siempre lean el estado más reciente.
    window.gameState = gameState;
    window.turnOrder = turnOrder;
    window.currentTurnIndex = currentTurnIndex;
    window.hostId = hostId;
    window.marcasEnTurnoActual = marcasEnTurnoActual;

    actualizarBannerTurno();
    actualizarBotonesSegunEstado();

    // Refrescar leaderboard para mostrar quién tiene el turno
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
}

// ============================================================
// INICIAR PARTIDA (SOLO ANFITRIÓN)
// ============================================================

function iniciarPartida() {
    if (hostId !== window.miId) {
        console.warn('⚠️ Solo el anfitrión puede iniciar la partida');
        return;
    }
    if (gameState !== 'waiting') {
        console.warn('⚠️ La partida ya está en curso');
        return;
    }
    if (turnOrder.length < 1) {
        alert('Debes estar en la sala para iniciar.');
        return;
    }

    // Limpiar todos los tableros antes de empezar
    if (typeof reiniciarTablero === 'function') {
        reiniciarTablero();
    }
    // Reiniciar también el historial de marcas del turno
    marcasEnTurnoActual = [];
    currentTurnIndex = 0;

    // Cambiar estado
    gameState = 'playing';

    // Transmitir a todos
    broadcastGameStart();

    // Actualizar localmente
    actualizarUIEstado();

    console.log('🚀 Partida iniciada por', window.miNombre);
}

// ============================================================
// FINALIZAR TURNO
// ============================================================

function finalizarTurno() {
    if (!esMiTurno()) {
        console.warn('⚠️ No es tu turno');
        return;
    }
    if (marcasEnTurnoActual.length === 0) {
        console.warn('⚠️ No has marcado nada en este turno');
        return;
    }
    if (gameState !== 'playing') {
        console.warn('⚠️ La partida no está en curso');
        return;
    }

    // Calcular siguiente turno
    const nextIndex = (currentTurnIndex + 1) % turnOrder.length;

    // Enviar avance de turno
    broadcastTurnAdvance(nextIndex);

    // Aplicar localmente
    aplicarAvanceTurno(nextIndex);

    // Reseteamos marcas del turno (ya se resetea en aplicarAvanceTurno)
    // pero lo hacemos aquí también por si acaso
    marcasEnTurnoActual = [];
    habilitarBotonFinalizarTurno(false);

    console.log('🔄 Turno finalizado, pasa a', turnOrder[nextIndex]);
}

// ============================================================
// REINICIAR PARTIDA (SOLO ANFITRIÓN)
// ============================================================

function reiniciarPartida() {
    if (hostId !== window.miId) {
        console.warn('⚠️ Solo el anfitrión puede reiniciar');
        return;
    }

    // Confirmar con el usuario
    if (!confirm('¿Estás seguro de reiniciar la partida para todos?')) return;

    // Cambiar estado a waiting
    gameState = 'waiting';
    currentTurnIndex = 0;
    marcasEnTurnoActual = [];

    // Limpiar todos los tableros
    if (typeof reiniciarTablero === 'function') {
        reiniciarTablero();
    }

    // Transmitir reset
    broadcastGameReset();

    // Actualizar UI
    actualizarUIEstado();
    console.log('🔄 Partida reiniciada por', window.miNombre);
}

// ============================================================
// APLICAR AVANCE DE TURNO (local)
// ============================================================

function aplicarAvanceTurno(nextIndex) {
    if (nextIndex < 0 || nextIndex >= turnOrder.length) {
        console.error('Índice de turno inválido:', nextIndex);
        return;
    }
    currentTurnIndex = nextIndex;
    marcasEnTurnoActual = [];
    habilitarBotonFinalizarTurno(false);
    actualizarUIEstado();

    // Si el nuevo turno es el mío, mostrar notificación (opcional)
    if (esMiTurno()) {
        console.log('🎯 Es tu turno');
        // Podría lanzarse un sonido o notificación
    }
}

// ============================================================
// SINCRONIZAR ESTADO (desde el anfitrión)
// ============================================================

function sincronizarEstado() {
    if (hostId !== window.miId) return;

    const payload = {
        action: 'state_sync',
        id: window.miId,
        gameState: gameState,
        turnOrder: turnOrder,
        currentTurnIndex: currentTurnIndex,
        hostId: hostId
    };
    broadcastMQTT(payload);
}

// ============================================================
// FUNCIONES DE BROADCAST MQTT (usando el cliente existente)
// ============================================================

function broadcastMQTT(payload) {
    if (!window.clienteMQTT || !window.salaActual) {
        console.warn('⚠️ No se puede broadcast: MQTT no disponible');
        return;
    }
    const topic = 'cleverdados_app/room/' + window.salaActual;
    window.clienteMQTT.publish(topic, JSON.stringify(payload));
}

function broadcastGameStart() {
    broadcastMQTT({
        action: 'game_start',
        id: window.miId,
        turnOrder: turnOrder,
        hostId: hostId
    });
}

function broadcastTurnAdvance(nextIndex) {
    broadcastMQTT({
        action: 'turn_advance',
        id: window.miId,
        nextIndex: nextIndex
    });
}

function broadcastGameReset() {
    broadcastMQTT({
        action: 'game_reset',
        id: window.miId
    });
}

// ============================================================
// MANEJADOR DE MENSAJES MQTT (para ser llamado desde multijugador)
// ============================================================

function manejarMensajeTurno(data) {
    if (!data || !data.action) return;

    // Ignorar mensajes propios
    if (data.id === window.miId) return;

    switch (data.action) {
        case 'state_sync':
            // Si dos jugadores se autodeclararon anfitriones casi al mismo
            // tiempo (carrera al unirse), desempatamos de forma
            // determinista: gana el id menor alfabéticamente, igual en
            // todos los clientes.
            if (hostElectionDone && hostId === window.miId &&
                data.hostId && data.hostId !== window.miId) {
                if (data.hostId < window.miId) {
                    hostId = data.hostId; // el otro gana, adoptamos su estado
                } else {
                    // Nosotros ganamos: reafirmamos nuestro estado para
                    // corregir al otro cliente en vez de aceptar el suyo.
                    sincronizarEstado();
                    break;
                }
            }

            if (hostElectionTimer) { clearTimeout(hostElectionTimer); hostElectionTimer = null; }
            hostElectionDone = true;

            // Recibir estado completo del anfitrión
            gameState = data.gameState || 'waiting';
            turnOrder = data.turnOrder || [];
            currentTurnIndex = data.currentTurnIndex || 0;
            hostId = data.hostId || hostId;
            marcasEnTurnoActual = [];
            actualizarUIEstado();
            console.log('📥 Estado sincronizado:', { gameState, turnOrder, currentTurnIndex, hostId });
            break;

        case 'game_start':
            if (hostElectionTimer) { clearTimeout(hostElectionTimer); hostElectionTimer = null; }
            hostElectionDone = true;

            // Un jugador inicia la partida
            gameState = 'playing';
            turnOrder = data.turnOrder || [];
            currentTurnIndex = 0;
            hostId = data.hostId || null;
            marcasEnTurnoActual = [];
            // Limpiar tableros
            if (typeof reiniciarTablero === 'function') {
                reiniciarTablero();
            }
            actualizarUIEstado();
            console.log('🚀 Partida iniciada por', data.id);
            break;

        case 'turn_advance':
            // Avance de turno
            const nextIndex = data.nextIndex;
            if (nextIndex !== undefined) {
                aplicarAvanceTurno(nextIndex);
                console.log('🔄 Turno avanzado a', turnOrder[currentTurnIndex]);
            }
            break;

        case 'game_reset':
            // Reinicio forzado
            gameState = 'waiting';
            currentTurnIndex = 0;
            marcasEnTurnoActual = [];
            if (typeof reiniciarTablero === 'function') {
                reiniciarTablero();
            }
            actualizarUIEstado();
            console.log('🔄 Partida reiniciada por', data.id);
            break;

        default:
            // Ignorar otros mensajes
            break;
    }
}

// ============================================================
// INICIALIZACIÓN DE ANFITRIÓN AL CONECTAR
// ============================================================

function establecerAnfitrion() {
    // IMPORTANTE: ya no nos autodeclaramos anfitriones de inmediato.
    // Si lo hiciéramos, un jugador que se une a una sala que YA tiene
    // anfitrión también se declararía anfitrión (porque su hostId local
    // arranca en null), y el último "state_sync" en llegar ganaría la
    // carrera, robándole los botones al anfitrión real.
    //
    // En vez de eso, esperamos un momento corto por si ya hay un
    // anfitrión en la sala (que responderá con su state_sync al
    // recibir nuestro mensaje de 'join'). Si nadie responde, asumimos
    // que somos los primeros y nos convertimos en anfitriones.
    if (hostId) {
        hostElectionDone = true;
        return false;
    }
    hostElectionDone = false;
    programarDecisionAnfitrion(900);
    return false;
}

function programarDecisionAnfitrion(delayMs) {
    if (hostId) {
        hostElectionDone = true;
        return;
    }
    if (hostElectionTimer) clearTimeout(hostElectionTimer);
    hostElectionTimer = setTimeout(function() {
        hostElectionTimer = null;
        if (hostElectionDone || hostId) return;

        // Nadie respondió a tiempo: somos el primer jugador de la sala.
        hostId = window.miId;
        hostElectionDone = true;
        if (turnOrder.indexOf(window.miId) === -1) {
            turnOrder.push(window.miId);
        }
        actualizarUIEstado();
        sincronizarEstado();
        console.log('👑 Te has convertido en anfitrión (nadie más respondió)');
    }, delayMs);
}

// Llamado cuando llega un mensaje de otro jugador y todavía no sabemos
// quién es el anfitrión: le damos un poco más de tiempo a que llegue
// la información real del anfitrión antes de autodeclararnos.
function notificarPresenciaOtroJugador() {
    if (hostId || hostElectionDone) return;
    programarDecisionAnfitrion(1200);
}

// ============================================================
// AGREGAR JUGADOR A LA LISTA DE TURNOS (cuando se une)
// ============================================================

function agregarJugadorTurno(id) {
    if (!id) return;
    if (turnOrder.includes(id)) return;
    turnOrder.push(id);
    // Si somos anfitrión, sincronizar
    if (hostId === window.miId) {
        sincronizarEstado();
    }
}

// ============================================================
// RECONSTRUIR ESTADO DESDE SESIÓN (al reconectar)
// ============================================================

function restaurarEstadoDesdeSesion(sessionData) {
    if (!sessionData) return;
    if (sessionData.gameState !== undefined) gameState = sessionData.gameState;
    if (sessionData.turnOrder) turnOrder = sessionData.turnOrder;
    if (sessionData.currentTurnIndex !== undefined) currentTurnIndex = sessionData.currentTurnIndex;
    if (sessionData.hostId) hostId = sessionData.hostId;
    hostElectionDone = !!hostId;
    marcasEnTurnoActual = [];
    actualizarUIEstado();
}

// ============================================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================================

window.initTurnUI = initTurnUI;
window.puedeMarcar = puedeMarcar;
window.esMiTurno = esMiTurno;
window.registrarMarca = registrarMarca;
window.marcaDeshecha = marcaDeshecha;
window.iniciarPartida = iniciarPartida;
window.finalizarTurno = finalizarTurno;
window.reiniciarPartida = reiniciarPartida;
window.actualizarUIEstado = actualizarUIEstado;
window.manejarMensajeTurno = manejarMensajeTurno;
window.establecerAnfitrion = establecerAnfitrion;
window.agregarJugadorTurno = agregarJugadorTurno;
window.restaurarEstadoDesdeSesion = restaurarEstadoDesdeSesion;
window.sincronizarEstado = sincronizarEstado;
window.aplicarAvanceTurno = aplicarAvanceTurno;
window.notificarPresenciaOtroJugador = notificarPresenciaOtroJugador;

// Variables globales para que otros módulos las lean
window.gameState = gameState;
window.turnOrder = turnOrder;
window.currentTurnIndex = currentTurnIndex;
window.hostId = hostId;
window.marcasEnTurnoActual = marcasEnTurnoActual;

console.log('🔄 Sistema de turnos cargado correctamente');