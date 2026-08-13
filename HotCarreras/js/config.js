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
        // Cantidad de cartas por número de jugadores
        CARTAS_POR_JUGADOR: {
            2: 12,
            3: 12,
            4: 12,
            5: 12,
            6: 12,
            7: 12,
            8: 12
        }
    },
    UI: {
        IMAGENES_PATH: 'imagenes/',
    },
    JUGADORES: {
        MIN: 2,
        MAX: 8,
    }
};

export const state = {
    mazo: [],
    mazoCompleto: [], // Guardamos el mazo completo para seleccionar cartas
    historial: [],
    cartaActual: null,
    jugadores: [],
    anguloZoomActual: 0,
    apuestaPendiente: null
};

export function initState() {
    state.mazo = [];
    state.mazoCompleto = [];
    state.historial = [];
    state.cartaActual = null;
    state.jugadores = [];
    state.anguloZoomActual = 0;
    state.apuestaPendiente = null;
}