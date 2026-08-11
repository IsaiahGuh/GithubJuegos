// js/core/juego.js

// ========== ESTADO GLOBAL DEL JUEGO ==========

var estadoJuego = {
    mazoDesafio: [],
    mazoDesafioDescarte: [],
    mazoNormal: [],
    cartaDesafioActual: null,
    
    tiempoDesafio: 0,
    turnoDesafio: 'A',
    rondaDesafio: 1,
    desafioActivo: false,
    intervaloDesafio: null,
    
    opcionesVisibles: [],
    tableroCeldas: [null, null, null, null, null, null],
    
    tiempoEquipoA: 0,
    tiempoEquipoB: 0,
    turnoJuego: null,
    intervaloTiempo: null,
    tiempoCorriendo: false,
    
    turnoGanadorDesafio: null,
    turnoActual: null,
    turnosCompletados: [],
    rondaTerminada: false,
    
    cartaSeleccionada: null,
    indiceCartaSeleccionada: null,
    
    desafiosGanadosA: 0,
    desafiosGanadosB: 0,
    cartasCompletadas: [],
    desafiosGanadosLista: [],
    
    categoriasCompletadasA: [],
    categoriasCompletadasB: [],
    extrasA: {},
    extrasB: {},
    
    juegoIniciado: false,
    esperandoIniciarRonda: true,
    cartasVisibles: true,
    holdTimeout: null,
    holdInterval: null
};

function inicializarJuego() {
    estadoJuego.mazoDesafio = mezclarCartas(generarMazoDesafio());
    estadoJuego.mazoDesafioDescarte = [];
    estadoJuego.mazoNormal = mezclarCartas(generarMazoNormal());
    estadoJuego.opcionesVisibles = [];
    estadoJuego.tableroCeldas = [null, null, null, null, null, null];
    estadoJuego.tiempoEquipoA = 0;
    estadoJuego.tiempoEquipoB = 0;
    estadoJuego.turnoJuego = null;
    estadoJuego.tiempoCorriendo = false;
    estadoJuego.rondaDesafio = 1;
    estadoJuego.desafiosGanadosA = 0;
    estadoJuego.desafiosGanadosB = 0;
    estadoJuego.cartasCompletadas = [];
    estadoJuego.desafiosGanadosLista = [];
    estadoJuego.categoriasCompletadasA = [];
    estadoJuego.categoriasCompletadasB = [];
    estadoJuego.extrasA = {};
    estadoJuego.extrasB = {};
    estadoJuego.esperandoIniciarRonda = true;
    estadoJuego.cartasVisibles = true;
    
    estadoJuego.turnoGanadorDesafio = null;
    estadoJuego.turnoActual = null;
    estadoJuego.turnosCompletados = [];
    estadoJuego.rondaTerminada = false;
    
    if (estadoJuego.intervaloTiempo) {
        clearInterval(estadoJuego.intervaloTiempo);
        estadoJuego.intervaloTiempo = null;
    }
    if (estadoJuego.intervaloDesafio) {
        clearInterval(estadoJuego.intervaloDesafio);
        estadoJuego.intervaloDesafio = null;
    }
    
    if (window.actualizarLeaderboard) {
        setTimeout(function() { window.actualizarLeaderboard(); }, 100);
    }
}

function getEquipoData(equipo) {
    if (equipo === 'A') {
        return {
            tiempo: estadoJuego.tiempoEquipoA,
            desafiosGanados: estadoJuego.desafiosGanadosA,
            categorias: estadoJuego.categoriasCompletadasA,
            extras: estadoJuego.extrasA
        };
    } else {
        return {
            tiempo: estadoJuego.tiempoEquipoB,
            desafiosGanados: estadoJuego.desafiosGanadosB,
            categorias: estadoJuego.categoriasCompletadasB,
            extras: estadoJuego.extrasB
        };
    }
}

function setEquipoData(equipo, data) {
    if (equipo === 'A') {
        if (data.tiempo !== undefined) estadoJuego.tiempoEquipoA = data.tiempo;
        if (data.desafiosGanados !== undefined) estadoJuego.desafiosGanadosA = data.desafiosGanados;
        if (data.categorias !== undefined) estadoJuego.categoriasCompletadasA = data.categorias;
        if (data.extras !== undefined) estadoJuego.extrasA = data.extras;
    } else {
        if (data.tiempo !== undefined) estadoJuego.tiempoEquipoB = data.tiempo;
        if (data.desafiosGanados !== undefined) estadoJuego.desafiosGanadosB = data.desafiosGanados;
        if (data.categorias !== undefined) estadoJuego.categoriasCompletadasB = data.categorias;
        if (data.extras !== undefined) estadoJuego.extrasB = data.extras;
    }
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.estadoJuego = estadoJuego;
window.inicializarJuego = inicializarJuego;
window.getEquipoData = getEquipoData;
window.setEquipoData = setEquipoData;
window.getCeldasEquipo = getCeldasEquipo;