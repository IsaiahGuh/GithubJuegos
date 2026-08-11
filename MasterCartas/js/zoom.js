// js/zoom.js - ZOOM DE CARTAS
import { CONFIG, state } from './config.js';

// ============================================
// ABRIR ZOOM
// ============================================

export function abrirZoom(carta) {
    const modal = document.getElementById('modalZoom');
    const img = document.getElementById('zoomImg');
    const texto = document.getElementById('zoomTexto');
    if (!modal || !img || !texto) return;

    img.src = `${CONFIG.UI.IMAGENES_PATH}${carta.imagen}`;
    img.style.transform = 'rotate(0deg)';
    state.anguloZoomActual = 0;

    if (carta.textoPersonalizado && carta.textoPersonalizado !== '') {
        texto.textContent = carta.textoPersonalizado;
        texto.style.display = 'block';
    } else {
        texto.style.display = 'none';
    }

    modal.style.display = 'flex';
}

// ============================================
// CERRAR ZOOM
// ============================================

export function cerrarZoom() {
    const modal = document.getElementById('modalZoom');
    if (modal) modal.style.display = 'none';
}

// ============================================
// ROTAR ZOOM
// ============================================

export function rotarZoom() {
    const img = document.getElementById('zoomImg');
    if (img) {
        state.anguloZoomActual = (state.anguloZoomActual + 90) % 360;
        img.style.transform = `rotate(${state.anguloZoomActual}deg)`;
    }
}

// ============================================
// CONFIGURAR EVENTOS
// ============================================

export function configurarZoomEventos() {
    const img = document.getElementById('zoomImg');
    if (img) {
        img.addEventListener('click', rotarZoom);
    }
}