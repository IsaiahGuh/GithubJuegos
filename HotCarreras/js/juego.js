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
    const cartas = getCartasConTexto();
    state.mazo = mezclarArray(cartas);
}

export function reiniciarJuego() {
    state.historial = [];
    state.cartaActual = null;
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

// ============================================
// FINALIZAR PARTIDA - CÁLCULO DE PUNTOS
// ============================================

export function mostrarFinalizacion() {
    const modal = document.getElementById('modalFinalizacion');
    const container = document.getElementById('ordenColoresContainer');
    if (!modal || !container) return;

    const colores = ['Rosa', 'Verde', 'Naranja', 'Morado'];
    container.innerHTML = '';
    for (let i = 1; i <= 4; i++) {
        const div = document.createElement('div');
        div.style.marginBottom = '6px';
        const label = document.createElement('label');
        label.textContent = `Posición ${i}: `;
        label.style.marginRight = '8px';
        const select = document.createElement('select');
        select.id = `posicion_${i}`;
        select.style.width = '100%';
        select.style.padding = '8px';
        select.style.background = 'var(--bg-main)';
        select.style.color = 'var(--text-main)';
        select.style.border = '1px solid var(--border-color)';
        select.style.borderRadius = '8px';
        colores.forEach(color => {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = color;
            select.appendChild(option);
        });
        div.appendChild(label);
        div.appendChild(select);
        container.appendChild(div);
    }
    modal.style.display = 'flex';
}

export function cerrarFinalizacion() {
    const modal = document.getElementById('modalFinalizacion');
    if (modal) modal.style.display = 'none';
}

export function calcularYFinalizar() {
    const modal = document.getElementById('modalFinalizacion');
    if (!modal) return;

    // Obtener orden de colores
    const orden = [];
    for (let i = 1; i <= 4; i++) {
        const select = document.getElementById(`posicion_${i}`);
        if (!select) return;
        orden.push(select.value);
    }

    // Validar que los 4 colores sean distintos
    const set = new Set(orden);
    if (set.size !== 4) {
        mostrarMensaje('Debes elegir un color diferente para cada posición', 'warning');
        return;
    }

    // Obtener resultado Sí/No
    const resultadoSiNo = document.getElementById('resultadoSiNo').value;

    // Calcular puntos
    const jugadores = getJugadores();
    jugadores.forEach((j, index) => {
        let puntos = 0;

        // Apuesta de color
        if (j.apuestas.color) {
            const { color, valores } = j.apuestas.color;
            const posicion = orden.indexOf(color) + 1; // 1-4
            let pts = 0;
            if (posicion >= 1 && posicion <= 3) {
                const ptsStr = valores[posicion - 1];
                pts = parseInt(ptsStr.replace('pts', ''), 10);
            }
            puntos += pts;
        }

        // Apuesta SI/NO
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

        // Sumar al jugador
        sumarPuntosAJugador(index, puntos);
    });

    cerrarFinalizacion();
    mostrarMensaje('Puntajes calculados y actualizados', 'success');

    // Deshabilitar botón Final
    const btnFinal = document.querySelector('.btn-final');
    if (btnFinal) btnFinal.disabled = true;
}

// Exponer funciones globales
window.mostrarFinalizacion = mostrarFinalizacion;
window.cerrarFinalizacion = cerrarFinalizacion;
window.calcularYFinalizar = calcularYFinalizar;