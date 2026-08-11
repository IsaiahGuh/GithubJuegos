// ===== LEADERBOARD.JS =====
// Tabla de posiciones con puntaje detallado - Versión mejorada visualmente

// Renderizar leaderboard con puntaje completo
function renderLeaderboard() {
    const list = document.getElementById('playersList');
    if (!list) {
        console.warn('⚠️ playersList no encontrado');
        return;
    }
    
    list.innerHTML = '';
    
    if (!window.playersData) {
        console.warn('⚠️ playersData vacío');
        return;
    }
    
    const publicObjIds = window.gameState?.publicObjectives || [];
    const privateObjId = window.gameState?.privateObjectiveId || null;
    const isFinished = window.gameState?.isFinished || false;
    
    // Obtener los nombres de los objetivos públicos
    const publicObjNames = {};
    publicObjIds.forEach(id => {
        const obj = getObjetivoPublicoById(id);
        if (obj) {
            publicObjNames[id] = obj.nombre;
        }
    });
    
    const playersArr = Object.keys(window.playersData).map(id => {
        const p = window.playersData[id];
        
        // Para el jugador local, calcular todo usando el estado actual del juego
        if (id === window.myId) {
            const card = getCurrentCard();  // usa la carta actual
            const moves = window.gameState.moveHistory || []; // historial actual
            const puntaje = calcularPuntuacionCompleta(card, moves, privateObjId, publicObjIds, id, isFinished);
            return {
                id: id,
                name: p.name || 'Anonimo',
                puntaje: puntaje,
                publicDetalle: puntaje.publicDetalle || [],
                privateScore: puntaje.private || 0,
                colorExtra: puntaje.colorExtra || 0,
                favoresPuntos: puntaje.favoresPuntos || 0,
                casillasVaciasPuntos: puntaje.casillasVaciasPuntos || 0,
                color: coloresState.asignaciones[id],
                colorHex: coloresState.asignaciones[id] ? getHexColor(coloresState.asignaciones[id]) : '#666',
                colorNombre: coloresState.asignaciones[id] ? getNombreColor(coloresState.asignaciones[id]) : 'Sin color',
                isMe: true,
                isFinished: isFinished
            };
        }
        
        // Para otros jugadores, usar los datos sincronizados
        const card = getCardById(p.cardId || 1);
        const moves = p.moves || [];
        const publicDetalle = p.publicDetalle || [];
        const privateScore = p.privateScore || 0;
        const colorExtra = p.colorExtra || 0;
        const favoresPuntos = p.favoresPuntos || 0;
        const casillasVaciasPuntos = p.casillasVaciasPuntos || 0;
        const totalScore = p.score || 0;
        
        // Obtener el color del jugador
        const colorId = p.colorAsignado || coloresState.asignaciones[id];
        const colorHex = colorId ? getHexColor(colorId) : '#666';
        const colorNombre = colorId ? getNombreColor(colorId) : 'Sin color';
        
        // Si no hay detalles, mostrar los nombres con 0
        let publicDetalleFinal = publicDetalle;
        if (publicDetalle.length === 0 && publicObjIds.length > 0) {
            publicDetalleFinal = publicObjIds.map(id => {
                const obj = getObjetivoPublicoById(id);
                return {
                    nombre: obj ? obj.nombre : 'Objetivo',
                    puntos: 0,
                    veces: 0,
                    id: id
                };
            });
        }
        
        return {
            id: id,
            name: p.name || 'Anonimo',
            puntaje: {
                total: totalScore,
                private: privateScore,
                public: publicDetalleFinal.reduce((sum, d) => sum + (d.puntos || 0), 0),
                publicDetalle: publicDetalleFinal,
                colorExtra: colorExtra,
                favoresPuntos: favoresPuntos,
                casillasVaciasPuntos: casillasVaciasPuntos
            },
            publicDetalle: publicDetalleFinal,
            privateScore: privateScore,
            colorExtra: colorExtra,
            favoresPuntos: favoresPuntos,
            casillasVaciasPuntos: casillasVaciasPuntos,
            color: colorId,
            colorHex: colorHex,
            colorNombre: colorNombre,
            isMe: false,
            isFinished: isFinished
        };
    }).sort((a, b) => b.puntaje.total - a.puntaje.total);
    
    playersArr.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = `player-card ${p.isMe ? 'me' : ''} ${p.isFinished ? 'finished' : ''}`;
        card.dataset.playerId = p.id;
        card.style.cursor = 'pointer';
        
        // ===== NOMBRE =====
        let nombreHtml = `<span style="font-weight: 700; font-size: 1rem;">${p.name}`;
        if (p.isMe) {
            nombreHtml += ` <span style="color: var(--color-blue); font-weight: 400; font-size: 0.8rem;">(Tú)</span>`;
        }
        nombreHtml += `</span>`;
        
        let totalHtml = `<span style="font-weight: 700; font-size: 1rem; color: var(--color-yellow);">Total: ${p.puntaje.total}pts</span>`;
        
        // ===== OBJETIVOS PÚBLICOS =====
        let publicTagsHtml = '';
        if (p.publicDetalle && p.publicDetalle.length > 0) {
            publicTagsHtml = p.publicDetalle.map((d) => {
                return `<span class="tag-public">${d.nombre}: ${d.puntos || 0}pts</span>`;
            }).join(' ');
        } else if (p.isMe) {
            publicTagsHtml = '<span class="tag-public" style="color: var(--text-muted);">Sin objetivos</span>';
        } else {
            const objNames = Object.values(publicObjNames);
            if (objNames.length > 0) {
                publicTagsHtml = objNames.map(nombre => 
                    `<span class="tag-public" style="opacity:0.5;">${nombre}: 0pts</span>`
                ).join(' ');
            } else {
                publicTagsHtml = '<span class="tag-public" style="color: var(--text-muted);">Sin objetivos</span>';
            }
        }
        
        // ===== PRIVADO - SIEMPRE VISIBLE SIN CANDADO =====
        let privateTag = '';
        const privPts = p.privateScore || 0;
        
        if (p.isMe) {
            privateTag = `<span class="tag-private">Privado: ${privPts}pts</span>`;
        } else {
            if (p.isFinished) {
                privateTag = `<span class="tag-private" style="background: rgba(76, 175, 80, 0.15); border-color: rgba(76, 175, 80, 0.3);">Privado: ${privPts}pts</span>`;
            } else {
                privateTag = `<span class="tag-private">Privado: ${privPts}pts</span>`;
            }
        }
        
        // ===== COLOR =====
        let colorTag = '';
        if (p.isMe) {
            const bgColor = p.colorHex || '#666';
            const textColor = p.color === 'yellow' ? '#222' : '#fff';
            colorTag = `<span class="tag-color" style="background: ${bgColor}; color: ${textColor}; border-color: ${bgColor};">Color: ${p.colorExtra || 0}pts</span>`;
        } else {
            if (p.isFinished && p.color) {
                const bgColor = p.colorHex || '#666';
                const textColor = p.color === 'yellow' ? '#222' : '#fff';
                colorTag = `<span class="tag-color" style="background: ${bgColor}; color: ${textColor}; border-color: ${bgColor};">Color: ${p.colorExtra || 0}pts</span>`;
            } else {
                colorTag = `<span class="tag-color" style="opacity:0.5; background: transparent; border-color: var(--border-color);">Color: 🔒</span>`;
            }
        }
        
        // ===== FAVORES =====
        let favoresTag = '';
        if (p.isFinished) {
            if (p.isMe) {
                favoresTag = `<span class="tag-favores">Favores: ${p.favoresPuntos || 0}pts</span>`;
            } else {
                const favPts = p.favoresPuntos || 0;
                favoresTag = `<span class="tag-favores">Favores: ${favPts}pts</span>`;
            }
        }
        
        // ===== CASILLAS VACÍAS =====
        let casillasTag = '';
        if (p.isFinished) {
            if (p.isMe) {
                const vacias = p.casillasVaciasPuntos || 0;
                const colorVacias = vacias < 0 ? 'var(--color-red)' : 'var(--text-muted)';
                casillasTag = `<span class="tag-casillas" style="color: ${colorVacias};">Casillas: ${vacias}pts</span>`;
            } else {
                const vacias = p.casillasVaciasPuntos || 0;
                const colorVacias = vacias < 0 ? 'var(--color-red)' : 'var(--text-muted)';
                casillasTag = `<span class="tag-casillas" style="color: ${colorVacias};">Casillas: ${vacias}pts</span>`;
            }
        }
        
        // ===== ESTRUCTURA FINAL =====
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                ${nombreHtml}
                ${totalHtml}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
                ${publicTagsHtml}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px;">
                ${privateTag}
                ${colorTag}
                ${favoresTag}
                ${casillasTag}
            </div>
            ${p.isFinished && !p.isMe ? `<div style="font-size: 0.6rem; color: var(--color-green); margin-top: 4px;">🏁 Partida finalizada</div>` : ''}
        `;
        
        card.addEventListener('click', function(e) {
            if (typeof abrirZoomJugador === 'function') {
                abrirZoomJugador(p.id);
            }
        });
        
        list.appendChild(card);
    });
}

// ============================================================
// ESTILOS ADICIONALES PARA TAGS (se inyectan dinámicamente)
// ============================================================

function injectLeaderboardStyles() {
    const styleId = 'leaderboard-tag-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .tag-public {
            display: inline-block;
            background: rgba(30, 136, 229, 0.15);
            color: var(--color-blue);
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 500;
            border: 1px solid rgba(30, 136, 229, 0.2);
            white-space: nowrap;
        }
        .tag-private {
            display: inline-block;
            background: rgba(156, 39, 176, 0.15);
            color: #ab47bc;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 500;
            border: 1px solid rgba(156, 39, 176, 0.2);
            white-space: nowrap;
        }
        .tag-color {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 600;
            border: 1px solid;
            white-space: nowrap;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .tag-favores {
            background: rgba(253, 216, 53, 0.15);
            color: var(--color-yellow);
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 500;
            border: 1px solid rgba(253, 216, 53, 0.2);
            white-space: nowrap;
        }
        .tag-casillas {
            background: rgba(229, 57, 53, 0.12);
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 500;
            border: 1px solid rgba(229, 57, 53, 0.2);
            white-space: nowrap;
        }
        .player-card {
            background: var(--bg-box);
            border-radius: 10px;
            padding: 10px 14px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            border: 1px solid var(--border-color);
            transition: all 0.2s ease;
        }
        .player-card.me {
            border-left: 4px solid var(--color-blue);
            background: rgba(30, 136, 229, 0.06);
        }
        .player-card:hover {
            border-color: rgba(255,255,255,0.1);
        }
        .player-card.finished {
            border-color: var(--color-yellow);
            box-shadow: 0 0 20px rgba(253,216,53,0.1);
        }
    `;
    document.head.appendChild(style);
}

// ============================================================
// SOBRESCRIBIR FUNCIONES PARA COMPATIBILIDAD
// ============================================================

window.calculateTotalScore = function() {
    const card = getCurrentCard();
    const moves = window.gameState.moveHistory || [];
    const privateId = window.gameState.privateObjectiveId;
    const publicIds = window.gameState.publicObjectives || [];
    const isFinished = window.gameState?.isFinished || false;
    return calcularPuntuacionCompleta(card, moves, privateId, publicIds, window.myId, isFinished);
};

function actualizarLeaderboard() {
    if (typeof renderLeaderboard === 'function') {
        renderLeaderboard();
    }
}

// ============================================================
// INYECTAR ESTILOS AL INICIO
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    injectLeaderboardStyles();
});

// ============================================================
// EXPORTAR
// ============================================================

window.renderLeaderboard = renderLeaderboard;
window.actualizarLeaderboard = actualizarLeaderboard;
window.injectLeaderboardStyles = injectLeaderboardStyles;

console.log('✅ leaderboard.js cargado - Con soporte para finalización');