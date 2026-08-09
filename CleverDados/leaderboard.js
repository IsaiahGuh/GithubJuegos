// ============================================================
// LEADERBOARD.JS - CLEVERDADOS (CON LOBOS CORREGIDO - SUMADOS AL TOTAL)
// ============================================================

// Colores de las áreas para los dots
const COLORES_AREA = {
    amarilla: '#fdd835',
    azul: '#1e88e5',
    verde: '#43a047',
    naranja: '#ff6f00',
    morado: '#7b1fa2'
};

// ============================================================
// GENERAR MINIATURA AMARILLA ZOOM
// ============================================================
function generarMiniaturaAmarillaZoom(marcas) {
    const filas = 4;
    const columnas = 4;
    let html = '<div class="zoom-area zoom-amarilla">';
    
    for (let f = 0; f < filas; f++) {
        html += '<div class="zoom-fila">';
        for (let c = 0; c < columnas; c++) {
            const id = `amarilla-${f}-${c}`;
            const estaMarcada = marcas.includes(id);
            const esX = f === 0 && c === 3 || f === 1 && c === 2 || f === 2 && c === 1 || f === 3 && c === 0;
            
            let valor = '';
            if (AMARILLA_CONFIG && AMARILLA_CONFIG.filas && AMARILLA_CONFIG.filas[f]) {
                valor = AMARILLA_CONFIG.filas[f].numeros[c] || '';
            }
            
            const clase = estaMarcada ? 'zoom-cell marcada' : (esX ? 'zoom-cell pre-marcada' : 'zoom-cell');
            html += `<div class="${clase}">${valor}</div>`;
        }
        html += '</div>';
    }
    html += '</div>';
    return html;
}

// ============================================================
// GENERAR MINIATURA AZUL ZOOM
// ============================================================
function generarMiniaturaAzulZoom(marcas) {
    const filas = 3;
    const columnas = 4;
    let html = '<div class="zoom-area zoom-azul">';
    
    for (let f = 0; f < filas; f++) {
        html += '<div class="zoom-fila">';
        for (let c = 0; c < columnas; c++) {
            const index = f * 4 + c;
            const id = `azul-tabla-${index}`;
            const estaMarcada = marcas.includes(id);
            const esVacio = (f === 0 && c === 0);
            const clase = estaMarcada ? 'zoom-cell marcada' : (esVacio ? 'zoom-cell vacia' : 'zoom-cell');
            const texto = esVacio ? '' : (TABLA_AZUL && TABLA_AZUL[index] ? TABLA_AZUL[index].valor : '');
            html += `<div class="${clase}">${texto}</div>`;
        }
        html += '</div>';
    }
    html += '</div>';
    return html;
}

// ============================================================
// GENERAR MINIATURA VERDE ZOOM
// ============================================================
function generarMiniaturaVerdeZoom(marcas) {
    const total = 11;
    let html = '<div class="zoom-area zoom-verde">';
    html += '<div class="zoom-fila">';
    
    for (let i = 0; i < total; i++) {
        const id = `verde-tabla-${i}`;
        const estaMarcada = marcas.includes(id);
        const clase = estaMarcada ? 'zoom-cell marcada' : 'zoom-cell';
        const texto = TABLA_VERDE && TABLA_VERDE[i] ? TABLA_VERDE[i].valor : '';
        html += `<div class="${clase}">${texto}</div>`;
    }
    
    html += '</div>';
    html += '</div>';
    return html;
}

// ============================================================
// GENERAR MINIATURA NARANJA ZOOM
// ============================================================
function generarMiniaturaNaranjaZoom(marcas, valores) {
    const total = 11;
    let html = '<div class="zoom-area zoom-naranja">';
    html += '<div class="zoom-fila">';
    
    for (let i = 0; i < total; i++) {
        const id = `naranja-${i}`;
        const estaMarcada = marcas.includes(id);
        const valor = valores && valores[i] ? valores[i] : '';
        const esMultiplicador = typeof NARANJA_CONFIG !== 'undefined' && NARANJA_CONFIG[i] && NARANJA_CONFIG[i].multiplicador > 1;
        const clase = estaMarcada ? 'zoom-cell marcada' : (esMultiplicador ? 'zoom-cell multiplicador' : 'zoom-cell');
        const texto = estaMarcada ? valor : (NARANJA_CONFIG && NARANJA_CONFIG[i] ? NARANJA_CONFIG[i].valor || '' : '');
        html += `<div class="${clase}">${texto}</div>`;
    }
    
    html += '</div>';
    html += '</div>';
    return html;
}

