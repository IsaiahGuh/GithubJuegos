// ===== ZOOM.JS =====
// Visualización de cartilla de otros jugadores con sus dados marcados

// Abrir zoom de un jugador
function abrirZoomJugador(playerId) {
    const player = window.playersData?.[playerId];
    if (!player) {
        console.warn('⚠️ Jugador no encontrado:', playerId);
        return;
    }

    // Guardar el ID del jugador en el modal para actualizaciones
    const modal = document.getElementById('zoomModal');
    if (modal) {
        modal.dataset.currentPlayerId = playerId;
    }

    // ✅ PRIORIDAD 1: Usar el cardState sincronizado si existe
    let card = null;
    let cardState = null;
    
    // Buscar en el mapa de estados sincronizados
    if (window._playerCardStates && window._playerCardStates[playerId]) {
        cardState = window._playerCardStates[playerId];
        // Crear una carta temporal con el estado sincronizado
        card = {
            id: cardState.id || player.cardId || 1,
            rows: cardState.rows.map(row => 
                row.map(cell => ({
                    value: cell.value,
                    color: cell.color
                }))
            ),
            difficulty: cardState.difficulty || 3
        };
        console.log(`📋 Usando estado sincronizado para ${player.name}`);
    }
    
    // Si no hay estado sincronizado, usar la carta base + moves
    if (!card) {
        const baseCard = getCardById(player.cardId || 1);
        if (!baseCard) {
            console.warn('⚠️ Cartilla no encontrada para:', playerId);
            return;
        }
        
        // Clonar la carta base y aplicar los movimientos
        card = {
            id: baseCard.id,
            rows: baseCard.rows.map(row => 
                row.map(cell => ({
                    value: cell.value,
                    color: cell.color
                }))
            ),
            difficulty: baseCard.difficulty || 3
        };
        
        // Aplicar los movimientos (marcar casillas)
        const moves = player.moves || [];
        const movesSet = new Set(moves);
        
        card.rows.forEach((row, r) => {
            row.forEach((cell, c) => {
                const moveId = `${r}-${c}`;
                if (movesSet.has(moveId)) {
                    // La casilla está marcada, mantener su valor y color
                    // (ya están en la carta base)
                } else {
                    // Si no está marcada, limpiar el valor y color
                    // (para que no se muestre como marcada)
                    cell.value = null;
                    cell.color = null;
                }
            });
        });
    }

    const moves = player.moves || [];

    // Obtener información de favores del jugador
    let totalFavores = 0, gastadosFavores = 0;
    if (playerId === window.myId && window.herramientasState?.favores) {
        totalFavores = herramientasState.favores.total || 0;
        gastadosFavores = herramientasState.favores.gastados || 0;
    } else if (card.difficulty) {
        totalFavores = card.difficulty;
        // Si la partida está finalizada y el jugador tiene favoresPuntos
        if (window.gameState?.isFinished && player.favoresPuntos !== undefined) {
            const favoresDisponibles = player.favoresPuntos || 0;
            gastadosFavores = totalFavores - favoresDisponibles;
        }
    }

    renderZoomModal(card, moves, totalFavores, gastadosFavores);
}

