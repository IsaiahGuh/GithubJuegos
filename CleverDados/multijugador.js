// ============================================================
// MULTIJUGADOR.JS - RECIBIR PARÁMETROS DEL LAUNCHER
// ============================================================

// ===== DETECTAR PARÁMETROS DE URL =====
const urlParams = new URLSearchParams(window.location.search);
const nombreDesdeURL = urlParams.get('nombre');
const salaDesdeURL = urlParams.get('sala');

// ===== GUARDAR EN LOCALSTORAGE =====
if (nombreDesdeURL) {
    localStorage.setItem('cleverdados_nombre', nombreDesdeURL);
}

if (salaDesdeURL && salaDesdeURL.length >= 4) {
    localStorage.setItem('cleverdados_sala', salaDesdeURL.toUpperCase());
}

// ===== OBTENER DATOS GUARDADOS =====
function obtenerNombreGuardado() {
    return localStorage.getItem('cleverdados_nombre') || '';
}

function obtenerSalaGuardada() {
    return localStorage.getItem('cleverdados_sala') || '';
}

// ===== VARIABLES GLOBALES =====
let clienteMQTT = null;
let miId = Math.random().toString(36).substr(2, 9);
let salaActual = null;
let datosJugadores = {};
let miNombre = "";

// ============================================================
// FUNCIONES DE LOBBY (SOLO MULTIJUGADOR)
// ============================================================

function obtenerNombre() {
    return localStorage.getItem('cleverdados_nombre') || window.miNombre || "Jugador";
}

function volverLobby() {
    document.getElementById('joinModal').style.display = 'none';
    document.getElementById('lobbyModal').style.display = 'flex';
}

// ============================================================
// CONEXIÓN MQTT
// ============================================================

function conectarSala(codigo) {
    mostrarCargando("Conectando con la sala...");
    
    clienteMQTT = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    clienteMQTT.on('connect', () => {
        salaActual = codigo;
        const topic = `cleverdados_app/room/${codigo}`;
        clienteMQTT.subscribe(topic);
        
        actualizarDatosPropios();
        unirseExitoso(codigo);
        broadcastPuntaje('join');
    });

    clienteMQTT.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            
            datosJugadores[data.id] = { 
                nombre: data.nombre, 
                puntaje: data.puntaje,
                movimientos: data.movimientos || [],
                valoresNaranja: data.valoresNaranja || null,
                valoresMorado: data.valoresMorado || null,
                puntajesPorArea: data.puntajesPorArea || null
            };
            
            if (typeof renderizarLeaderboard === 'function') {
                renderizarLeaderboard();
            }

            if (data.accion === 'join') {
                broadcastPuntaje('sync');
            }
        } catch(e) {
            console.error("Mensaje inválido", e);
        }
    });

    clienteMQTT.on('error', (err) => {
        ocultarCargando();
        alert("Error de red. Revisa tu internet.");
    });
}

// ============================================================
// ACTUALIZAR DATOS PROPIOS
// ============================================================

function actualizarDatosPropios() {
    let puntajesPorArea = null;
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        puntajesPorArea = PUNTAJES.obtenerPuntajesPorArea();
    } else {
        puntajesPorArea = {
            gris: typeof puntajesAreas !== 'undefined' ? puntajesAreas.gris || 0 : 0,
            amarilla: typeof puntajesAreas !== 'undefined' ? puntajesAreas.amarilla || 0 : 0,
            azul: typeof puntajesAreas !== 'undefined' ? puntajesAreas.azul || 0 : 0,
            verde: typeof puntajesAreas !== 'undefined' ? puntajesAreas.verde || 0 : 0,
            naranja: typeof puntajesAreas !== 'undefined' ? puntajesAreas.naranja || 0 : 0,
            morado: typeof puntajesAreas !== 'undefined' ? puntajesAreas.morado || 0 : 0,
            bonificacion: puntosBonificacion || 0,
            lobos: (typeof lobos !== 'undefined' && lobos) ? lobos.totalPuntos || 0 : 0,
            total: puntajeTotal || 0
        };
    }
    
    datosJugadores[miId] = { 
        nombre: miNombre, 
        puntaje: puntajesPorArea.total || 0,
        movimientos: [...historialMovimientos],
        valoresNaranja: typeof valoresNaranja !== 'undefined' ? [...valoresNaranja] : null,
        valoresMorado: typeof valoresMorado !== 'undefined' ? [...valoresMorado] : null,
        puntajesPorArea: puntajesPorArea
    };
}

