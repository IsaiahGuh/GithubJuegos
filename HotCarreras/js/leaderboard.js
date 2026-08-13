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
                <span style="font-size:0.7rem;color:var(--color-accent);margin-left:auto;">Total: ${j.puntaje || 0}pts</span>
            </div>
        `;
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