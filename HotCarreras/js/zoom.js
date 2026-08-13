// js/zoom.js - LÓGICA DE ZOOM Y VISUALIZACIÓN DE CARTAS
import { CONFIG, state } from './config.js';

// ============================================
// CREAR ELEMENTO CARTA CON TEXTO
// ============================================

export function crearCartaElement(carta, size = 'zoom', esHorizontal = false) {
    const container = document.createElement('div');
    container.className = `carta-con-texto carta-${size}`;
    
    if (esHorizontal) {
        container.classList.add('carta-horizontal');
    }

    const img = document.createElement('img');
    img.src = CONFIG.UI.IMAGENES_PATH + carta.imagen;
    img.alt = carta.nombre || 'Carta';
    container.appendChild(img);

    const hasText = carta.grande || carta.pequeno || carta.superior;
    if (hasText) {
        const overlay = document.createElement('div');
        overlay.className = 'carta-texto-overlay';

        if (carta.superior) {
            const sup = document.createElement('div');
            sup.className = 'carta-texto-superior';
            sup.textContent = carta.superior;
            overlay.appendChild(sup);
        }

        if (carta.grande) {
            const grande = document.createElement('div');
            grande.className = 'carta-texto-grande';
            grande.textContent = carta.grande;
            overlay.appendChild(grande);
        }

        if (carta.pequeno) {
            const pequeno = document.createElement('div');
            pequeno.className = 'carta-texto-pequeno';
            pequeno.textContent = carta.pequeno;
            overlay.appendChild(pequeno);
        }

        container.appendChild(overlay);
    }

    const imgElement = container.querySelector('img');
    if (imgElement) {
        imgElement.style.pointerEvents = 'auto';
    }

    return container;
}

// ============================================
// MOSTRAR ZOOM
// ============================================

export function mostrarZoom(carta, esHorizontal = false) {
    const modal = document.getElementById('modalZoom');
    const contenido = modal.querySelector('.zoom-contenido');
    if (!modal || !contenido) return;

    contenido.innerHTML = '';
    
    const cartaElement = crearCartaElement(carta, 'zoom', esHorizontal);
    cartaElement.id = 'zoomCarta';
    contenido.appendChild(cartaElement);

    // Configurar rotación al hacer clic en la imagen
    const img = cartaElement.querySelector('img');
    if (img) {
        img.addEventListener('click', () => {
            const el = document.getElementById('zoomCarta');
            if (el) {
                state.anguloZoomActual = (state.anguloZoomActual + 90) % 360;
                el.style.transform = `rotate(${state.anguloZoomActual}deg)`;
            }
        });
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
// EXPONER FUNCIONES GLOBALES
// ============================================

window.mostrarZoom = mostrarZoom;
window.cerrarZoom = cerrarZoom;