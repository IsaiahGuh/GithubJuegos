// js/ui.js - INTERFAZ DE USUARIO
import { getCartasRestantes, getHistorial } from './juego.js';
import { getJugadores, getTurnoActual } from './jugadores.js';
import { crearCartaElement, mostrarZoom, cerrarZoom } from './zoom.js';

// ============================================
// RENDERIZAR UI
// ============================================

export function actualizarUI() {
    const restantes = getCartasRestantes();

    const contadorCartasFooter = document.getElementById('contadorCartasFooter');
    if (contadorCartasFooter) contadorCartasFooter.textContent = restantes;

    actualizarIndicadorTurno();
}

// ============================================
// INDICADOR DE TURNO
// ============================================

function actualizarIndicadorTurno() {
    const jugadores = getJugadores();
    const turno = getTurnoActual();
    const el = document.getElementById('turnoIndicador');
    if (!el) return;
    
    if (jugadores && jugadores.length > 0 && jugadores[turno]) {
        el.textContent = `Turno: ${jugadores[turno].nombre}`;
        el.style.display = 'block';
    } else {
        el.style.display = 'none';
    }
}

// ============================================
// MOSTRAR HISTORIAL
// ============================================

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

// ============================================
// MOSTRAR MENSAJES
// ============================================

export function mostrarMensaje(texto, tipo = 'info') {
    const colores = {
        success: '#118C3C',
        error: '#DE3F2A',
        warning: '#F2CF1D',
        info: '#5A92C2'
    };
    
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colores[tipo] || colores.info};
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        animation: slideDown 0.5s ease;
        max-width: 90%;
        text-align: center;
    `;
    msg.textContent = texto;
    document.body.appendChild(msg);
    
    setTimeout(() => {
        if (msg.parentNode) msg.remove();
    }, 2000);
}

// ============================================
// EVENTOS
// ============================================

export function configurarEventos() {
    // Cerrar modales al hacer clic fuera
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

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            ocultarHistorial();
            cerrarZoom();
        }
    });
}

// ============================================
// EXPONER FUNCIONES GLOBALES
// ============================================

window.mostrarHistorial = mostrarHistorial;