// ============================================================
// BROADCAST
// ============================================================

function broadcastPuntaje(accion = 'sync') {
    actualizarDatosPropios();
    
    let puntajesPorArea = null;
    let miPuntajeTotal = 0;
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        puntajesPorArea = PUNTAJES.obtenerPuntajesPorArea();
        miPuntajeTotal = puntajesPorArea.total || 0;
    } else {
        let total = 0;
        const areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
        areas.forEach(area => {
            total += puntajesAreas[area] || 0;
        });
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
        movimientos: [...historialMovimientos],
        valoresNaranja: typeof valoresNaranja !== 'undefined' ? [...valoresNaranja] : null,
        valoresMorado: typeof valoresMorado !== 'undefined' ? [...valoresMorado] : null,
        puntajesPorArea: puntajesPorArea
    };
    
    if (clienteMQTT && salaActual) {
        const topic = `cleverdados_app/room/${salaActual}`;
        const payload = JSON.stringify({
            accion: accion,
            id: miId,
            nombre: miNombre,
            puntaje: miPuntajeTotal,
            movimientos: [...historialMovimientos],
            valoresNaranja: typeof valoresNaranja !== 'undefined' ? [...valoresNaranja] : null,
            valoresMorado: typeof valoresMorado !== 'undefined' ? [...valoresMorado] : null,
            puntajesPorArea: puntajesPorArea
        });
        clienteMQTT.publish(topic, payload);
    }
    
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
}

// ============================================================
// UI DE SALA
// ============================================================

function unirseExitoso(codigo) {
    ocultarCargando();
    document.getElementById('lobbyModal').style.display = 'none';
    document.getElementById('joinModal').style.display = 'none';
    
    const info = document.getElementById('roomInfoDisplay');
    if (info) {
        info.style.display = 'inline-block';
        info.textContent = 'SALA: ' + codigo;
    }
    
    const leaderboardPanel = document.getElementById('leaderboardPanel');
    if (leaderboardPanel) {
        leaderboardPanel.style.display = 'flex';
    }
    
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
}

// ============================================================
// UTILIDADES
// ============================================================

function mostrarCargando(texto) {
    const loadingText = document.getElementById('loadingText');
    const loadingModal = document.getElementById('loadingModal');
    if (loadingText) loadingText.textContent = texto;
    if (loadingModal) loadingModal.style.display = 'flex';
}

function ocultarCargando() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) loadingModal.style.display = 'none';
}

// ============================================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 CleverDados - Inicializando...');
    
    // Los datos ya vienen de los parámetros URL
    miNombre = localStorage.getItem('cleverdados_nombre') || window.miNombre || 'Jugador';
    
    console.log(`👤 Nombre: ${miNombre}`);
    console.log(`🏠 Sala: ${localStorage.getItem('cleverdados_sala') || '---'}`);
});

// ============================================================
// EXPORTAR
// ============================================================

window.clienteMQTT = clienteMQTT;
window.miId = miId;
window.salaActual = salaActual;
window.datosJugadores = datosJugadores;
window.miNombre = miNombre;
window.obtenerNombre = obtenerNombre;
window.obtenerNombreGuardado = obtenerNombreGuardado;
window.obtenerSalaGuardada = obtenerSalaGuardada;
window.volverLobby = volverLobby;
window.conectarSala = conectarSala;
window.unirseExitoso = unirseExitoso;
window.mostrarCargando = mostrarCargando;
window.ocultarCargando = ocultarCargando;
window.broadcastPuntaje = broadcastPuntaje;
window.actualizarDatosPropios = actualizarDatosPropios;