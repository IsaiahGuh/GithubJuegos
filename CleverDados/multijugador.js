// ============================================================
// MULTIJUGADOR.JS - CLEVERDADOS
// ============================================================

var clienteMQTT = null;
var miId = Math.random().toString(36).substr(2, 9);
var salaActual = null;
var datosJugadores = {};
var miNombre = "";
var pendingClaim = null;
var claimResolved = false;

// ============================================================
// FUNCIONES DE LOBBY
// ============================================================

function obtenerNombre() {
    return localStorage.getItem('cleverdados_nombre_prefill') || window.miNombre || "Jugador";
}

function volverLobby() {
    document.getElementById('joinModal').style.display = 'none';
    document.getElementById('lobbyModal').style.display = 'flex';
}

// ============================================================
// CONEXION MQTT
// ============================================================

function conectarSala(codigo, isReconnect) {
    if (isReconnect === undefined) isReconnect = false;
    
    // Asegurar que las variables globales estén definidas
    if (!miNombre) {
        miNombre = localStorage.getItem('cleverdados_nombre_prefill') || 'Jugador';
    }
    if (!miId) {
        miId = Math.random().toString(36).substr(2, 9);
    }
    
    // Sincronizar con window
    window.miNombre = miNombre;
    window.miId = miId;
    window.currentRoom = codigo;
    salaActual = codigo;
    
    mostrarCargando(isReconnect ? 'Reconectando a la sala...' : 'Conectando con la sala...');
    claimResolved = isReconnect;
    pendingClaim = null;

    clienteMQTT = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    clienteMQTT.on('connect', function() {
        salaActual = codigo;
        window.currentRoom = codigo;
        var topic = 'cleverdados_app/room/' + codigo;
        clienteMQTT.subscribe(topic);
        
        datosJugadores[miId] = { 
            nombre: miNombre, 
            puntaje: 0,
            movimientos: [],
            valoresNaranja: null,
            valoresMorado: null,
            puntajesPorArea: null
        };
        
        unirseExitoso(codigo);
        broadcastPuntaje('join');
    });

    clienteMQTT.on('message', function(topic, message) {
        try {
            var data = JSON.parse(message.toString());
            
            if (data.action === 'claim_offer') {
                if (data.targetId === miId && !claimResolved && historialMovimientos.length === 0 && (data.moves || []).length > 0) {
                    claimResolved = true;
                    pendingClaim = { 
                        oldId: data.offeredId, 
                        name: data.name, 
                        score: data.score, 
                        moves: data.moves || [] 
                    };
                    if (typeof showClaimModal === 'function') {
                        showClaimModal(pendingClaim);
                    }
                }
                return;
            }

            if (data.action === 'remove') {
                delete datosJugadores[data.id];
                if (typeof renderizarLeaderboard === 'function') {
                    renderizarLeaderboard();
                }
                return;
            }

            if (data.action === 'reset_all') {
                historialMovimientos = [];
                window.historialMovimientos = historialMovimientos;
                if (typeof actualizarVisuales === 'function') {
                    actualizarVisuales();
                }
                if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
                    PUNTAJES.calcularTotal();
                }
                if (typeof renderizarLeaderboard === 'function') {
                    renderizarLeaderboard();
                }
                return;
            }

            if (data.id === miId) return;

            if (!claimResolved && data.nombre === miNombre && historialMovimientos.length === 0 && (data.moves || []).length > 0) {
                claimResolved = true;
                pendingClaim = { 
                    oldId: data.id, 
                    name: data.nombre, 
                    score: data.puntaje || 0, 
                    moves: data.moves || [] 
                };
                if (typeof showClaimModal === 'function') {
                    showClaimModal(pendingClaim);
                }
                return;
            }

            datosJugadores[data.id] = { 
                nombre: data.nombre, 
                puntaje: data.puntaje || 0,
                movimientos: data.moves || [],
                valoresNaranja: data.valoresNaranja || null,
                valoresMorado: data.valoresMorado || null,
                puntajesPorArea: data.puntajesPorArea || null
            };
            
            if (typeof renderizarLeaderboard === 'function') {
                renderizarLeaderboard();
            }

            if (data.action === 'join') {
                var cachedMatch = null;
                for (var id in datosJugadores) {
                    if (id !== data.id && datosJugadores[id].nombre === data.nombre && (datosJugadores[id].movimientos || []).length > 0) {
                        cachedMatch = id;
                        break;
                    }
                }
                if (cachedMatch) {
                    broadcastClaimOffer(data.id, cachedMatch);
                }
            }
        } catch(e) { 
            console.error('Mensaje invalido', e); 
        }
    });

    clienteMQTT.on('error', function(err) {
        ocultarCargando();
        alert('Error de red. Revisa tu internet.');
    });
}

