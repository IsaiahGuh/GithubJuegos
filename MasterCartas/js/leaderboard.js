// js/leaderboard.js - LISTA DE JUGADORES (SIN VOTACION)
import { getJugadores, getTurnoActual } from './jugadores.js';

// ============================================
// RENDERIZAR LEADERBOARD
// ============================================

export function renderLeaderboard() {
    const list = document.getElementById('playersList');
    if (!list) return;
    list.innerHTML = '';
    
    const jugadores = getJugadores();
    const turnoActual = getTurnoActual();
    
    if (!jugadores || jugadores.length === 0) {
        list.innerHTML = '<div style="color:#666;text-align:center;padding:10px;font-size:0.8rem;">Esperando jugadores...</div>';
        return;
    }

    jugadores.forEach((j, index) => {
        const div = document.createElement('div');
        const esTurno = index === turnoActual;
        div.className = 'player-card' + (esTurno ? ' turno-actual' : '');
        div.dataset.playerId = index;
        
        // Contador de Oportunidades con miniatura
        const oportunidadesHtml = `
            <div style="display:flex;align-items:center;gap:4px;background:rgba(76,175,80,0.15);padding:2px 8px 2px 4px;border-radius:4px;border:1px solid rgba(76,175,80,0.3);">
                <img src="imagenes/MasterCartas_Oportunidades.png" 
                     style="width:20px;height:28px;object-fit:cover;border-radius:2px;cursor:pointer;"
                     onclick="window.abrirZoomOportunidad()"
                     title="Haz clic para ver la oportunidad">
                <span style="color:#504E1D;font-weight:bold;font-size:0.8rem;">x ${j.oportunidades || 0}</span>
            </div>
        `;
        
        // Contador de Castigos con miniatura
        const castigosHtml = `
            <div style="display:flex;align-items:center;gap:4px;background:rgba(244,67,54,0.15);padding:2px 8px 2px 4px;border-radius:4px;border:1px solid rgba(244,67,54,0.3);">
                <img src="imagenes/MasterCartas_Castigos.png" 
                     style="width:20px;height:28px;object-fit:cover;border-radius:2px;cursor:pointer;"
                     onclick="window.abrirZoomCastigo()"
                     title="Haz clic para ver el castigo">
                <span style="color:#910F13;font-weight:bold;font-size:0.8rem;">x ${j.castigos || 0}</span>
            </div>
        `;
        
        const turnoIndicator = esTurno ? 
            '<span style="background:#CA7A02;color:#181810;font-size:0.55rem;padding:2px 8px;border-radius:10px;font-weight:bold;">▲ TURNO</span>' : 
            '';
        
        div.innerHTML = `
            <div class="player-card-header">
                <span>${j.nombre} ${turnoIndicator}</span>
                <span style="font-size:0.55rem;color:#666;">#${index + 1}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px;">
                ${oportunidadesHtml}
                ${castigosHtml}
            </div>
        `;
        list.appendChild(div);
    });
}

// ============================================
// ABRIR ZOOM DE OPORTUNIDAD
// ============================================

export function abrirZoomOportunidad() {
    // Buscar una carta de oportunidad en el descarte o mazo
    const descarte = state.descarte;
    for (const carta of descarte) {
        if (carta.tipo === 'oportunidad') {
            abrirZoom(carta);
            return;
        }
    }
    for (const carta of state.mazo) {
        if (carta.tipo === 'oportunidad') {
            abrirZoom(carta);
            return;
        }
    }
}

// ============================================
// ABRIR ZOOM DE CASTIGO
// ============================================

export function abrirZoomCastigo() {
    const descarte = state.descarte;
    for (const carta of descarte) {
        if (carta.tipo === 'castigo') {
            abrirZoom(carta);
            return;
        }
    }
    for (const carta of state.mazo) {
        if (carta.tipo === 'castigo') {
            abrirZoom(carta);
            return;
        }
    }
}

// ============================================
// TOGGLE LEADERBOARD
// ============================================

export function toggleLeaderboard() {
    const content = document.getElementById('leaderboardContent');
    const icon = document.getElementById('toggleIcon');
    if (!content || !icon) return;
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▲';
    } else {
        content.style.display = 'none';
        icon.textContent = '▼';
    }
}

// ============================================
// EXPONER FUNCIONES GLOBALES
// ============================================

window.abrirZoomOportunidad = abrirZoomOportunidad;
window.abrirZoomCastigo = abrirZoomCastigo;