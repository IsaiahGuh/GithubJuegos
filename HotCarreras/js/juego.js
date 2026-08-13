// js/juego.js - LÓGICA DEL JUEGO
import { CONFIG, state } from './config.js';
import { getCartasConTexto } from './cartas.js';
import { resetearJugadores } from './jugadores.js';

// ============================================
// MAZO
// ============================================

function mezclarArray(array) {
    const copia = [...array];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

export function generarMazo() {
    const cartas = getCartasConTexto();
    state.mazo = mezclarArray(cartas);
}

export function reiniciarJuego() {
    state.historial = [];
    state.cartaActual = null;
    generarMazo();
    resetearJugadores();
    actualizarUI();
}

export function robarCarta() {
    if (state.mazo.length === 0) {
        mostrarMensaje('No hay cartas en el mazo.', 'warning');
        return null;
    }

    const carta = state.mazo.pop();
    state.cartaActual = carta;
    state.historial.unshift({ ...carta, timestamp: Date.now() });

    // Ya no se avanza turno ni se cuenta carta para jugador

    actualizarUI();
    
    mostrarMensaje(`Carta: ${carta.nombre}`, 'info');
    return carta;
}

export function getCartasRestantes() {
    return state.mazo.length;
}

export function getHistorial() {
    return state.historial;
}

export function getUltimaCarta() {
    return state.cartaActual;
}

// ============================================
// MOSTRAR MENSAJES
// ============================================

function mostrarMensaje(texto, tipo = 'info') {
    const colores = {
        success: '#504E1D',
        error: '#910F13',
        warning: '#CA7A02',
        info: '#1D424C'
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
// ACTUALIZAR UI
// ============================================

export function actualizarUI() {
    if (window._actualizarUICallback) {
        window._actualizarUICallback();
    }
}

export function setActualizarUICallback(callback) {
    window._actualizarUICallback = callback;
}