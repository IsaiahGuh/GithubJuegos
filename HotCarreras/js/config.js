// js/config.js
export const COLORS = [
    { nombre: 'Azul', imagen: 'Azul.png' },
    { nombre: 'Morado', imagen: 'Morado.png' },
    { nombre: 'Naranja', imagen: 'Naranja.png' },
    { nombre: 'Negro', imagen: 'Negro.png' },
    { nombre: 'Rosa', imagen: 'Rosa.png' },
    { nombre: 'Verde', imagen: 'Verde.png' }
];

export const CONFIG = {
    GAME: {
        // Ya no usamos CARTAS_POR_COLOR, ahora las cartas vienen de cartas.js
    },
    UI: {
        IMAGENES_PATH: 'imagenes/',
    },
    JUGADORES: {
        MIN: 2,
        MAX: 6,
    }
};

export const state = {
    mazo: [],
    historial: [],
    cartaActual: null,
    jugadores: [],
    // turnoActual eliminado
    anguloZoomActual: 0
};

export function initState() {
    state.mazo = [];
    state.historial = [];
    state.cartaActual = null;
    state.jugadores = [];
    state.anguloZoomActual = 0;
}