// ============================================================
// GENERAR MINIATURA MORADO ZOOM
// ============================================================
function generarMiniaturaMoradoZoom(marcas, valores) {
    const total = 11;
    let html = '<div class="zoom-area zoom-morado">';
    html += '<div class="zoom-fila">';
    
    for (let i = 0; i < total; i++) {
        const id = `morado-${i}`;
        const estaMarcada = marcas.includes(id);
        const valor = valores && valores[i] ? valores[i] : '';
        const clase = estaMarcada ? 'zoom-cell marcada' : 'zoom-cell';
        const texto = estaMarcada ? valor : '';
        html += `<div class="${clase}">${texto}</div>`;
    }
    
    html += '</div>';
    html += '</div>';
    return html;
}

// ============================================================
// MOSTRAR ZOOM DE ÁREA - CON CIERRE AL CLICAR FUERA
// ============================================================
function mostrarAreaZoom(area, marcasJSON, valoresNaranjaJSON, valoresMoradoJSON) {
    const marcas = JSON.parse(marcasJSON);
    const valoresNaranja = valoresNaranjaJSON !== 'null' ? JSON.parse(valoresNaranjaJSON) : null;
    const valoresMorado = valoresMoradoJSON !== 'null' ? JSON.parse(valoresMoradoJSON) : null;
    
    let html = '';
    let color = '';
    
    switch(area) {
        case 'amarilla':
            color = '#fdd835';
            html = generarMiniaturaAmarillaZoom(marcas);
            break;
        case 'azul':
            color = '#1e88e5';
            html = generarMiniaturaAzulZoom(marcas);
            break;
        case 'verde':
            color = '#43a047';
            html = generarMiniaturaVerdeZoom(marcas);
            break;
        case 'naranja':
            color = '#ff6f00';
            html = generarMiniaturaNaranjaZoom(marcas, valoresNaranja);
            break;
        case 'morado':
            color = '#7b1fa2';
            html = generarMiniaturaMoradoZoom(marcas, valoresMorado);
            break;
        case 'rojo':
            color = '#ff4444';
            html = `
                <div class="zoom-areas-container">
                    <div class="zoom-area-group">
                        <div class="zoom-area-label" style="color: #43a047;">🟩 Verde</div>
                        ${generarMiniaturaVerdeZoom(marcas)}
                    </div>
                    <div class="zoom-area-group">
                        <div class="zoom-area-label" style="color: #ff6f00;">🟧 Naranja</div>
                        ${generarMiniaturaNaranjaZoom(marcas, valoresNaranja)}
                    </div>
                    <div class="zoom-area-group">
                        <div class="zoom-area-label" style="color: #7b1fa2;">🟪 Morado</div>
                        ${generarMiniaturaMoradoZoom(marcas, valoresMorado)}
                    </div>
                </div>
            `;
            break;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'zoom-overlay';
    overlay.id = 'leaderboardZoomOverlay';
    overlay.innerHTML = `
        <div class="zoom-modal" style="border-color: ${color};">
            <div class="zoom-header">
                <div></div>
                <button class="zoom-close" onclick="cerrarZoom()">✕</button>
            </div>
            <div class="zoom-body">
                ${html}
            </div>
        </div>
    `;
    
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarZoom();
        }
    });
    
    document.body.appendChild(overlay);
}

// ============================================================
// CERRAR ZOOM
// ============================================================
function cerrarZoom() {
    const overlay = document.getElementById('leaderboardZoomOverlay');
    if (overlay) {
        overlay.remove();
    }
    const otrosOverlays = document.querySelectorAll('.zoom-overlay:not(#leaderboardZoomOverlay)');
    otrosOverlays.forEach(function(el) { el.remove(); });
}

