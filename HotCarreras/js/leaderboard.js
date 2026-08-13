// js/leaderboard.js - LISTA DE JUGADORES (click para ver apuestas)
import { getJugadores } from './jugadores.js';
import { mostrarApuestasJugador } from './zoom.js';

export function renderLeaderboard() {
    const list = document.getElementById('playersList');
    if (!list) return;
    list.innerHTML = '';
    
    const jugadores = getJugadores();
    
    if (!jugadores || jugadores.length === 0) {
        list.innerHTML = '<div style="color:#666;text-align:center;padding:10px;font-size:0.8rem;">Esperando jugadores...</div>';
        return;
    }

    jugadores.forEach((j, index) => {
        const div = document.createElement('div');
        div.className = 'player-card';
        div.dataset.playerId = index;
        
        div.innerHTML = `
            <div class="player-card-header">
                <span>${j.nombre}</span>
                <span style="font-size:0.55rem;color:#666;">#${index + 1}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px;font-size:0.7rem;color:var(--text-muted);">
                <span>Cartas: <strong style="color:var(--text-main);">${j.cartasRobadas || 0}</strong></span>
            </div>
        `;
        // Al hacer clic en la tarjeta del jugador, mostrar sus apuestas
        div.addEventListener('click', () => {
            mostrarApuestasJugador(index);
        });
        list.appendChild(div);
    });
}

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

window.toggleLeaderboard = toggleLeaderboard;