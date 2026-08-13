// js/zoom.js - LÓGICA DE ZOOM Y VISUALIZACIÓN DE CARTAS
import { CONFIG, state } from './config.js';
import { getJugador, mostrarSelectorJugador, asignarApuestaColor, asignarApuestaSiNo } from './jugadores.js';

// ============================================
// ALMACENAMIENTO DE VALORES ARRIESGADOS (persistentes entre aperturas)
// ============================================

const valoresArriesgados = {
    color: {},   // clave: color (ej. 'Rosa'), valor: [random1, random2, random3]
    siNo: {}    // clave: lado (ej. 'izquierda'), valor: { alto, bajo }
};

// ============================================
// CREAR ELEMENTO CARTA CON TEXTO
// ============================================

export function crearCartaElement(carta, size = 'zoom', esHorizontal = false) {
    const container = document.createElement('div');
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

    if (carta.tipo === 'negro' && carta.filas) {
        const overlay = document.createElement('div');
        overlay.className = 'carta-texto-overlay apuesta-negro-overlay';
        const wrapper = document.createElement('div');
        wrapper.className = 'apuesta-negro-container';
        carta.filas.forEach((fila, index) => {
            const filaDiv = document.createElement('div');
            filaDiv.className = 'apuesta-negro-fila';
            if (index < carta.filas.length - 1) {
                filaDiv.classList.add('con-borde');
            }
            const celdaIzq = document.createElement('div');
            celdaIzq.className = 'apuesta-negro-celda condicion';
            celdaIzq.textContent = fila[0];
            filaDiv.appendChild(celdaIzq);
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
// MOSTRAR ZOOM (cartas normales)
// ============================================

export function mostrarZoom(carta, esHorizontal = false) {
    const modal = document.getElementById('modalZoom');
    const contenido = modal.querySelector('.zoom-contenido');
    if (!modal || !contenido) return;
    contenido.innerHTML = '';
    const cartaElement = crearCartaElement(carta, 'zoom', esHorizontal);
    cartaElement.id = 'zoomCarta';
    contenido.appendChild(cartaElement);
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
// SELECCIÓN DE APUESTA DE COLOR
// ============================================

export function mostrarZoomApuestaColorSeleccion(color) {
    const modal = document.getElementById('modalZoom');
    const contenido = modal.querySelector('.zoom-contenido');
    if (!modal || !contenido) return;
    contenido.innerHTML = '';

    // Obtener o generar valores para opción arriesgada (persistentes)
    if (!valoresArriesgados.color[color]) {
        valoresArriesgados.color[color] = [
            Math.floor(Math.random() * 11) + 15,
            Math.floor(Math.random() * 4),
            Math.floor(Math.random() * 11) - 10
        ];
    }
    const [r1, r2, r3] = valoresArriesgados.color[color];

    const container = document.createElement('div');
    container.className = 'zoom-apuesta-container';

    // Opción 1 (Segura)
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
    const wrap1 = document.createElement('div');
    wrap1.appendChild(el1);
    const btnSegura = document.createElement('button');
    btnSegura.textContent = 'Segura';
    btnSegura.className = 'btn-control btn-secondary';
    btnSegura.addEventListener('click', () => {
        const valores = ['10pts', '5pts', '3pts'];
        mostrarSelectorJugador((index) => {
            asignarApuestaColor(index, color, 'segura', 1, valores);
            cerrarZoom();
        });
    });
    wrap1.appendChild(btnSegura);
    container.appendChild(wrap1);

    // Opción 2 (Arriesgada) con valores actuales
    const carta2 = {
        imagen: `${color}H.png`,
        nombre: color,
        esApuestaColor: true,
        filas: [
            ['1', '2', '3'],
            [`${r1}pts`, `${r2}pts`, `${r3}pts`]
        ]
    };
    const el2 = crearCartaElement(carta2, 'apuestaColor', true);
    const wrap2 = document.createElement('div');
    wrap2.appendChild(el2);
    const btnArriesgada = document.createElement('button');
    btnArriesgada.textContent = 'Arriesgada';
    btnArriesgada.className = 'btn-control btn-primary';

    // Capturar los valores actuales antes de abrir el selector
    const valoresActuales = [`${r1}pts`, `${r2}pts`, `${r3}pts`];

    btnArriesgada.addEventListener('click', () => {
        mostrarSelectorJugador((index) => {
            // Asignar con los valores actuales (los que se ven en la carta)
            asignarApuestaColor(index, color, 'arriesgada', 2, valoresActuales);
            // Después de asignar, regenerar nuevos valores para futuras apuestas
            const nuevos = [
                Math.floor(Math.random() * 11) + 15,
                Math.floor(Math.random() * 4),
                Math.floor(Math.random() * 11) - 10
            ];
            valoresArriesgados.color[color] = nuevos;
            cerrarZoom();
        });
    });
    wrap2.appendChild(btnArriesgada);
    container.appendChild(wrap2);

    contenido.appendChild(container);
    modal.style.display = 'flex';
}

// ============================================
// SELECCIÓN DE APUESTA SÍ/NO (vertical)
// ============================================

export function mostrarZoomApuestaNegroSeleccion(lado) {
    const modal = document.getElementById('modalZoom');
    const contenido = modal.querySelector('.zoom-contenido');
    if (!modal || !contenido) return;
    contenido.innerHTML = '';

    // Obtener o generar valores para opción arriesgada (persistentes)
    if (!valoresArriesgados.siNo[lado]) {
        valoresArriesgados.siNo[lado] = {
            alto: Math.floor(Math.random() * 6) + 10,
            bajo: Math.floor(Math.random() * 6) - 5
        };
    }
    const { alto, bajo } = valoresArriesgados.siNo[lado];

    let opcion1_filas, opcion2_filas;
    let label1, label2, tipo1, tipo2;

    if (lado === 'izquierda') {
        opcion1_filas = [['SI', '5pts'], ['NO', '0pts']];
        opcion2_filas = [['SI', `${alto}pts`], ['NO', `${bajo}pts`]];
        label1 = 'Sí-Seguro';
        label2 = 'Sí-Arriesgado';
        tipo1 = 'seguro';
        tipo2 = 'arriesgado';
    } else {
        opcion1_filas = [['NO', '5pts'], ['SI', '0pts']];
        opcion2_filas = [['NO', `${alto}pts`], ['SI', `${bajo}pts`]];
        label1 = 'No-Seguro';
        label2 = 'No-Arriesgado';
        tipo1 = 'seguro';
        tipo2 = 'arriesgado';
    }

    const container = document.createElement('div');
    container.className = 'zoom-apuesta-container';

    // Opción 1 (Seguro)
    const carta1 = { imagen: 'Negro.png', nombre: 'Negro', tipo: 'negro', filas: opcion1_filas };
    const el1 = crearCartaElement(carta1, 'apuestaColorVertical', false);
    const wrap1 = document.createElement('div');
    wrap1.appendChild(el1);
    const btn1 = document.createElement('button');
    btn1.textContent = label1;
    btn1.className = 'btn-control btn-secondary';
    btn1.addEventListener('click', () => {
        const valores = opcion1_filas;
        mostrarSelectorJugador((index) => {
            asignarApuestaSiNo(index, lado, tipo1, 1, valores);
            cerrarZoom();
        });
    });
    wrap1.appendChild(btn1);
    container.appendChild(wrap1);

    // Opción 2 (Arriesgado) con valores actuales
    const carta2 = { imagen: 'Negro.png', nombre: 'Negro', tipo: 'negro', filas: opcion2_filas };
    const el2 = crearCartaElement(carta2, 'apuestaColorVertical', false);
    const wrap2 = document.createElement('div');
    wrap2.appendChild(el2);
    const btn2 = document.createElement('button');
    btn2.textContent = label2;
    btn2.className = 'btn-control btn-primary';

    // Capturar los valores actuales antes de abrir el selector
    const valoresActuales = opcion2_filas.slice(); // copia

    btn2.addEventListener('click', () => {
        mostrarSelectorJugador((index) => {
            // Asignar con los valores actuales (los que se ven en la carta)
            asignarApuestaSiNo(index, lado, tipo2, 2, valoresActuales);
            // Después de asignar, regenerar nuevos valores para futuras apuestas
            const nuevoAlto = Math.floor(Math.random() * 6) + 10;
            const nuevoBajo = Math.floor(Math.random() * 6) - 5;
            valoresArriesgados.siNo[lado] = { alto: nuevoAlto, bajo: nuevoBajo };
            cerrarZoom();
        });
    });
    wrap2.appendChild(btn2);
    container.appendChild(wrap2);

    contenido.appendChild(container);
    modal.style.display = 'flex';
}

// ============================================
// MOSTRAR APUESTAS DE UN JUGADOR (desde leaderboard)
// ============================================

export function mostrarApuestasJugador(jugadorIndex) {
    const jugador = getJugador(jugadorIndex);
    if (!jugador) return;
    const apuestas = jugador.apuestas || {};
    const modal = document.getElementById('modalZoom');
    const contenido = modal.querySelector('.zoom-contenido');
    if (!modal || !contenido) return;
    contenido.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'zoom-apuesta-container';

    // Apuesta de color
    if (apuestas.color) {
        const { color, tipo, valores } = apuestas.color;
        const filas = [
            ['1', '2', '3'],
            valores
        ];
        const carta = {
            imagen: `${color}H.png`,
            nombre: color,
            esApuestaColor: true,
            filas: filas
        };
        const el = crearCartaElement(carta, 'apuestaColor', true);
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:white;padding:4px 12px;border-radius:4px;font-weight:bold;font-size:0.9rem;';
        overlay.textContent = tipo.toUpperCase();
        el.style.position = 'relative';
        el.appendChild(overlay);
        const wrap = document.createElement('div');
        wrap.appendChild(el);
        container.appendChild(wrap);
    } else {
        const msg = document.createElement('p');
        msg.textContent = 'Sin apuesta de color';
        msg.style.color = 'white';
        container.appendChild(msg);
    }

    // Apuesta de Sí/No
    if (apuestas.siNo) {
        const { tipo, valores } = apuestas.siNo;
        const carta = {
            imagen: 'Negro.png',
            nombre: 'Negro',
            tipo: 'negro',
            filas: valores
        };
        const el = crearCartaElement(carta, 'apuestaColorVertical', false);
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:white;padding:4px 12px;border-radius:4px;font-weight:bold;font-size:0.9rem;';
        overlay.textContent = tipo.toUpperCase();
        el.style.position = 'relative';
        el.appendChild(overlay);
        const wrap = document.createElement('div');
        wrap.appendChild(el);
        container.appendChild(wrap);
    } else {
        const msg = document.createElement('p');
        msg.textContent = 'Sin apuesta de Sí/No';
        msg.style.color = 'white';
        container.appendChild(msg);
    }

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
// EXPONER FUNCIONES GLOBALES (para uso en HTML)
// ============================================

window.mostrarZoom = mostrarZoom;
window.cerrarZoom = cerrarZoom;
window.mostrarZoomApuestaColorSeleccion = mostrarZoomApuestaColorSeleccion;
window.mostrarZoomApuestaNegroSeleccion = mostrarZoomApuestaNegroSeleccion;
window.mostrarApuestasJugador = mostrarApuestasJugador;