// ============================================================
// GENERAR TAGS DE PUNTAJES POR ÁREA (INCLUYENDO LOBOS)
// ============================================================
function generarTagsPuntajes(puntajesPorArea, movimientos, valoresNaranja, valoresMorado) {
    const areas = [
        { id: 'amarilla', color: '#fdd835', label: '🟨' },
        { id: 'azul', color: '#1e88e5', label: '🟦' },
        { id: 'verde', color: '#43a047', label: '🟩' },
        { id: 'naranja', color: '#ff6f00', label: '🟧' },
        { id: 'morado', color: '#7b1fa2', label: '🟪' }
    ];
    
    let html = '<div class="puntajes-tags">';
    
    areas.forEach(function(area) {
        let puntos = 0;
        if (puntajesPorArea && puntajesPorArea[area.id] !== undefined) {
            puntos = puntajesPorArea[area.id];
        }
        const color = area.color;
        
        let areaId = area.id;
        if (area.id === 'verde' || area.id === 'naranja' || area.id === 'morado') {
            areaId = 'rojo';
        }
        
        const marcasJSON = JSON.stringify(movimientos || []);
        const valoresNaranjaJSON = JSON.stringify(valoresNaranja || null);
        const valoresMoradoJSON = JSON.stringify(valoresMorado || null);
        
        html += `
            <span class="puntaje-tag" 
                  style="border-color: ${color}; cursor: pointer;"
                  onclick="mostrarAreaZoom('${areaId}', '${marcasJSON}', '${valoresNaranjaJSON}', '${valoresMoradoJSON}')">
                <span class="tag-dot" style="background: ${color}"></span>
                ${puntos}pts
            </span>
        `;
    });
    
    // ============================================================
    // TAG DE LOBOS - OBTENER DATOS DEL OBJETO PUNTAJES POR ÁREA
    // ============================================================
    let cantidadLobos = 0;
    let puntosLobos = 0;
    let valorLobo = 0;
    let colorMenor = 'amarilla';
    
    // Primero intentar obtener de puntajesPorArea.lobosDetalle
    if (puntajesPorArea && puntajesPorArea.lobosDetalle) {
        cantidadLobos = puntajesPorArea.lobosDetalle.cantidad || 0;
        puntosLobos = puntajesPorArea.lobosDetalle.totalPuntos || 0;
        valorLobo = puntajesPorArea.lobosDetalle.valorActual || 0;
        colorMenor = puntajesPorArea.lobosDetalle.colorMenor || 'amarilla';
    } 
    // Fallback: usar la variable global lobos
    else if (typeof lobos !== 'undefined' && lobos) {
        if (typeof actualizarValorLobo === 'function') {
            actualizarValorLobo();
        }
        cantidadLobos = lobos.cantidad || 0;
        puntosLobos = lobos.totalPuntos || 0;
        valorLobo = lobos.valorActual || 0;
        colorMenor = lobos.colorMenor || 'amarilla';
    }
    
    if (cantidadLobos === 0) {
        html += `
            <span class="puntaje-tag lobos-tag" style="border-color: #d32f2f; cursor: default; opacity: 0.6;">
                <span class="tag-dot" style="background: #d32f2f; font-size: 0.8rem; line-height: 1; display: inline-flex; align-items: center; justify-content: center;">
                    ♦
                </span>
                0pts
            </span>
        `;
    } else {
        const coloresMap = {
            'amarilla': '#fdd835',
            'azul': '#1e88e5',
            'verde': '#43a047',
            'naranja': '#ff6f00',
            'morado': '#7b1fa2'
        };
        const colorDot = coloresMap[colorMenor] || '#d32f2f';
        
        html += `
            <span class="puntaje-tag lobos-tag" style="border-color: #d32f2f; cursor: default;">
                <span class="tag-dot" style="background: ${colorDot}; font-size: 1rem; line-height: 1; display: inline-flex; align-items: center; justify-content: center;">
                    ♦
                </span>
                ${cantidadLobos} × ${valorLobo}pts = ${puntosLobos}pts
            </span>
        `;
    }
    
    html += '</div>';
    return html;
}

