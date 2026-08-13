// js/jugadores.js - Gestión de jugadores locales + sistema de turnos + modal
import { state } from './config.js';
import { actualizarUI } from './juego.js';
import { renderLeaderboard } from './leaderboard.js';

// ============================================
// ESTADO DEL MODAL (interno)
// ============================================

const modalState = {
    modo: 'principal',
    jugadores: ['', '']
};

// ============================================
// CREAR JUGADORES (desde el modal)
// ============================================

export function crearJugadoresDesdeModal() {
    const nombres = modalState.jugadores.map(n => n.trim());
    const vacios = nombres.some(n => n === '');
    
    if (vacios) {
        mostrarMensaje('Todos los jugadores deben tener un nombre', 'warning');
        return false;
    }
    
    if (nombres.length < 2) {
        mostrarMensaje('Se necesitan al menos 2 jugadores', 'warning');
        return false;
    }
    
    state.jugadores = nombres.map((nombre, index) => ({
        id: index,
        nombre: nombre || `Jugador ${index + 1}`,
        cartasRobadas: 0,
        conectado: true
    }));
    
    state.turnoActual = 0;
    
    document.getElementById('lobbyModal').style.display = 'none';
    document.getElementById('leaderboardPanel').style.display = 'flex';
    
    renderLeaderboard();
    actualizarUI();
    actualizarIndicadorTurno();
    
    console.log('Partida iniciada con', nombres.length, 'jugadores:', nombres);
    return true;
}

// ============================================
// OBTENER JUGADORES
// ============================================

export function getJugadores() {
    return state.jugadores || [];
}

export function getJugador(index) {
    if (!state.jugadores || index < 0 || index >= state.jugadores.length) {
        return null;
    }
    return state.jugadores[index];
}

export function getJugadorActual() {
    return getJugador(state.turnoActual);
}

export function getTurnoActual() {
    return state.turnoActual;
}

// ============================================
// SISTEMA DE TURNOS
// ============================================

export function siguienteTurno() {
    if (!state.jugadores || state.jugadores.length === 0) return;
    
    let next = (state.turnoActual + 1) % state.jugadores.length;
    let intentos = 0;
    while (state.jugadores[next]?.conectado === false && intentos < state.jugadores.length) {
        next = (next + 1) % state.jugadores.length;
        intentos++;
    }
    
    state.turnoActual = next;
    actualizarIndicadorTurno();
    renderLeaderboard();
}

// ============================================
// CONTAR CARTA ROBADA POR JUGADOR
// ============================================

export function contarCartaRobada() {
    const jugador = getJugadorActual();
    if (!jugador) return false;
    
    jugador.cartasRobadas = (jugador.cartasRobadas || 0) + 1;
    renderLeaderboard();
    actualizarUI();
    return true;
}

// ============================================
// REINICIAR ESTADO DE JUGADORES
// ============================================

export function resetearJugadores() {
    if (!state.jugadores) return;
    
    state.jugadores.forEach(j => {
        j.cartasRobadas = 0;
        j.conectado = true;
    });
    
    state.turnoActual = 0;
    renderLeaderboard();
    actualizarUI();
    actualizarIndicadorTurno();
}

// ============================================
// INDICADOR DE TURNO EN UI
// ============================================

function actualizarIndicadorTurno() {
    const jugador = getJugadorActual();
    const el = document.getElementById('turnoIndicador');
    if (!el) return;
    
    if (jugador) {
        el.textContent = `Turno: ${jugador.nombre}`;
        el.style.display = 'block';
    } else {
        el.style.display = 'none';
    }
}

// ============================================
// MODAL - VISTAS
// ============================================

export function toggleVistaJugadores() {
    const vistaPrincipal = document.getElementById('vistaPrincipal');
    const vistaJugadores = document.getElementById('vistaJugadores');
    
    if (modalState.modo === 'principal') {
        modalState.modo = 'edicion';
        vistaPrincipal.style.display = 'none';
        vistaJugadores.style.display = 'block';
        renderizarListaJugadores();
    } else {
        modalState.modo = 'principal';
        vistaJugadores.style.display = 'none';
        vistaPrincipal.style.display = 'block';
    }
}

// ============================================
// MODAL - LISTA DE JUGADORES
// ============================================

function renderizarListaJugadores() {
    const container = document.getElementById('listaJugadoresContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const placeholders = ['Leo', 'Ana'];
    
    modalState.jugadores.forEach((nombre, index) => {
        const div = document.createElement('div');
        div.className = 'input-group jugador-input';
        div.style.marginBottom = '6px';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '8px';
        
        const label = document.createElement('label');
        label.textContent = `Jugador ${index + 1}:`;
        label.style.minWidth = '70px';
        label.style.fontSize = '0.85rem';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `nombreJugador_${index}`;
        input.placeholder = placeholders[index % placeholders.length];
        input.maxLength = 15;
        input.value = nombre || '';
        input.style.flex = '1';
        input.style.textAlign = 'left';
        input.style.paddingLeft = '12px';
        
        input.addEventListener('input', () => {
            modalState.jugadores[index] = input.value;
        });
        
        div.appendChild(label);
        div.appendChild(input);
        
        if (modalState.jugadores.length > 2) {
            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'X';
            btnEliminar.style.cssText = `
                background: var(--color-secondary);
                color: var(--text-main);
                border: none;
                border-radius: 50%;
                width: 28px;
                height: 28px;
                font-size: 14px;
                cursor: pointer;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            btnEliminar.addEventListener('click', () => {
                eliminarJugador(index);
            });
            div.appendChild(btnEliminar);
        }
        
        container.appendChild(div);
    });
    
    const btnAgregar = document.getElementById('btnAgregarJugador');
    if (btnAgregar) {
        if (modalState.jugadores.length >= 6) {
            btnAgregar.style.display = 'none';
        } else {
            btnAgregar.style.display = 'block';
        }
    }
}

export function agregarJugador() {
    if (modalState.jugadores.length >= 6) {
        mostrarMensaje('Máximo 6 jugadores', 'warning');
        return;
    }
    modalState.jugadores.push('');
    renderizarListaJugadores();
}

function eliminarJugador(index) {
    if (modalState.jugadores.length <= 2) {
        mostrarMensaje('Mínimo 2 jugadores', 'warning');
        return;
    }
    modalState.jugadores.splice(index, 1);
    renderizarListaJugadores();
}

// ============================================
// INICIALIZAR MODAL
// ============================================

export function inicializarModal() {
    renderizarListaJugadores();
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
// EXPONER FUNCIONES GLOBALES PARA HTML
// ============================================

window.getJugadores = getJugadores;
window.getTurnoActual = getTurnoActual;
window.toggleVistaJugadores = toggleVistaJugadores;
window.agregarJugador = agregarJugador;
window.iniciarPartida = crearJugadoresDesdeModal;