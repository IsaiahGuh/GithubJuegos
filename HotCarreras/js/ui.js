// js/ui.js - INTERFAZ DE USUARIO
import { CONFIG, state } from './config.js';
import { getCartasRestantes, getHistorial } from './juego.js';
import { getJugadores, getTurnoActual } from './jugadores.js';

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
// CREAR ELEMENTO CARTA CON TEXTO
// ============================================

export function crearCartaElement(carta, size = 'zoom') {
    const container = document.createElement('div');
    container.className = `carta-con-texto carta-${size}`;

    // Imagen de fondo
    const img = document.createElement('img');
    img.src = CONFIG.UI.IMAGENES_PATH + carta.imagen;
    img.alt = carta.nombre;
    container.appendChild(img);

    // Overlay de texto (solo si hay texto)
    const hasText = carta.grande || carta.pequeno || carta.superior;
    if (hasText) {
        const overlay = document.createElement('div');
        overlay.className = 'carta-texto-overlay';

        // Texto superior (opcional)
        if (carta.superior) {
            const sup = document.createElement('div');
            sup.className = 'carta-texto-superior';
            sup.textContent = carta.superior;
            overlay.appendChild(sup);
        }

        // Texto grande (principal)
        if (carta.grande) {
            const grande = document.createElement('div');
            grande.className = 'carta-texto-grande';
            grande.textContent = carta.grande;
            overlay.appendChild(grande);
        }

        // Texto pequeño (debajo del grande)
        if (carta.pequeno) {
            const pequeno = document.createElement('div');
            pequeno.className = 'carta-texto-pequeno';
            pequeno.textContent = carta.pequeno;
            overlay.appendChild(pequeno);
        }

        container.appendChild(overlay);
    }

    // Para el zoom, permitir rotación al hacer clic en la imagen (no en el overlay)
    const imgElement = container.querySelector('img');
    if (imgElement) {
        imgElement.style.pointerEvents = 'auto';
    }

    return container;
}

// ============================================
// MOSTRAR ZOOM
// ============================================

export function mostrarZoom(carta) {
    const modal = document.getElementById('modalZoom');
    const contenido = modal.querySelector('.zoom-contenido');
    if (!modal || !contenido) return;

    // Limpiar contenido anterior
    contenido.innerHTML = '';
    
    // Crear elemento carta
    const cartaElement = crearCartaElement(carta, 'zoom');
    cartaElement.id = 'zoomCarta';
    contenido.appendChild(cartaElement);

    // Añadir botón cerrar
    const btn = document.createElement('button');
    btn.id = 'cerrarZoomBtn';
    btn.className = 'cerrar-zoom-btn';
    btn.textContent = 'X';
    btn.addEventListener('click', cerrarZoom);
    contenido.appendChild(btn);

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

export function cerrarZoom() {
    const modal = document.getElementById('modalZoom');
    if (modal) modal.style.display = 'none';
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

            // Crear carta en tamaño pequeño
            const cartaElement = crearCartaElement(carta, 'historial');
            item.appendChild(cartaElement);

            // Al hacer clic en el item, abrir zoom
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
    const cerrarHistorial = document.getElementById('cerrarHistorialBtn');
    if (cerrarHistorial) {
        cerrarHistorial.addEventListener('click', ocultarHistorial);
    }

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
window.mostrarZoom = mostrarZoom;
window.cerrarZoom = cerrarZoom;