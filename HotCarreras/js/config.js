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
    GAME: {},
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
    anguloZoomActual: 0,
    apuestaPendiente: null // { tipo: 'color' | 'siNo', data: { ... } }
};

export function initState() {
    state.mazo = [];
    state.historial = [];
    state.cartaActual = null;
    state.jugadores = [];
    state.anguloZoomActual = 0;
    state.apuestaPendiente = null;
}