// ============================================================
// MAIN - CLEVERDADOS (VERSION SIMPLIFICADA - SIN FALLBACK)
// ============================================================

// Estado global del juego
var historialMovimientos = [];
var puntajeTotal = 0;
var puntosBonificacion = 0;
var puntajesAreas = {
    gris: 0,
    amarilla: 0,
    azul: 0,
    verde: 0,
    naranja: 0,
    morado: 0
};

var AREAS = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];

// ============================================================
// LEER PARAMETROS DE URL
// ============================================================

function obtenerParametrosURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        nombre: params.get('nombre') || '',
        sala: params.get('sala') || ''
    };
}

// ============================================================
// MOSTRAR DATOS EN EL MODAL
// ============================================================

function mostrarDatosLobby() {
    const params = obtenerParametrosURL();
    const displayName = document.getElementById('displayName');
    const displayRoom = document.getElementById('displayRoom');
    
    if (displayName) {
        displayName.textContent = params.nombre || 'Jugador';
    }
    if (displayRoom) {
        displayRoom.textContent = params.sala || '----';
    }
    
    window.miNombre = params.nombre || 'Jugador';
    window.salaRecibida = params.sala || '';
}

// ============================================================
// SISTEMA DE PUNTUACION - USANDO PUNTAJES.JS
// ============================================================

