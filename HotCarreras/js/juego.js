// juego.js
import { CONFIG, state } from './config.js';
import { getCartasConTexto } from './cartas.js';
import { resetearJugadores, getJugadores, sumarPuntosAJugador } from './jugadores.js';

function mezclarArray(array) {
    const copia = [...array];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

export function generarMazo() {
    const todasLasCartas = getCartasConTexto();
    state.mazoCompleto = todasLasCartas;
    
    const numJugadores = getJugadores().length;
    const cantidadCartas = CONFIG.GAME.CARTAS_POR_JUGADOR[numJugadores] || 20;
    
    if (!state.mazoInicial) {
        const cartasSeleccionadas = seleccionarCartasAleatorias(todasLasCartas, cantidadCartas);
        state.mazoInicial = cartasSeleccionadas;
    }
    
    state.mazo = mezclarArray(state.mazoInicial);
    
    console.log(`Mazo generado con ${state.mazo.length} cartas para ${numJugadores} jugadores`);
}

function seleccionarCartasAleatorias(cartas, cantidad) {
    const copia = [...cartas];
    const seleccionadas = [];
    const total = copia.length;
    
    if (cantidad > total) {
        console.warn(`Solo hay ${total} cartas disponibles, se usan todas`);
        return copia;
    }
    
    for (let i = 0; i < cantidad; i++) {
        const idx = Math.floor(Math.random() * (total - i));
        seleccionadas.push(copia[idx]);
        [copia[idx], copia[total - 1 - i]] = [copia[total - 1 - i], copia[idx]];
    }
    
    return seleccionadas;
}

export function mezclarMazo() {
    if (!state.mazoInicial) {
        generarMazo();
    } else {
        state.mazo = mezclarArray(state.mazoInicial);
        actualizarUI();
    }
}

export function reiniciarJuego() {
    state.historial = [];
    state.cartaActual = null;
    state.mazoInicial = null;
    generarMazo();
    resetearJugadores();
    actualizarUI();
    const btnFinal = document.querySelector('.btn-final');
    if (btnFinal) btnFinal.disabled = false;
}

export function robarCarta() {
    if (state.mazo.length === 0) {
        mostrarMensaje('No hay cartas en el mazo.', 'warning');
        return null;
    }
    const carta = state.mazo.pop();
    state.cartaActual = carta;
    state.historial.unshift({ ...carta, timestamp: Date.now() });
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

export function actualizarUI() {
    if (window._actualizarUICallback) {
        window._actualizarUICallback();
    }
}

export function setActualizarUICallback(callback) {
    window._actualizarUICallback = callback;
}

export function mostrarFinalizacion() {
    const modal = document.getElementById('modalFinalizacion');
    if (!modal) return;
    modal.style.display = 'flex';

    const podioContainer = document.getElementById('podioContainer');
    const pos4Container = document.getElementById('pos4Container');
    const toggleContainer = document.getElementById('toggleSiNoContainer');
    if (!podioContainer || !pos4Container || !toggleContainer) return;

    const colores = ['Rosa', 'Verde', 'Naranja', 'Morado'];

    podioContainer.innerHTML = '';
    pos4Container.innerHTML = '';
    toggleContainer.innerHTML = '';

    for (let i = 1; i <= 3; i++) {
        const col = document.createElement('div');
        col.className = 'podio-col';
        const numSpan = document.createElement('span');
        numSpan.className = 'numero';
        numSpan.textContent = i;
        col.appendChild(numSpan);

        const select = document.createElement('select');
        select.id = `posicion_${i}`;
        colores.forEach(color => {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = color;
            select.appendChild(option);
        });
        col.appendChild(select);
        podioContainer.appendChild(col);
    }

    const pos4Div = document.createElement('div');
    pos4Div.className = 'pos4-item';
    const num4 = document.createElement('span');
    num4.className = 'numero';
    num4.textContent = '4';
    pos4Div.appendChild(num4);

    const select4 = document.createElement('select');
    select4.id = 'posicion_4';
    colores.forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = color;
        select4.appendChild(option);
    });
    pos4Div.appendChild(select4);
    pos4Container.appendChild(pos4Div);

    const btnSi = document.createElement('button');
    btnSi.className = 'toggle-btn active';
    btnSi.textContent = 'Si';
    btnSi.dataset.value = 'SI';
    const btnNo = document.createElement('button');
    btnNo.className = 'toggle-btn';
    btnNo.textContent = 'No';
    btnNo.dataset.value = 'NO';

    const toggleClick = (e) => {
        const target = e.currentTarget;
        toggleContainer.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        target.classList.add('active');
    };
    btnSi.addEventListener('click', toggleClick);
    btnNo.addEventListener('click', toggleClick);

    toggleContainer.appendChild(btnSi);
    toggleContainer.appendChild(btnNo);
}

export function cerrarFinalizacion() {
    const modal = document.getElementById('modalFinalizacion');
    if (modal) modal.style.display = 'none';
}

export function calcularYFinalizar() {
    const modal = document.getElementById('modalFinalizacion');
    if (!modal) return;

    const orden = [];
    for (let i = 1; i <= 4; i++) {
        const select = document.getElementById(`posicion_${i}`);
        if (!select) return;
        orden.push(select.value);
    }

    const set = new Set(orden);
    if (set.size !== 4) {
        mostrarMensaje('Debes elegir un color diferente para cada posicion', 'warning');
        return;
    }

    const toggleContainer = document.getElementById('toggleSiNoContainer');
    const activeBtn = toggleContainer?.querySelector('.toggle-btn.active');
    if (!activeBtn) {
        mostrarMensaje('Selecciona Si o No', 'warning');
        return;
    }
    const resultadoSiNo = activeBtn.dataset.value;

    const jugadores = getJugadores();
    jugadores.forEach((j, index) => {
        let puntos = 0;

        if (j.apuestas.color) {
            const { color, valores } = j.apuestas.color;
            const posicion = orden.indexOf(color) + 1;
            let pts = 0;
            if (posicion >= 1 && posicion <= 3) {
                const ptsStr = valores[posicion - 1];
                pts = parseInt(ptsStr.replace('pts', ''), 10);
            }
            puntos += pts;
        }

        if (j.apuestas.siNo) {
            const { lado, valores } = j.apuestas.siNo;
            let filaIndice = -1;
            if (lado === 'izquierda') {
                filaIndice = resultadoSiNo === 'SI' ? 0 : 1;
            } else {
                filaIndice = resultadoSiNo === 'NO' ? 0 : 1;
            }
            if (filaIndice !== -1 && valores && valores[filaIndice]) {
                const ptsStr = valores[filaIndice][1];
                const pts = parseInt(ptsStr.replace('pts', ''), 10);
                puntos += pts;
            }
        }

        sumarPuntosAJugador(index, puntos);
    });

    cerrarFinalizacion();
    mostrarMensaje('Puntajes calculados y actualizados', 'success');

    const btnFinal = document.querySelector('.btn-final');
    if (btnFinal) btnFinal.disabled = true;
}

window.mostrarFinalizacion = mostrarFinalizacion;
window.cerrarFinalizacion = cerrarFinalizacion;
window.calcularYFinalizar = calcularYFinalizar;