// ============================================================
// ACTUALIZAR DATOS PROPIOS
// ============================================================

function actualizarDatosPropios() {
    var puntajesPorArea = null;
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        puntajesPorArea = PUNTAJES.obtenerPuntajesPorArea();
    } else {
        var total = 0;
        var areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
        for (var i = 0; i < areas.length; i++) {
            var area = areas[i];
            total += puntajesAreas[area] || 0;
        }
        total += puntosBonificacion || 0;
        if (typeof lobos !== 'undefined' && lobos) {
            total += lobos.totalPuntos || 0;
        }
        
        puntajesPorArea = {
            gris: puntajesAreas.gris || 0,
            amarilla: puntajesAreas.amarilla || 0,
            azul: puntajesAreas.azul || 0,
            verde: puntajesAreas.verde || 0,
            naranja: puntajesAreas.naranja || 0,
            morado: puntajesAreas.morado || 0,
            bonificacion: puntosBonificacion || 0,
            lobos: (typeof lobos !== 'undefined' && lobos) ? lobos.totalPuntos || 0 : 0,
            total: total
        };
    }
    
    datosJugadores[miId] = { 
        nombre: miNombre, 
        puntaje: puntajesPorArea.total || 0,
        movimientos: historialMovimientos.slice(),
        valoresNaranja: typeof valoresNaranja !== 'undefined' ? valoresNaranja.slice() : null,
        valoresMorado: typeof valoresMorado !== 'undefined' ? valoresMorado.slice() : null,
        puntajesPorArea: puntajesPorArea
    };
}

// ============================================================
// BROADCAST
// ============================================================

function broadcastPuntaje(accion) {
    if (accion === undefined) accion = 'sync';
    actualizarDatosPropios();
    
    var puntajesPorArea = null;
    var miPuntajeTotal = 0;
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        puntajesPorArea = PUNTAJES.obtenerPuntajesPorArea();
        miPuntajeTotal = puntajesPorArea.total || 0;
    } else {
        var total = 0;
        var areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
        for (var i = 0; i < areas.length; i++) {
            var area = areas[i];
            total += puntajesAreas[area] || 0;
        }
        total += puntosBonificacion || 0;
        if (typeof lobos !== 'undefined' && lobos) {
            total += lobos.totalPuntos || 0;
        }
        miPuntajeTotal = total;
        
        puntajesPorArea = {
            gris: puntajesAreas.gris || 0,
            amarilla: puntajesAreas.amarilla || 0,
            azul: puntajesAreas.azul || 0,
            verde: puntajesAreas.verde || 0,
            naranja: puntajesAreas.naranja || 0,
            morado: puntajesAreas.morado || 0,
            bonificacion: puntosBonificacion || 0,
            lobos: (typeof lobos !== 'undefined' && lobos) ? lobos.totalPuntos || 0 : 0,
            total: miPuntajeTotal
        };
    }
    
    if (typeof puntajeTotal !== 'undefined') {
        window.puntajeTotal = miPuntajeTotal;
    }
    
    datosJugadores[miId] = { 
        nombre: miNombre, 
        puntaje: miPuntajeTotal,
        movimientos: historialMovimientos.slice(),
        valoresNaranja: typeof valoresNaranja !== 'undefined' ? valoresNaranja.slice() : null,
        valoresMorado: typeof valoresMorado !== 'undefined' ? valoresMorado.slice() : null,
        puntajesPorArea: puntajesPorArea
    };
    
    if (clienteMQTT && salaActual) {
        var topic = 'cleverdados_app/room/' + salaActual;
        var payload = JSON.stringify({
            accion: accion,
            id: miId,
            nombre: miNombre,
            puntaje: miPuntajeTotal,
            moves: historialMovimientos.slice(),
            valoresNaranja: typeof valoresNaranja !== 'undefined' ? valoresNaranja.slice() : null,
            valoresMorado: typeof valoresMorado !== 'undefined' ? valoresMorado.slice() : null,
            puntajesPorArea: puntajesPorArea
        });
        clienteMQTT.publish(topic, payload);
    }
    
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
}

