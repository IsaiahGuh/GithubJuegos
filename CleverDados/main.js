// ============================================================
// MAIN - CLEVERDADOS (VERSIÓN SIMPLIFICADA - SIN FALLBACK)
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
var enModoZoom = false;

// ============================================================
// LEER PARÁMETROS DE URL
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
// SISTEMA DE PUNTUACIÓN - USANDO PUNTAJES.JS
// ============================================================

function calcularPuntajes() {
    if (typeof PUNTAJES === 'undefined' || !PUNTAJES) {
        console.error('❌ PUNTAJES no está disponible');
        return;
    }
    
    var total = PUNTAJES.calcularTotal();
    window.puntajeTotal = total;
    
    // Actualizar UI de cada área
    var areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
    for (var i = 0; i < areas.length; i++) {
        var area = areas[i];
        var element = document.getElementById('score-' + area);
        if (element) {
            element.textContent = puntajesAreas[area] || 0;
        }
    }
    
    // Actualizar total y bonificaciones
    var totalElement = document.getElementById('score-total');
    var bonusElement = document.getElementById('bonus-display');
    if (totalElement) totalElement.textContent = total;
    if (bonusElement) bonusElement.textContent = puntosBonificacion || 0;
    
    // Actualizar leaderboard
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
    
    // Sincronizar multijugador
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
// ZOOM DE ÁREA
// ============================================================

function abrirZoomArea(area) {
    if (area === 'gris') return;
    
    console.log('🔍 Abriendo zoom de: ' + area);
    
    var modal = document.getElementById('zoomAreaModal');
    var content = document.getElementById('zoomAreaContent');
    
    if (!modal || !content) {
        console.error('Modal o content no encontrado');
        return;
    }
    
    var areaElement = document.getElementById('area-' + area);
    if (!areaElement) {
        console.error('Área ' + area + ' no encontrada');
        return;
    }
    
    var areaContent = areaElement.querySelector('#area-' + area + '-content');
    if (!areaContent) {
        content.innerHTML = '<p style="color: var(--text-muted);">Contenido no disponible</p>';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        enModoZoom = true;
        return;
    }
    
    var clone = areaContent.cloneNode(true);
    content.innerHTML = '';
    content.appendChild(clone);
    
    if (area === 'verde' || area === 'naranja' || area === 'morado') {
        reorganizarEnDosFilas(content, area);
    }
    
    enModoZoom = true;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    setTimeout(function() {
        if (typeof actualizarVisualesZoom === 'function') {
            actualizarVisualesZoom();
        }
    }, 50);
}

function cerrarZoomArea() {
    var modal = document.getElementById('zoomAreaModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        enModoZoom = false;
        
        if (typeof actualizarVisuales === 'function') actualizarVisuales();
        if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
            PUNTAJES.calcularTotal();
        }
        if (typeof renderizarLeaderboard === 'function') {
            renderizarLeaderboard();
        }
    }
}

function reorganizarEnDosFilas(container, area) {
    var fila = container.querySelector('.' + area + '-fila');
    if (!fila) return;
    
    var wrappers = fila.querySelectorAll('.' + area + '-celda-wrapper');
    if (wrappers.length === 0) return;
    
    fila.innerHTML = '';
    fila.style.display = 'flex';
    fila.style.flexWrap = 'wrap';
    fila.style.gap = '6px';
    fila.style.justifyContent = 'center';
    fila.style.width = '100%';
    fila.style.maxWidth = '650px';
    
    for (var i = 0; i < wrappers.length; i++) {
        var w = wrappers[i];
        w.style.flex = '0 0 auto';
        if (i >= 6) {
            w.style.marginTop = '6px';
        }
        fila.appendChild(w);
    }
    
    var bonusFila = container.querySelector('.' + area + '-bonus-fila');
    if (bonusFila) {
        var bonusItems = bonusFila.querySelectorAll('.' + area + '-bonus-item');
        if (bonusItems.length > 0) {
            bonusFila.innerHTML = '';
            bonusFila.style.display = 'flex';
            bonusFila.style.flexWrap = 'wrap';
            bonusFila.style.gap = '6px';
            bonusFila.style.justifyContent = 'center';
            bonusFila.style.width = '100%';
            bonusFila.style.maxWidth = '650px';
            
            for (var j = 0; j < bonusItems.length; j++) {
                var item = bonusItems[j];
                item.style.flex = '0 0 auto';
                if (j >= 6) {
                    item.style.marginTop = '6px';
                }
                bonusFila.appendChild(item);
            }
        }
    }
}

