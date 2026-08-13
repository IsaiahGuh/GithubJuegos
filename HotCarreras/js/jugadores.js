import { state } from './config.js';
import { actualizarUI } from './juego.js';
import { renderLeaderboard } from './leaderboard.js';

const modalState = {
    modo: 'principal',
    jugadores: ['', '']
};

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
        conectado: true,
        apuestas: { color: null, siNo: null },
        puntaje: 0
    }));
    document.getElementById('lobbyModal').style.display = 'none';
    document.getElementById('leaderboardPanel').style.display = 'flex';
    renderLeaderboard();
    actualizarUI();
    console.log('Partida iniciada con', nombres.length, 'jugadores:', nombres);
    return true;
}

export function getJugadores() {
    return state.jugadores || [];
}

export function getJugador(index) {
    if (!state.jugadores || index < 0 || index >= state.jugadores.length) {
        return null;
    }
    return state.jugadores[index];
}

export function asignarApuestaColor(jugadorIndex, color, tipo, opcion, valores) {
    const jugador = getJugador(jugadorIndex);
    if (!jugador) return false;
    if (jugador.apuestas.color) {
        mostrarMensaje('Este jugador ya tiene una apuesta de color', 'warning');
        return false;
    }
    jugador.apuestas.color = { color, tipo, opcion, valores };
    renderLeaderboard();
    return true;
}

export function asignarApuestaSiNo(jugadorIndex, lado, tipo, opcion, valores) {
    const jugador = getJugador(jugadorIndex);
    if (!jugador) return false;
    if (jugador.apuestas.siNo) {
        mostrarMensaje('Este jugador ya tiene una apuesta de Sí/No', 'warning');
        return false;
    }
    jugador.apuestas.siNo = { lado, tipo, opcion, valores };
    renderLeaderboard();
    return true;
}

export function sumarPuntosAJugador(jugadorIndex, puntos) {
    const jugador = getJugador(jugadorIndex);
    if (!jugador) return false;
    jugador.puntaje = (jugador.puntaje || 0) + puntos;
    renderLeaderboard();
    return true;
}

export function resetearJugadores() {
    if (!state.jugadores) return;
    state.jugadores.forEach(j => {
        j.cartasRobadas = 0;
        j.conectado = true;
        j.apuestas = { color: null, siNo: null };
        j.puntaje = 0;
    });
    renderLeaderboard();
    actualizarUI();
}

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
        if (modalState.jugadores.length >= 8) {
            btnAgregar.style.display = 'none';
        } else {
            btnAgregar.style.display = 'block';
        }
    }
}

export function agregarJugador() {
    if (modalState.jugadores.length >= 8) {
        mostrarMensaje('Máximo 8 jugadores', 'warning');
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

let selectorCallback = null;

// Función manejadora para el clic en el overlay
function handleModalClick(e) {
    const modal = document.getElementById('modalSeleccionJugador');
    if (e.target === modal) {
        cerrarSelectorJugador();
    }
}

export function mostrarSelectorJugador(callback, tipo) {
    const modal = document.getElementById('modalSeleccionJugador');
    const lista = document.getElementById('listaJugadoresSeleccion');
    if (!modal || !lista) return;

    const jugadores = getJugadores();
    let disponibles = jugadores;
    if (tipo === 'color') {
        disponibles = jugadores.filter(j => !j.apuestas.color);
    } else if (tipo === 'siNo') {
        disponibles = jugadores.filter(j => !j.apuestas.siNo);
    }

    if (disponibles.length === 0) {
        mostrarMensaje('No hay jugadores disponibles para este tipo de apuesta', 'warning');
        cerrarSelectorJugador();
        return;
    }

    lista.innerHTML = '';
    disponibles.forEach((j, index) => {
        const originalIndex = jugadores.indexOf(j);
        const div = document.createElement('div');
        div.className = 'jugador-input';  // Solo la clase, sin estilos inline
        div.textContent = j.nombre;
        div.addEventListener('click', () => {
            if (callback) callback(originalIndex);
            cerrarSelectorJugador();
        });
        lista.appendChild(div);
    });

    modal.removeEventListener('click', handleModalClick);
    modal.addEventListener('click', handleModalClick);

    selectorCallback = callback;
    modal.style.display = 'flex';
}

export function cerrarSelectorJugador() {
    const modal = document.getElementById('modalSeleccionJugador');
    if (modal) {
        modal.style.display = 'none';
        modal.removeEventListener('click', handleModalClick);
    }
    selectorCallback = null;
}

export function inicializarModal() {
    renderizarListaJugadores();
}

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

window.getJugadores = getJugadores;
window.toggleVistaJugadores = toggleVistaJugadores;
window.agregarJugador = agregarJugador;
window.iniciarPartida = crearJugadoresDesdeModal;
window.cerrarSeleccionJugador = cerrarSelectorJugador;
window.sumarPuntosAJugador = sumarPuntosAJugador;