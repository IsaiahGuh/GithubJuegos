// js/zoom.js - LÓGICA DE ZOOM Y VISUALIZACIÓN DE CARTAS
import { CONFIG, state } from './config.js';

// ============================================
// CREAR ELEMENTO CARTA CON TEXTO
// ============================================

export function crearCartaElement(carta, size = 'zoom', esHorizontal = false) {
    const container = document.createElement('div');
    // Para cartas verticales de apuesta (Negro) usamos clase específica
    if (carta.tipo === 'negro') {
        container.className = `carta-con-texto carta-apuestaColorVertical`;
    } else if (carta.esApuestaColor && !esHorizontal && size === 'apuestaColorVertical') {
        container.className = `carta-con-texto carta-apuestaColorVertical`;
    } else {
        container.className = `carta-con-texto carta-${size}`;
        if (esHorizontal) {
            container.classList.add('carta-horizontal');
        }
    }

    const img = document.createElement('img');
    img.src = CONFIG.UI.IMAGENES_PATH + carta.imagen;
    img.alt = carta.nombre || 'Carta';
    container.appendChild(img);

    // Caso especial: carta de apuesta vertical (Negro) con layout SI/NO + pts
    if (carta.tipo === 'negro' && carta.filas) {
        const overlay = document.createElement('div');
        overlay.className = 'carta-texto-overlay apuesta-negro-overlay';

        const wrapper = document.createElement('div');
        wrapper.className = 'apuesta-negro-container';

        // Cada fila tiene dos celdas: izquierda (SI/NO) y derecha (pts)
        carta.filas.forEach((fila, index) => {
            const filaDiv = document.createElement('div');
            filaDiv.className = 'apuesta-negro-fila';
            // Si no es la última fila, agregar clase para borde inferior (línea divisoria)
            if (index < carta.filas.length - 1) {
                filaDiv.classList.add('con-borde');
            }

            // Celda izquierda: condición (SI/NO)
            const celdaIzq = document.createElement('div');
            celdaIzq.className = 'apuesta-negro-celda condicion';
            celdaIzq.textContent = fila[0];
            filaDiv.appendChild(celdaIzq);

            // Celda derecha: puntos
            const celdaDer = document.createElement('div');
            celdaDer.className = 'apuesta-negro-celda puntos';
            celdaDer.textContent = fila[1];
            filaDiv.appendChild(celdaDer);

            wrapper.appendChild(filaDiv);
        });

        overlay.appendChild(wrapper);
        container.appendChild(overlay);
        return container;
    }

    // Caso especial: apuesta de color horizontal con filas (3 columnas)
    if (carta.esApuestaColor && carta.filas) {
        const overlay = document.createElement('div');
        overlay.className = 'carta-texto-overlay apuesta-color-overlay';

        const wrapper = document.createElement('div');
        wrapper.className = 'apuesta-filas-container';

        carta.filas.forEach((fila) => {
            const filaDiv = document.createElement('div');
            filaDiv.className = 'apuesta-fila';

            fila.forEach((texto) => {
                const celda = document.createElement('div');
                celda.className = 'apuesta-celda';
                celda.textContent = texto;
                filaDiv.appendChild(celda);
            });

            wrapper.appendChild(filaDiv);
        });

        overlay.appendChild(wrapper);
        container.appendChild(overlay);
        return container;
    }

    // Overlay estándar para otras cartas
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
// MOSTRAR ZOOM (para cartas normales)
// ============================================

export function mostrarZoom(carta, esHorizontal = false) {
    const modal = document.getElementById('modalZoom');
    const contenido = modal.querySelector('.zoom-contenido');
    if (!modal || !contenido) return;

    contenido.innerHTML = '';

    const cartaElement = crearCartaElement(carta, 'zoom', esHorizontal);
    cartaElement.id = 'zoomCarta';
    contenido.appendChild(cartaElement);

    // Rotación al hacer clic en la imagen
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
// MOSTRAR ZOOM PARA APUESTAS DE COLOR (horizontales)
// ============================================

export function mostrarZoomApuestaColor(color) {
    const modal = document.getElementById('modalZoom');
    const contenido = modal.querySelector('.zoom-contenido');
    if (!modal || !contenido) return;

    contenido.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'zoom-apuesta-container';

    // Opción 1 fija
    const carta1 = {
        imagen: `${color}H.png`,
        nombre: color,
        esApuestaColor: true,
        filas: [
            ['1', '2', '3'],
            ['10pts', '5pts', '3pts']
        ]
    };
    const el1 = crearCartaElement(carta1, 'apuestaColor', true);
    container.appendChild(el1);

    // Opción 2 aleatoria
    const random1 = Math.floor(Math.random() * 11) + 15;
    const random2 = Math.floor(Math.random() * 4);
    const random3 = Math.floor(Math.random() * 11) - 10;
    const carta2 = {
        imagen: `${color}H.png`,
        nombre: color,
        esApuestaColor: true,
        filas: [
            ['1', '2', '3'],
            [`${random1}pts`, `${random2}pts`, `${random3}pts`]
        ]
    };
    const el2 = crearCartaElement(carta2, 'apuestaColor', true);
    container.appendChild(el2);

    contenido.appendChild(container);
    modal.style.display = 'flex';
}

// ============================================
// MOSTRAR ZOOM PARA NEGRO.png (verticales)
// ============================================

export function mostrarZoomApuestaNegro(posicion) {
    const modal = document.getElementById('modalZoom');
    const contenido = modal.querySelector('.zoom-contenido');
    if (!modal || !contenido) return;

    contenido.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'zoom-apuesta-container';

    // Generar números aleatorios para la opción 2
    const rangoAlto = Math.floor(Math.random() * 6) + 10; // 10–15
    const rangoBajo = Math.floor(Math.random() * 6) - 5;   // -5–0

    let opcion1_filas, opcion2_filas;

    if (posicion === 'izquierda') {
        // Opción 1: SI 5pts / NO 0pts
        opcion1_filas = [
            ['SI', '5pts'],
            ['NO', '0pts']
        ];
        // Opción 2: SI (10-15pts) / NO (-5-0pts)
        opcion2_filas = [
            ['SI', `${rangoAlto}pts`],
            ['NO', `${rangoBajo}pts`]
        ];
    } else { // derecha
        // Opción 1: NO 5pts / SI 0pts
        opcion1_filas = [
            ['NO', '5pts'],
            ['SI', '0pts']
        ];
        // Opción 2: NO (10-15pts) / SI (-5-0pts)
        opcion2_filas = [
            ['NO', `${rangoAlto}pts`],
            ['SI', `${rangoBajo}pts`]
        ];
    }

    const carta1 = {
        imagen: 'Negro.png',
        nombre: 'Negro',
        tipo: 'negro',  // identificador para layout vertical especial
        filas: opcion1_filas
    };
    const el1 = crearCartaElement(carta1, 'apuestaColorVertical', false);
    container.appendChild(el1);

    const carta2 = {
        imagen: 'Negro.png',
        nombre: 'Negro',
        tipo: 'negro',
        filas: opcion2_filas
    };
    const el2 = crearCartaElement(carta2, 'apuestaColorVertical', false);
    container.appendChild(el2);

    contenido.appendChild(container);
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
window.mostrarZoomApuestaColor = mostrarZoomApuestaColor;
window.mostrarZoomApuestaNegro = mostrarZoomApuestaNegro;