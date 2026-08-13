import { getCartasRestantes, getHistorial } from './juego.js';
import { getJugadores } from './jugadores.js';
import { crearCartaElement, mostrarZoom, cerrarZoom } from './zoom.js';

export function actualizarUI() {
    const restantes = getCartasRestantes();
    const contadorCartasFooter = document.getElementById('contadorCartasFooter');
    if (contadorCartasFooter) contadorCartasFooter.textContent = restantes;
}

export function mostrarHistorial() {
    const historial = getHistorial();
    const modal = document.getElementById('modalHistorial');
    const lista = document.getElementById('historialLista');
    if (!modal || !lista) return;
    lista.innerHTML = '';
    if (historial.length === 0) {
        lista.innerHTML = "<p style='color: white;'>No hay historial para mostrar</p>";
    } else {
        for (const carta of historial) {
            const item = document.createElement('div');
            item.className = 'historial-item';
            const cartaElement = crearCartaElement(carta, 'historial');
            item.appendChild(cartaElement);
            item.addEventListener('click', () => {
                mostrarZoom(carta);
            });
            lista.appendChild(item);
        }
    }
    modal.style.display = 'flex';
}

export function ocultarHistorial() {
    const modal = document.getElementById('modalHistorial');
    if (modal) modal.style.display = 'none';
}

export function configurarEventos() {
    const modales = ['modalHistorial', 'modalZoom'];
    for (const id of modales) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            ocultarHistorial();
            cerrarZoom();
        }
    });
}

window.mostrarHistorial = mostrarHistorial;