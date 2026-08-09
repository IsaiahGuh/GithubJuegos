// ============================================================
// ZOOM.JS - SISTEMA DE ZOOM PARA ÁREAS
// ============================================================

var enModoZoom = false;

// ============================================================
// ABRIR ZOOM DE ÁREA
// ============================================================

function abrirZoomArea(area) {
    if (area === 'gris') return;
    
    console.log('Abriendo zoom de: ' + area);
    
    var modal = document.getElementById('zoomAreaModal');
    var content = document.getElementById('zoomAreaContent');
    
    if (!modal || !content) {
        console.error('Modal o content no encontrado');
        return;
    }
    
    var areaElement = document.getElementById('area-' + area);
    if (!areaElement) {
        console.error('Area ' + area + ' no encontrada');
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

// ============================================================
// CERRAR ZOOM DE ÁREA
// ============================================================

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

// ============================================================
// REORGANIZAR EN DOS FILAS (VERDE, NARANJA, MORADO)
// ============================================================

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

// ============================================================
// ACTUALIZAR VISUALES DEL ZOOM
// ============================================================

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
        
        if (estaMarcada) {
            cell.classList.add('marcada');
        } else {
            cell.classList.remove('marcada');
        }
    }
}

// ============================================================
// PROPAGAR CLICK DESDE EL ZOOM
// ============================================================

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

// ============================================================
// EXPORTAR
// ============================================================

window.enModoZoom = enModoZoom;
window.abrirZoomArea = abrirZoomArea;
window.cerrarZoomArea = cerrarZoomArea;
window.reorganizarEnDosFilas = reorganizarEnDosFilas;
window.actualizarVisualesZoom = actualizarVisualesZoom;
window.propagarClickZoom = propagarClickZoom;