import { CONFIG } from './config.js';
import { mostrarZoom, mostrarZoomApuestaColorSeleccion, mostrarZoomApuestaNegroSeleccion } from './zoom.js';

const PREGUNTAS = [
    '¿Terminara Rosa entre los 2 ultimos?',
    '¿Terminara Verde entre los 2 ultimos?',
    '¿Terminara Naranja entre los 2 ultimos?',
    '¿Terminara Morado entre los 2 ultimos?',
    '¿Habra al menos 2 Colores caidos al mismo tiempo?',
    '¿Habra al menos 2 Colores en la linea antes de meta al mismo tiempo?',
    '¿Sera descalificado al menos 1 Color?',
    '¿Se arrastrara un Color en el tramo final?',
    '¿Estara vacio el tramo final cuando se gane el primer lugar?',
    '¿Se saldra un Color de los limites?',
    '¿Estaran 2 Colores en el mismo espacio al mismo tiempo?',
    '¿Sera noqueado un Color?'
];

export function mostrarApuestaAleatoria() {
    const area = document.getElementById('apuestasArea');
    if (!area) return;
    const indice = Math.floor(Math.random() * PREGUNTAS.length);
    const pregunta = PREGUNTAS[indice];
    area.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'apuestas-container';

    // FILA SUPERIOR: 4 colores pequeños
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
        div.appendChild(img);
        div.addEventListener('click', () => {
            mostrarZoomApuestaColorSeleccion(color);
        });
        filaSuperior.appendChild(div);
    });
    container.appendChild(filaSuperior);

    // FILA INFERIOR: vertical izquierdo + NegroH + vertical derecho
    const filaInferior = document.createElement('div');
    filaInferior.className = 'apuestas-fila-inferior';
    const izqDiv = document.createElement('div');
    izqDiv.className = 'apuesta-carta-vertical';
    const imgIzq = document.createElement('img');
    imgIzq.src = CONFIG.UI.IMAGENES_PATH + 'Negro.png';
    imgIzq.alt = 'Negro Izquierda';
    imgIzq.draggable = false;
    izqDiv.appendChild(imgIzq);
    izqDiv.style.cursor = 'pointer';
    izqDiv.addEventListener('click', () => {
        mostrarZoomApuestaNegroSeleccion('izquierda');
    });
    filaInferior.appendChild(izqDiv);

    const containerGrande = document.createElement('div');
    containerGrande.className = 'apuesta-carta-container';
    const imgGrande = document.createElement('img');
    imgGrande.src = CONFIG.UI.IMAGENES_PATH + 'NegroH.png';
    imgGrande.alt = 'Apuesta';
    imgGrande.className = 'apuesta-carta-img';
    imgGrande.draggable = false;
    imgGrande.style.cursor = 'pointer';
    imgGrande.addEventListener('click', () => {
        const cartaZoom = {
            nombre: 'Apuesta',
            imagen: 'NegroH.png',
            grande: '?',
            pequeno: pregunta,
            superior: ''
        };
        mostrarZoom(cartaZoom, true);
    });
    const overlay = document.createElement('div');
    overlay.className = 'apuesta-texto-overlay';
    overlay.textContent = pregunta;
    containerGrande.appendChild(imgGrande);
    containerGrande.appendChild(overlay);
    filaInferior.appendChild(containerGrande);

    const derDiv = document.createElement('div');
    derDiv.className = 'apuesta-carta-vertical';
    const imgDer = document.createElement('img');
    imgDer.src = CONFIG.UI.IMAGENES_PATH + 'Negro.png';
    imgDer.alt = 'Negro Derecha';
    imgDer.draggable = false;
    derDiv.appendChild(imgDer);
    derDiv.style.cursor = 'pointer';
    derDiv.addEventListener('click', () => {
        mostrarZoomApuestaNegroSeleccion('derecha');
    });
    filaInferior.appendChild(derDiv);
    container.appendChild(filaInferior);
    area.appendChild(container);
}

export function inicializarApuestas() {
    mostrarApuestaAleatoria();
}