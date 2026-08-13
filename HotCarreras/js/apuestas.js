// js/apuestas.js - Módulo de apuestas con preguntas aleatorias
import { CONFIG } from './config.js';

// ============================================
// LISTA DE PREGUNTAS (Sí/No)
// ============================================

const PREGUNTAS = [
    '¿Terminará Rosa entre los 2 últimos?',
    '¿Terminará Verde entre los 2 últimos?',
    '¿Terminará Naranja entre los 2 últimos?',
    '¿Terminará Morado entre los 2 últimos?',
    '¿Habrá al menos 2 Colores caídos al mismo tiempo?',
    '¿Habrá al menos 2 Colores en la línea antes de meta al mismo tiempo?',
    '¿Será descalificada al menos 1 Color?',
    '¿Se arrastrará una mascota en el tramo final?',
    '¿Estará vacío el tramo final cuando se gane el primer lugar?',
    '¿Se saldrá una mascota de los límites?',
    '¿Estarán 2 mascotas en el mismo espacio al mismo tiempo?',
    '¿Será noqueada una mascota?'
];

// ============================================
// FUNCIÓN PARA MOSTRAR APUESTA ALEATORIA
// ============================================

export function mostrarApuestaAleatoria() {
    const area = document.getElementById('apuestasArea');
    if (!area) return;

    // Elegir pregunta aleatoria
    const indice = Math.floor(Math.random() * PREGUNTAS.length);
    const pregunta = PREGUNTAS[indice];

    // Limpiar área
    area.innerHTML = '';

    // Contenedor principal
    const container = document.createElement('div');
    container.className = 'apuestas-container';

    // ---- FILA SUPERIOR: 4 colores pequeños ----
    const filaSuperior = document.createElement('div');
    filaSuperior.className = 'apuestas-fila-superior';

    const colores = ['Rosa', 'Verde', 'Naranja', 'Morado'];
    colores.forEach(color => {
        const div = document.createElement('div');
        div.className = 'apuesta-carta-pequena';
        const img = document.createElement('img');
        img.src = CONFIG.UI.IMAGENES_PATH + color + 'H.png';
        img.alt = color;
        img.draggable = false;
        img.addEventListener('click', () => {
            mostrarApuestaAleatoria();
        });
        div.appendChild(img);
        filaSuperior.appendChild(div);
    });

    container.appendChild(filaSuperior);

    // ---- FILA INFERIOR: vertical izquierdo + NegroH + vertical derecho ----
    const filaInferior = document.createElement('div');
    filaInferior.className = 'apuestas-fila-inferior';

    // Vertical izquierdo
    const izqDiv = document.createElement('div');
    izqDiv.className = 'apuesta-carta-vertical';
    const imgIzq = document.createElement('img');
    imgIzq.src = CONFIG.UI.IMAGENES_PATH + 'Negro.png';
    imgIzq.alt = 'Negro';
    imgIzq.draggable = false;
    imgIzq.addEventListener('click', () => {
        mostrarApuestaAleatoria();
    });
    izqDiv.appendChild(imgIzq);
    filaInferior.appendChild(izqDiv);

    // NegroH con texto
    const containerGrande = document.createElement('div');
    containerGrande.className = 'apuesta-carta-container';
    const imgGrande = document.createElement('img');
    imgGrande.src = CONFIG.UI.IMAGENES_PATH + 'NegroH.png';
    imgGrande.alt = 'Apuesta';
    imgGrande.className = 'apuesta-carta-img';
    imgGrande.draggable = false;
    imgGrande.addEventListener('click', () => {
        mostrarApuestaAleatoria();
    });

    const overlay = document.createElement('div');
    overlay.className = 'apuesta-texto-overlay';
    overlay.textContent = pregunta;

    containerGrande.appendChild(imgGrande);
    containerGrande.appendChild(overlay);
    filaInferior.appendChild(containerGrande);

    // Vertical derecho
    const derDiv = document.createElement('div');
    derDiv.className = 'apuesta-carta-vertical';
    const imgDer = document.createElement('img');
    imgDer.src = CONFIG.UI.IMAGENES_PATH + 'Negro.png';
    imgDer.alt = 'Negro';
    imgDer.draggable = false;
    imgDer.addEventListener('click', () => {
        mostrarApuestaAleatoria();
    });
    derDiv.appendChild(imgDer);
    filaInferior.appendChild(derDiv);

    container.appendChild(filaInferior);
    area.appendChild(container);
}

// ============================================
// INICIALIZAR
// ============================================

export function inicializarApuestas() {
    mostrarApuestaAleatoria();
}

// ============================================
// EXPONER FUNCIONES GLOBALES
// ============================================

window.mostrarApuestaAleatoria = mostrarApuestaAleatoria;
window.inicializarApuestas = inicializarApuestas;