// ============================================================
// RENDERIZAR LEADERBOARD COMPLETO
// ============================================================
function renderizarLeaderboard() {
    const list = document.getElementById('playersList');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (typeof datosJugadores === 'undefined' || !datosJugadores || Object.keys(datosJugadores).length === 0) {
        list.innerHTML = '<div class="no-players">Esperando jugadores...</div>';
        return;
    }
    
    const jugadores = Object.keys(datosJugadores).map(function(id) {
        return {
            id: id,
            ...datosJugadores[id]
        };
    }).sort(function(a, b) {
        return (b.puntaje || 0) - (a.puntaje || 0);
    });
    
    if (jugadores.length === 0) {
        list.innerHTML = '<div class="no-players">Esperando jugadores...</div>';
        return;
    }
    
    jugadores.forEach(function(j, index) {
        const soyYo = j.id === miId;
        const movimientos = j.movimientos || [];
        
        let puntajesPorArea = j.puntajesPorArea || null;
        
        if (!puntajesPorArea) {
            puntajesPorArea = {
                amarilla: 0,
                azul: 0,
                verde: 0,
                naranja: 0,
                morado: 0,
                total: j.puntaje || 0
            };
        }
        
        // ✅ El puntaje total YA INCLUYE lobos porque viene de PUNTAJES.calcularTotal()
        if (j.puntaje !== undefined && j.puntaje !== null) {
            puntajesPorArea.total = j.puntaje;
        }
        
        let medalla = '';
        if (index === 0) medalla = '🥇';
        else if (index === 1) medalla = '🥈';
        else if (index === 2) medalla = '🥉';
        
        const tags = generarTagsPuntajes(
            puntajesPorArea, 
            movimientos,
            j.valoresNaranja || null,
            j.valoresMorado || null
        );
        
        const card = document.createElement('div');
        card.className = 'player-card' + (soyYo ? ' me' : '');
        
        card.innerHTML = `
            <div class="player-card-header">
                <div class="player-name">
                    ${medalla} ${j.nombre}${soyYo ? ' (Tú)' : ''}
                </div>
                <div class="player-total">
                    🏆 ${puntajesPorArea.total || 0} pts
                </div>
            </div>
            ${tags}
        `;
        
        list.appendChild(card);
    });
}

// ============================================================
// ACTUALIZAR LEADERBOARD
// ============================================================
function actualizarLeaderboard() {
    renderizarLeaderboard();
}