function actualizarVisualesZoom() {
    var zoomContent = document.getElementById('zoomAreaContent');
    if (!zoomContent) return;
    
    var celdas = zoomContent.querySelectorAll('.cell');
    for (var i = 0; i < celdas.length; i++) {
        var cell = celdas[i];
        var area = cell.dataset.area;
        var fila = cell.dataset.fila;
        var col = cell.dataset.col;
        var index = cell.dataset.index;
        
        if (!area) continue;
        
        var id = '';
        
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

function propagarClickZoom(cell) {
    if (cell.classList.contains('marcada') || cell.classList.contains('pre-marcada')) {
        return false;
    }
    
    var area = cell.dataset.area;
    var fila = cell.dataset.fila;
    var col = cell.dataset.col;
    var index = cell.dataset.index;
    
    if (!area) return false;
    
    var resultado = false;
    
    try {
        if (area === 'amarilla' && fila !== undefined && col !== undefined) {
            if (typeof manejarClickAmarilla === 'function') {
                manejarClickAmarilla(parseInt(fila), parseInt(col));
                resultado = true;
            }
        } else if (area === 'azul' && index !== undefined) {
            if (typeof manejarClickAzul === 'function') {
                manejarClickAzul(parseInt(index));
                resultado = true;
            }
        } else if (area === 'verde' && index !== undefined) {
            if (typeof manejarClickVerde === 'function') {
                manejarClickVerde(parseInt(index));
                resultado = true;
            }
        } else if (area === 'naranja' && index !== undefined) {
            if (typeof manejarClickNaranja === 'function') {
                manejarClickNaranja(parseInt(index));
                resultado = true;
            }
        } else if (area === 'morado' && index !== undefined) {
            if (typeof manejarClickMorado === 'function') {
                manejarClickMorado(parseInt(index));
                resultado = true;
            }
        }
    } catch(e) {
        console.warn('Error al propagar click:', e);
        return false;
    }
    
    if (resultado) {
        if (typeof actualizarVisualesZoom === 'function') actualizarVisualesZoom();
        if (typeof actualizarVisuales === 'function') actualizarVisuales();
        if (typeof PUNTAJES !== 'undefined' && PUNTAJES) PUNTAJES.calcularTotal();
        if (typeof renderizarLeaderboard === 'function') renderizarLeaderboard();
    }
    
    return resultado;
}

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
        alert('Código de sala inválido. Asegúrate de tener un código de 4 caracteres.');
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
window.actualizarVisualesZoom = actualizarVisualesZoom;
window.reiniciarTablero = reiniciarTablero;
window.mostrarModalReinicio = mostrarModalReinicio;
window.cerrarModal = cerrarModal;
window.confirmarReinicio = confirmarReinicio;
window.unirseSala = unirseSala;
window.abrirZoomArea = abrirZoomArea;
window.cerrarZoomArea = cerrarZoomArea;
window.propagarClickZoom = propagarClickZoom;
window.reorganizarEnDosFilas = reorganizarEnDosFilas;
window.mostrarFeedbackError = mostrarFeedbackError;

// Exponer variables
window.historialMovimientos = historialMovimientos;
window.puntajeTotal = puntajeTotal;
window.puntosBonificacion = puntosBonificacion;
window.puntajesAreas = puntajesAreas;
window.enModoZoom = enModoZoom;

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando CleverDados...');
    
    mostrarDatosLobby();
    
    if (typeof inicializarAreaGris === 'function') inicializarAreaGris();
    if (typeof inicializarAreaAmarilla === 'function') inicializarAreaAmarilla();
    if (typeof inicializarAreaAzul === 'function') inicializarAreaAzul();
    if (typeof inicializarAreaVerde === 'function') inicializarAreaVerde();
    if (typeof inicializarAreaNaranja === 'function') inicializarAreaNaranja();
    if (typeof inicializarAreaMorado === 'function') inicializarAreaMorado();
    
    // Event listener para propagar clicks desde el zoom
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
            propagarClickZoom(cell);
        }
    });
    
    // Cerrar zoom con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarZoomArea();
            if (typeof cerrarZoom === 'function') cerrarZoom();
        }
    });
    
    // Cerrar zoom al hacer clic fuera
    var zoomModal = document.getElementById('zoomAreaModal');
    if (zoomModal) {
        zoomModal.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarZoomArea();
            }
        });
    }
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    }
    
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
    
    console.log('🧠 CleverDados inicializado correctamente');
});