// js/config.js
export const CONFIG = {
    GAME: {
        MAX_REGLAS: 2,
        MAZO_INICIAL: [
            // Funciones
            { imagen: "MasterCartas_Eco1.png", tipo: "normal" },
            { imagen: "MasterCartas_Eco1.png", tipo: "normal" },
            { imagen: "MasterCartas_Mimic2.png", tipo: "normal" },
            { imagen: "MasterCartas_Mimic2.png", tipo: "normal" },
            { imagen: "MasterCartas_Silencio.png", tipo: "normal" },
            // Actividades
            { imagen: "MasterCartas_Abajo.png", tipo: "normal" },
            { imagen: "MasterCartas_Abajo.png", tipo: "normal" },
            { imagen: "MasterCartas_Arriba.png", tipo: "normal" },
            { imagen: "MasterCartas_Arriba.png", tipo: "normal" },
            { imagen: "MasterCartas_Derecha.png", tipo: "normal" },
            { imagen: "MasterCartas_Derecha.png", tipo: "normal" },
            { imagen: "MasterCartas_Izquierda.png", tipo: "normal" },
            { imagen: "MasterCartas_Izquierda.png", tipo: "normal" },
            { imagen: "MasterCartas_Saltar.png", tipo: "normal" },
            { imagen: "MasterCartas_Saltar.png", tipo: "normal" },
            // Competencia
            { imagen: "MasterCartas_3 Dedos.png", tipo: "normal" },
            { imagen: "MasterCartas_Apunta.png", tipo: "normal" },
            { imagen: "MasterCartas_Barco.png", tipo: "normal" },
            { imagen: "MasterCartas_Historia.png", tipo: "normal" },
            { imagen: "MasterCartas_Mano cambiada.png", tipo: "normal" },
            { imagen: "MasterCartas_Nombres.png", tipo: "normal" },
            { imagen: "MasterCartas_Peliculas.png", tipo: "normal" },
            { imagen: "MasterCartas_Piedra, Papel, Tijeras.png", tipo: "normal" },
            { imagen: "MasterCartas_Pulgares.png", tipo: "normal" },
            { imagen: "MasterCartas_Rimas.png", tipo: "normal" },
            { imagen: "MasterCartas_Personalizado1.png", tipo: "normal" },
            { imagen: "MasterCartas_Personalizado1.png", tipo: "normal" },
            { imagen: "MasterCartas_Personalizado1.png", tipo: "normal" },
            { imagen: "MasterCartas_Personalizado1.png", tipo: "normal" },
            { imagen: "MasterCartas_Personalizado1.png", tipo: "normal" },
            // Oportunidades
            { imagen: "MasterCartas_Oportunidades.png", tipo: "oportunidad" },
            { imagen: "MasterCartas_Oportunidades.png", tipo: "oportunidad" },
            { imagen: "MasterCartas_Oportunidades.png", tipo: "oportunidad" },
            { imagen: "MasterCartas_Oportunidades.png", tipo: "oportunidad" },
            { imagen: "MasterCartas_Oportunidades.png", tipo: "oportunidad" },
            { imagen: "MasterCartas_Oportunidades.png", tipo: "oportunidad" },
            { imagen: "MasterCartas_Oportunidades.png", tipo: "oportunidad" },
            { imagen: "MasterCartas_Oportunidades.png", tipo: "oportunidad" },
            { imagen: "MasterCartas_Oportunidades.png", tipo: "oportunidad" },
            { imagen: "MasterCartas_Oportunidades.png", tipo: "oportunidad" },
            // Castigos
            { imagen: "MasterCartas_Castigos.png", tipo: "castigo" },
            { imagen: "MasterCartas_Castigos.png", tipo: "castigo" },
            { imagen: "MasterCartas_Castigos.png", tipo: "castigo" },
            { imagen: "MasterCartas_Castigos.png", tipo: "castigo" },
            { imagen: "MasterCartas_Castigos.png", tipo: "castigo" },
            { imagen: "MasterCartas_Castigos.png", tipo: "castigo" },
            { imagen: "MasterCartas_Castigos.png", tipo: "castigo" },
            { imagen: "MasterCartas_Castigos.png", tipo: "castigo" },
            { imagen: "MasterCartas_Castigos.png", tipo: "castigo" },
            { imagen: "MasterCartas_Castigos.png", tipo: "castigo" },
            // Reglas
            { imagen: "MasterCartas_Regla1.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla2.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla3.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla4.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla5.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla6.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla7.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla8.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla9.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla10.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla11.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla12.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla13.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla14.png", tipo: "regla" },
            { imagen: "MasterCartas_Regla15.png", tipo: "regla" },
            // Especiales
            { imagen: "MasterCartas_Regla1E.png", tipo: "especial" },
            { imagen: "MasterCartas_Regla1E.png", tipo: "especial" },
            { imagen: "MasterCartas_Regla1E.png", tipo: "especial" },
            { imagen: "MasterCartas_Regla1E.png", tipo: "especial" },
            { imagen: "MasterCartas_Regla1E.png", tipo: "especial" }
        ]
    },
    UI: {
        IMAGENES_PATH: 'imagenes/',
        CARTA_REVERSO: 'MasterCartas_Carta0.png',
        CARTA_VACIO: 'MasterCartas_Vacio.png'
    },
    JUGADORES: {
        MIN: 2,
        MAX: 6,
        NOMBRES_POR_DEFECTO: ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4', 'Jugador 5', 'Jugador 6']
    }
};

// Estado global del juego
export const state = {
    mazo: [],
    descarte: [],
    reglasVisibles: [],
    cartaEspecial: null,
    cartaActual: null,
    anguloZoomActual: 0,
    
    // Jugadores locales
    jugadores: [],
    turnoActual: 0,
    totalJugadores: 0
};

export function initState() {
    state.mazo = [];
    state.descarte = [];
    state.reglasVisibles = [];
    state.cartaEspecial = null;
    state.cartaActual = null;
    state.anguloZoomActual = 0;
    state.jugadores = [];
    state.turnoActual = 0;
    state.totalJugadores = 0;
}