// ============================================================
// INYECTAR ESTILOS
// ============================================================
(function injectLeaderboardStyles() {
    const LEADERBOARD_STYLES = `
        .leaderboard { display: flex; flex-direction: column; gap: 8px; }
        .leaderboard h3 { font-size: 0.85rem; color: var(--text-muted); text-align: center; text-transform: uppercase; letter-spacing: 1px; }
        .no-players { color: var(--text-muted); text-align: center; padding: 20px; font-size: 0.9rem; }
        .player-card { background: var(--bg-box); border-radius: 10px; padding: 10px 12px; border: 1px solid var(--border-color); transition: all 0.2s; }
        .player-card.me { border-left: 4px solid var(--color-azul); }
        .player-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .player-name { font-weight: bold; font-size: 0.9rem; color: #fff; }
        .player-total { font-weight: bold; font-size: 0.9rem; color: #ffd700; }
        .puntajes-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
        .puntaje-tag { font-size: 0.6rem; padding: 3px 10px 3px 6px; border-radius: 12px; border: 2px solid var(--border-color); background: var(--bg-main); color: var(--text-muted); display: flex; align-items: center; gap: 4px; font-weight: bold; transition: all 0.15s; cursor: pointer; user-select: none; }
        .puntaje-tag:hover { transform: scale(1.08); background: var(--bg-box); box-shadow: 0 2px 12px rgba(0,0,0,0.3); }
        .tag-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
        .lobos-tag { border-color: #d32f2f !important; background: rgba(211, 47, 47, 0.08) !important; font-weight: bold !important; cursor: default !important; }
        .lobos-tag:hover { transform: none !important; background: rgba(211, 47, 47, 0.15) !important; }
        .zoom-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.92); z-index: 10000; display: flex; justify-content: center; align-items: center; padding: 20px; animation: zoomFadeIn 0.25s ease; }
        @keyframes zoomFadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .zoom-modal { background: var(--bg-panel); border-radius: 16px; padding: 20px 24px 24px 24px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; border: 2px solid var(--border-color); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9); }
        .zoom-header { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 12px; }
        .zoom-close { background: none; border: none; color: var(--text-muted); font-size: 1.8rem; cursor: pointer; padding: 0 8px; transition: color 0.15s; line-height: 1; }
        .zoom-close:hover { color: #fff; }
        .zoom-body { display: flex; justify-content: center; }
        .zoom-area { background: var(--bg-main); border-radius: 8px; padding: 12px; border: 2px solid var(--border-color); }
        .zoom-fila { display: flex; gap: 4px; justify-content: center; margin-bottom: 4px; }
        .zoom-fila:last-child { margin-bottom: 0; }
        .zoom-cell { width: 45px; height: 45px; background: var(--bg-cell); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: bold; color: var(--text-main); border: 1px solid transparent; }
        .zoom-cell.marcada { background: var(--bg-box); color: #4caf50 !important; border-color: rgba(255,255,255,0.3); position: relative; }
        .zoom-cell.marcada::after { content: "✓"; position: absolute; font-size: 1.2rem; color: #4caf50; }
        .zoom-cell.pre-marcada { background: rgba(255, 0, 0, 0.12); color: var(--text-muted); }
        .zoom-cell.vacia { opacity: 0.2; }
        .zoom-cell.multiplicador { border-color: #ffd700; color: #ffd700; }
        .zoom-amarilla .zoom-cell { min-width: 50px; }
        .zoom-azul .zoom-cell { min-width: 50px; }
        .zoom-verde .zoom-cell { min-width: 38px; height: 38px; font-size: 0.7rem; }
        .zoom-naranja .zoom-cell { min-width: 38px; height: 38px; font-size: 0.7rem; }
        .zoom-morado .zoom-cell { min-width: 38px; height: 38px; font-size: 0.7rem; }
        .zoom-areas-container { display: flex; flex-direction: column; gap: 12px; width: 100%; }
        .zoom-area-group { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .zoom-area-label { font-size: 0.75rem; color: var(--text-muted); font-weight: bold; }
        @media (max-width: 768px) {
            .zoom-cell { width: 32px; height: 32px; font-size: 0.6rem; }
            .zoom-amarilla .zoom-cell { min-width: 35px; }
            .zoom-azul .zoom-cell { min-width: 35px; }
            .zoom-verde .zoom-cell { min-width: 28px; height: 28px; font-size: 0.55rem; }
            .zoom-naranja .zoom-cell { min-width: 28px; height: 28px; font-size: 0.55rem; }
            .zoom-morado .zoom-cell { min-width: 28px; height: 28px; font-size: 0.55rem; }
            .zoom-modal { padding: 16px; max-width: 95%; }
        }
        @media (max-width: 480px) {
            .zoom-cell { width: 28px; height: 28px; font-size: 0.5rem; }
            .zoom-amarilla .zoom-cell { min-width: 30px; }
            .zoom-azul .zoom-cell { min-width: 30px; }
            .zoom-verde .zoom-cell { min-width: 24px; height: 24px; font-size: 0.45rem; }
            .zoom-naranja .zoom-cell { min-width: 24px; height: 24px; font-size: 0.45rem; }
            .zoom-morado .zoom-cell { min-width: 24px; height: 24px; font-size: 0.45rem; }
            .zoom-modal { padding: 12px; max-width: 98%; }
        }
        @media (orientation: landscape) and (max-height: 700px) {
            .zoom-cell { width: 24px; height: 24px; font-size: 0.45rem; }
            .zoom-amarilla .zoom-cell { min-width: 26px; }
            .zoom-azul .zoom-cell { min-width: 26px; }
            .zoom-verde .zoom-cell { min-width: 20px; height: 20px; font-size: 0.4rem; }
            .zoom-naranja .zoom-cell { min-width: 20px; height: 20px; font-size: 0.4rem; }
            .zoom-morado .zoom-cell { min-width: 20px; height: 20px; font-size: 0.4rem; }
        }
    `;
    const style = document.createElement('style');
    style.textContent = LEADERBOARD_STYLES;
    document.head.appendChild(style);
})();

// ============================================================
// EXPORTAR
// ============================================================

window.renderizarLeaderboard = renderizarLeaderboard;
window.actualizarLeaderboard = actualizarLeaderboard;
window.mostrarAreaZoom = mostrarAreaZoom;
window.cerrarZoom = cerrarZoom;