// Renderizar modal zoom con dados marcados
function renderZoomModal(card, moves, totalFavores, gastadosFavores) {
    const board = document.getElementById('zoomBoard');
    board.innerHTML = '';
    const movesSet = new Set(moves);

    const coloresMap = {
        'red': '#940219',
        'yellow': '#F1B215',
        'green': '#437F3F',
        'blue': '#057599',
        'purple': '#5D4080'
    };

    card.rows.forEach((row, r) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        row.forEach((cell, c) => {
            const box = document.createElement('div');
            box.className = 'box';
            
            const moveId = `${r}-${c}`;
            const isMarked = movesSet.has(moveId);
            
            // Color de fondo
            if (isMarked && cell.color) {
                const colorClass = getCellColorClass(cell);
                if (colorClass) box.classList.add(colorClass);
            } else if (cell.color) {
                const colorClass = getCellColorClass(cell);
                if (colorClass) box.classList.add(colorClass);
            } else {
                box.style.backgroundColor = 'var(--bg-cell)';
            }
            
            // Renderizar dado - SIEMPRE PUNTOS BLANCOS
            if (isMarked && cell.value !== null && cell.value !== undefined) {
                let bg = null;
                const dotColor = '#ffffff'; // SIEMPRE BLANCO
                
                if (cell.color && coloresMap[cell.color]) {
                    bg = coloresMap[cell.color];
                }
                
                box.innerHTML = renderizarDado(cell.value, bg, dotColor);
                
                if (!cell.color) {
                    box.classList.add('has-number-only');
                }
            } else if (cell.value !== null && cell.value !== undefined) {
                // Número predefinido de la cartilla (no marcado) - PUNTOS BLANCOS
                box.innerHTML = renderizarDado(cell.value, null, '#ffffff');
                box.classList.add('has-number-only');
            }
            
            if (isMarked) {
                box.classList.add('marked');
            }

            rowDiv.appendChild(box);
        });
        board.appendChild(rowDiv);
    });

    // Favores - SOLO PUNTOS, SIN NOMBRE
    const container = document.getElementById('zoomFavores');
    container.innerHTML = '';
    
    if (totalFavores === 0) {
        const emptySpan = document.createElement('span');
        emptySpan.style.cssText = 'color:var(--text-muted);font-size:0.8rem;';
        emptySpan.textContent = 'Sin favores';
        container.appendChild(emptySpan);
    } else {
        for (let i = 0; i < totalFavores; i++) {
            const punto = document.createElement('span');
            punto.textContent = '●';
            const esGastado = i < (gastadosFavores || 0);
            punto.style.cssText = `
                font-size: 1.6rem;
                line-height: 1;
                color: ${esGastado ? 'var(--text-muted)' : '#ffffff'};
                opacity: ${esGastado ? '0.2' : '1'};
                transform: ${esGastado ? 'scale(0.85)' : 'scale(1)'};
                display: inline-block;
                transition: all 0.3s ease;
            `;
            container.appendChild(punto);
        }
    }

    // Abrir modal
    if (typeof openModalById === 'function') {
        openModalById('zoomModal');
    } else {
        document.getElementById('zoomModal').style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

// ✅ NUEVA FUNCIÓN: Actualizar zoom en tiempo real
function actualizarZoomEnTiempoReal(playerId) {
    const modal = document.getElementById('zoomModal');
    if (modal && modal.style.display === 'flex') {
        const currentPlayerId = modal.dataset.currentPlayerId;
        if (currentPlayerId === playerId && typeof abrirZoomJugador === 'function') {
            abrirZoomJugador(playerId);
        }
    }
}

// ✅ NUEVA FUNCIÓN: Recibir actualización de cardState desde MQTT
function receiveCardStateUpdate(data) {
    if (!data || data.id === window.myId) return;
    if (!data.cardState) return;
    
    console.log(`📥 Recibiendo actualización de cartilla de ${data.name || data.id}`);
    
    // Guardar el estado actualizado
    if (!window._playerCardStates) {
        window._playerCardStates = {};
    }
    window._playerCardStates[data.id] = data.cardState;
    
    if (window.playersData && window.playersData[data.id]) {
        window.playersData[data.id].cardState = data.cardState;
        if (data.moves) {
            window.playersData[data.id].moves = data.moves;
        }
        if (data.score !== undefined) {
            window.playersData[data.id].score = data.score;
        }
    }
    
    // ✅ Actualizar el zoom si está abierto y es el jugador correcto
    actualizarZoomEnTiempoReal(data.id);
}

// Cerrar zoom
function cerrarZoom() {
    const modal = document.getElementById('zoomModal');
    if (modal) {
        delete modal.dataset.currentPlayerId;
    }
    if (typeof closeModalById === 'function') {
        closeModalById('zoomModal');
    } else {
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }
}

// ============================================================
// INICIALIZACIÓN - Crear modal si no existe
// ============================================================

function initZoomModal() {
    if (document.getElementById('zoomModal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'zoomModal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="modal-box" style="max-width:420px; padding:20px 16px;">
            <div class="board-container" style="padding:10px;background:var(--bg-main);border:2px solid var(--grid-border);border-radius:12px;">
                <div class="board" id="zoomBoard"></div>
            </div>
            <div id="zoomFavores" style="display:flex;gap:6px;justify-content:center;padding:8px 12px;margin-top:12px;background:var(--bg-box);border-radius:10px;border:1px solid var(--border-color);min-height:40px;align-items:center;"></div>
        </div>
    `;
    
    // Cerrar al hacer click fuera
    modal.addEventListener('click', function(e) {
        if (e.target === this) cerrarZoom();
    });
    
    document.body.appendChild(modal);
}

// ============================================================
// AGREGAR EVENTOS A LAS TARJETAS DEL LEADERBOARD
// ============================================================

function agregarEventosZoom() {
    document.querySelectorAll('.player-card').forEach(el => {
        if (el.dataset.zoom) return;
        el.dataset.zoom = 'true';
        el.style.cursor = 'pointer';
        el.addEventListener('click', function(e) {
            const playerId = this.dataset.playerId;
            if (playerId) {
                abrirZoomJugador(playerId);
            }
        });
    });
}

// ============================================================
// INICIALIZAR CUANDO EL DOM ESTÉ LISTO
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    initZoomModal();
    
    // Agregar eventos a las tarjetas existentes
    setTimeout(agregarEventosZoom, 500);
    
    // Observar cambios en el leaderboard
    const observer = new MutationObserver(agregarEventosZoom);
    const list = document.getElementById('playersList');
    if (list) {
        observer.observe(list, { childList: true, subtree: true });
    }
});

// ============================================================
// EXPORTAR
// ============================================================

window.abrirZoomJugador = abrirZoomJugador;
window.cerrarZoom = cerrarZoom;
window.initZoomModal = initZoomModal;
window.actualizarZoomEnTiempoReal = actualizarZoomEnTiempoReal;
window.receiveCardStateUpdate = receiveCardStateUpdate;

console.log('✅ zoom.js cargado - Muestra dados marcados por cada jugador');