// ============================================================
// BROADCAST ESPECIALES
// ============================================================

function broadcastReset() {
    if (clienteMQTT && salaActual) {
        var topic = 'cleverdados_app/room/' + salaActual;
        var payload = JSON.stringify({
            action: 'reset_all',
            id: miId,
            name: miNombre
        });
        clienteMQTT.publish(topic, payload);
    }
}

function broadcastRemove(idToRemove) {
    if (clienteMQTT && salaActual) {
        var topic = 'cleverdados_app/room/' + salaActual;
        var payload = JSON.stringify({
            action: 'remove',
            id: idToRemove
        });
        clienteMQTT.publish(topic, payload);
    }
}

function broadcastClaimOffer(targetId, offeredId) {
    if (clienteMQTT && salaActual) {
        var cached = datosJugadores[offeredId];
        if (!cached) return;
        var topic = 'cleverdados_app/room/' + salaActual;
        var payload = JSON.stringify({
            action: 'claim_offer',
            targetId: targetId,
            offeredId: offeredId,
            name: cached.nombre,
            score: cached.puntaje || 0,
            moves: cached.movimientos || []
        });
        clienteMQTT.publish(topic, payload);
    }
}

// ============================================================
// UI DE SALA
// ============================================================

function unirseExitoso(codigo) {
    ocultarCargando();
    
    // Asegurar que ambas variables estén sincronizadas
    salaActual = codigo;
    window.currentRoom = codigo;
    
    document.getElementById('lobbyModal').style.display = 'none';
    document.getElementById('joinModal').style.display = 'none';
    
    var info = document.getElementById('roomInfoDisplay');
    if (info) {
        info.style.display = 'inline-block';
        info.textContent = 'SALA: ' + codigo;
    }
    
    var leaderboardPanel = document.getElementById('leaderboardPanel');
    if (leaderboardPanel) {
        leaderboardPanel.style.display = 'flex';
    }
    
    // Guardar sesion despues de tener todos los datos
    if (typeof saveSession === 'function') {
        saveSession();
    }
    
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
}

// ============================================================
// UTILIDADES
// ============================================================

function mostrarCargando(texto) {
    var loadingText = document.getElementById('loadingText');
    var loadingModal = document.getElementById('loadingModal');
    if (loadingText) loadingText.textContent = texto;
    if (loadingModal) loadingModal.style.display = 'flex';
}

function ocultarCargando() {
    var loadingModal = document.getElementById('loadingModal');
    if (loadingModal) loadingModal.style.display = 'none';
}

// ============================================================
// INICIALIZACION AUTOMATICA
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('CleverDados - Inicializando multijugador...');
    miNombre = localStorage.getItem('cleverdados_nombre_prefill') || window.miNombre || 'Jugador';
});

// ============================================================
// EXPORTAR
// ============================================================

window.clienteMQTT = clienteMQTT;
window.miId = miId;
window.salaActual = salaActual;
window.datosJugadores = datosJugadores;
window.miNombre = miNombre;
window.pendingClaim = pendingClaim;
window.claimResolved = claimResolved;
window.obtenerNombre = obtenerNombre;
window.volverLobby = volverLobby;
window.conectarSala = conectarSala;
window.unirseExitoso = unirseExitoso;
window.mostrarCargando = mostrarCargando;
window.ocultarCargando = ocultarCargando;
window.broadcastPuntaje = broadcastPuntaje;
window.broadcastReset = broadcastReset;
window.broadcastRemove = broadcastRemove;
window.broadcastClaimOffer = broadcastClaimOffer;
window.actualizarDatosPropios = actualizarDatosPropios;