function calcularPuntajes() {
    if (typeof PUNTAJES === 'undefined' || !PUNTAJES) {
        console.error('PUNTAJES no esta disponible');
        return;
    }
    
    var total = PUNTAJES.calcularTotal();
    window.puntajeTotal = total;
    
    var areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
    for (var i = 0; i < areas.length; i++) {
        var area = areas[i];
        var element = document.getElementById('score-' + area);
        if (element) {
            element.textContent = puntajesAreas[area] || 0;
        }
    }
    
    var totalElement = document.getElementById('score-total');
    var bonusElement = document.getElementById('bonus-display');
    if (totalElement) totalElement.textContent = total;
    if (bonusElement) bonusElement.textContent = puntosBonificacion || 0;
    
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// ACTUALIZAR VISUALES
// ============================================================

function actualizarVisuales() {
    var celdas = document.querySelectorAll('.cell');
    for (var i = 0; i < celdas.length; i++) {
        var cell = celdas[i];
        var area = cell.dataset.area;
        if (!area || area === 'gris') continue;
        
        var id = '';
        var fila = cell.dataset.fila;
        var col = cell.dataset.col;
        var index = cell.dataset.index;
        
        if (area === 'amarilla' && fila !== undefined && col !== undefined) {
            id = 'amarilla-' + fila + '-' + col;
        } else if (area === 'azul' && index !== undefined) {
            id = 'azul-tabla-' + index;
        } else if (area === 'verde' && index !== undefined) {
            id = 'verde-tabla-' + index;
        } else if (area === 'naranja' && index !== undefined) {
            id = 'naranja-' + index;
        } else if (area === 'morado' && index !== undefined) {
            id = 'morado-' + index;
        }
        
        var estaMarcada = id ? historialMovimientos.includes(id) : false;
        cell.classList.toggle('marcada', estaMarcada);
    }
}

// ============================================================
// MOSTRAR FEEDBACK DE ERROR
// ============================================================

function mostrarFeedbackError(cell) {
    if (!cell) return;
    cell.style.borderColor = '#ff4444';
    cell.style.transition = 'border-color 0.3s';
    setTimeout(function() {
        cell.style.borderColor = '';
    }, 600);
}

// ============================================================
// REINICIAR TABLERO
// ============================================================

function reiniciarTablero() {
    historialMovimientos = [];
    puntosBonificacion = 0;
    puntajesAreas = {
        gris: 0,
        amarilla: 0,
        azul: 0,
        verde: 0,
        naranja: 0,
        morado: 0
    };
    
    if (typeof window.limpiarPilaMovimientos === 'function') {
        window.limpiarPilaMovimientos();
    }
    
    if (typeof resetAreaGris === 'function') resetAreaGris();
    if (typeof resetAreaAmarilla === 'function') resetAreaAmarilla();
    if (typeof resetAreaAzul === 'function') resetAreaAzul();
    if (typeof resetAreaVerde === 'function') resetAreaVerde();
    if (typeof resetAreaNaranja === 'function') resetAreaNaranja();
    if (typeof resetAreaMorado === 'function') resetAreaMorado();
    
    document.querySelectorAll('.cell.marcada').forEach(function(cell) {
        cell.classList.remove('marcada');
    });
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    }
    
    actualizarVisuales();
    
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// FUNCIONES DE UI
// ============================================================

function mostrarModalReinicio() {
    document.getElementById('confirmModal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

function confirmarReinicio() {
    reiniciarTablero();
    cerrarModal();
}

// ============================================================
// UNIRSE A SALA (MULTIJUGADOR)
// ============================================================

function unirseSala() {
    const params = obtenerParametrosURL();
    const nombre = params.nombre || 'Jugador';
    const codigo = params.sala || '';
    
    if (!codigo || codigo.length < 4) {
        alert('Codigo de sala invalido. Asegurate de tener un codigo de 4 caracteres.');
        return;
    }
    
    document.getElementById('lobbyModal').style.display = 'none';
    
    window.miNombre = nombre;
    window.salaActual = codigo;
    
    if (typeof datosJugadores !== 'undefined') {
        datosJugadores = {};
        datosJugadores[miId] = {
            nombre: nombre,
            puntaje: 0,
            movimientos: [],
            valoresNaranja: null,
            valoresMorado: null,
            puntajesPorArea: null
        };
    }
    
    if (typeof conectarSala === 'function') {
        conectarSala(codigo);
    }
    
    const info = document.getElementById('roomInfoDisplay');
    if (info) {
        info.style.display = 'inline-block';
        info.textContent = 'SALA: ' + codigo;
    }
    
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
}

// ============================================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================================

window.calcularPuntajes = calcularPuntajes;
window.actualizarVisuales = actualizarVisuales;
window.reiniciarTablero = reiniciarTablero;
window.mostrarModalReinicio = mostrarModalReinicio;
window.cerrarModal = cerrarModal;
window.confirmarReinicio = confirmarReinicio;
window.unirseSala = unirseSala;
window.mostrarFeedbackError = mostrarFeedbackError;

window.historialMovimientos = historialMovimientos;
window.puntajeTotal = puntajeTotal;
window.puntosBonificacion = puntosBonificacion;
window.puntajesAreas = puntajesAreas;

// ============================================================
// INICIALIZACION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando CleverDados...');
    
    mostrarDatosLobby();
    
    if (typeof inicializarAreaGris === 'function') inicializarAreaGris();
    if (typeof inicializarAreaAmarilla === 'function') inicializarAreaAmarilla();
    if (typeof inicializarAreaAzul === 'function') inicializarAreaAzul();
    if (typeof inicializarAreaVerde === 'function') inicializarAreaVerde();
    if (typeof inicializarAreaNaranja === 'function') inicializarAreaNaranja();
    if (typeof inicializarAreaMorado === 'function') inicializarAreaMorado();
    
    document.addEventListener('click', function(e) {
        var cell = e.target.closest('.cell');
        if (!cell) return;
        
        var zoomModal = document.getElementById('zoomAreaModal');
        if (zoomModal && zoomModal.style.display === 'flex' && zoomModal.contains(cell)) {
            if (cell.closest('.modal-numerico-overlay')) {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
            if (typeof propagarClickZoom === 'function') {
                propagarClickZoom(cell);
            }
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (typeof cerrarZoomArea === 'function') cerrarZoomArea();
            if (typeof cerrarZoom === 'function') cerrarZoom();
        }
    });
    
    var zoomModal = document.getElementById('zoomAreaModal');
    if (zoomModal) {
        zoomModal.addEventListener('click', function(e) {
            if (e.target === this) {
                if (typeof cerrarZoomArea === 'function') cerrarZoomArea();
            }
        });
    }
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    }
    
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
    
    console.log('CleverDados inicializado correctamente');
});