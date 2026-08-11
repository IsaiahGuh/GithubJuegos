// js/jugadores.js - Gestión de jugadores locales + sistema de turnos + modal
import { state } from './config.js';
import { actualizarUI } from './ui.js';
import { renderLeaderboard } from './leaderboard.js';
import { mostrarMensaje } from './ui.js';

// ============================================
// ESTADO DEL MODAL (interno)
// ============================================

const modalState = {
    modo: 'principal', // 'principal' | 'edicion'
    jugadores: ['', ''] // mínimo 2
};

// ============================================
// CREAR JUGADORES (desde el modal)
// ============================================

export function crearJugadoresDesdeModal() {
    // Validar nombres
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
    
    // Crear jugadores en el estado del juego
    state.jugadores = nombres.map((nombre, index) => ({
        id: index,
        nombre: nombre || `Jugador ${index + 1}`,
        oportunidades: 0,
        castigos: 0,
        conectado: true
    }));
    
    state.turnoActual = 0;
    state.totalJugadores = state.jugadores.length;
    
    // Ocultar modal y mostrar juego
    document.getElementById('lobbyModal').style.display = 'none';
    document.getElementById('leaderboardPanel').style.display = 'flex';
    
    // Actualizar UI
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
    
    // Buscar siguiente jugador conectado
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

export function setTurno(index) {
    if (!state.jugadores || index < 0 || index >= state.jugadores.length) return;
    if (state.jugadores[index].conectado === false) return;
    
    state.turnoActual = index;
    actualizarIndicadorTurno();
    renderLeaderboard();
}

// ============================================
// OPORTUNIDADES Y CASTIGOS (APLICAN AL TURNO ACTUAL)
// ============================================

export function agregarOportunidadAlTurno() {
    const jugador = getJugadorActual();
    if (!jugador) return false;
    
    jugador.oportunidades = (jugador.oportunidades || 0) + 1;
    renderLeaderboard();
    actualizarUI();
    return true;
}

export function agregarCastigoAlTurno() {
    const jugador = getJugadorActual();
    if (!jugador) return false;
    
    jugador.castigos = (jugador.castigos || 0) + 1;
    renderLeaderboard();
    actualizarUI();
    return true;
}

// ============================================
// OTORGAR A JUGADOR ESPECÍFICO (DESDE BOTÓN OTORGAR)
// ============================================

export function otorgarOportunidad(index) {
    const jugador = getJugador(index);
    if (!jugador) return false;
    
    jugador.oportunidades = (jugador.oportunidades || 0) + 1;
    renderLeaderboard();
    actualizarUI();
    return true;
}

export function otorgarCastigo(index) {
    const jugador = getJugador(index);
    if (!jugador) return false;
    
    jugador.castigos = (jugador.castigos || 0) + 1;
    renderLeaderboard();
    actualizarUI();
    return true;
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
// REINICIAR ESTADO DE JUGADORES
// ============================================

export function resetearJugadores() {
    if (!state.jugadores) return;
    
    state.jugadores.forEach(j => {
        j.oportunidades = 0;
        j.castigos = 0;
        j.conectado = true;
    });
    
    state.turnoActual = 0;
    renderLeaderboard();
    actualizarUI();
    actualizarIndicadorTurno();
}

// ============================================
// MODAL - VISTAS
// ============================================

export function toggleVistaJugadores() {
    const vistaPrincipal = document.getElementById('vistaPrincipal');
    const vistaJugadores = document.getElementById('vistaJugadores');
    
    if (modalState.modo === 'principal') {
        // Cambiar a modo edición
        modalState.modo = 'edicion';
        vistaPrincipal.style.display = 'none';
        vistaJugadores.style.display = 'block';
        renderizarListaJugadores();
    } else {
        // Cambiar a modo principal
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
        
        // Guardar nombre al cambiar
        input.addEventListener('input', () => {
            modalState.jugadores[index] = input.value;
        });
        
        div.appendChild(label);
        div.appendChild(input);
        
        // Botón eliminar (solo si hay más de 2 jugadores)
        if (modalState.jugadores.length > 2) {
            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = '✕';
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
    
    // Actualizar estado del botón "+"
    const btnAgregar = document.getElementById('btnAgregarJugador');
    if (btnAgregar) {
        if (modalState.jugadores.length >= 6) {
            btnAgregar.style.display = 'none';
        } else {
            btnAgregar.style.display = 'block';
        }
    }
}

function agregarJugador() {
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
// EXPONER FUNCIONES GLOBALES PARA HTML
// ============================================

window.getJugadores = getJugadores;
window.getJugadorActual = getJugadorActual;
window.getTurnoActual = getTurnoActual;
window.siguienteTurno = siguienteTurno;
window.toggleVistaJugadores = toggleVistaJugadores;
window.agregarJugador = agregarJugador;
window.iniciarPartida = crearJugadoresDesdeModal;
window.otorgarOportunidad = otorgarOportunidad;
window.otorgarCastigo = otorgarCastigo;