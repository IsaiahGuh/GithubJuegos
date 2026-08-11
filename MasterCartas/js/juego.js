// js/juego.js - LÓGICA DEL JUEGO
import { CONFIG, state } from './config.js';
import { 
    getJugadorActual, 
    agregarOportunidadAlTurno, 
    agregarCastigoAlTurno,
    siguienteTurno,
    resetearJugadores
} from './jugadores.js';

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
    state.mazo = mezclarArray([...CONFIG.GAME.MAZO_INICIAL]);
}

export function reiniciarJuego() {
    state.descarte = [];
    state.reglasVisibles = [];
    state.cartaEspecial = null;
    state.cartaActual = null;
    generarMazo();
    resetearJugadores();
    actualizarUI();
}

export const reiniciarPartida = reiniciarJuego;

export function getCartasRestantes() {
    return state.mazo.length;
}

export function getDescarte() {
    return state.descarte;
}

export function getReglasVisibles() {
    return state.reglasVisibles;
}

export function getUltimaCartaDescartada() {
    return state.descarte.length > 0 ? state.descarte[0] : null;
}

// ============================================
// ROBAR CARTA
// ============================================

export function robarCarta() {
    if (state.mazo.length === 0) {
        mostrarMensaje('No hay cartas en el mazo.', 'warning');
        return null;
    }

    const carta = state.mazo.pop();
    state.cartaActual = carta;

    let resultado = null;

    if (carta.tipo === 'normal') {
        state.descarte.unshift(carta);
        resultado = { carta, accion: 'normal' };
    } else if (carta.tipo === 'regla') {
        agregarRegla(carta);
        resultado = { carta, accion: 'regla' };
    } else if (carta.tipo === 'especial') {
        state.cartaEspecial = carta;
        resultado = { carta, accion: 'especial' };
    } else if (carta.tipo === 'oportunidad') {
        agregarOportunidadAlTurno();
        state.descarte.unshift(carta);
        resultado = { carta, accion: 'oportunidad' };
    } else if (carta.tipo === 'castigo') {
        agregarCastigoAlTurno();
        state.descarte.unshift(carta);
        resultado = { carta, accion: 'castigo' };
    }

    // Cambiar turno después de robar
    siguienteTurno();
    actualizarUI();
    return resultado;
}

// ============================================
// REGLAS
// ============================================

function agregarRegla(regla) {
    state.reglasVisibles.push(regla);
    if (state.reglasVisibles.length > CONFIG.GAME.MAX_REGLAS) {
        const primera = state.reglasVisibles.shift();
        state.descarte.unshift(primera);
    }
}

export function guardarReglaEspecial(texto) {
    if (!state.cartaEspecial) {
        mostrarMensaje('No hay carta especial para guardar', 'warning');
        return false;
    }
    
    if (!texto || texto.trim() === '') {
        mostrarMensaje('Debes escribir un texto para la regla', 'warning');
        return false;
    }
    
    state.cartaEspecial.textoPersonalizado = texto.trim();
    agregarRegla(state.cartaEspecial);
    state.cartaEspecial = null;
    actualizarUI();
    return true;
}

export function descartarEspecial() {
    if (state.cartaEspecial) {
        state.descarte.unshift(state.cartaEspecial);
        state.cartaEspecial = null;
        actualizarUI();
        return true;
    }
    return false;
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
    }, 3000);
}

// ============================================
// ACTUALIZAR UI Y LEADERBOARD
// ============================================

export function actualizarUI() {
    if (window._actualizarUICallback) {
        window._actualizarUICallback();
    }
}

export function setActualizarUICallback(callback) {
    window._actualizarUICallback = callback;
}

export function actualizarLeaderboard() {
    if (window._actualizarLeaderboardCallback) {
        window._actualizarLeaderboardCallback();
    }
}

export function setActualizarLeaderboardCallback(callback) {
    window._actualizarLeaderboardCallback = callback;
}