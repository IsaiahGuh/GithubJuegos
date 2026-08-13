import { state, initState } from './js/config.js';
import { generarMazo, reiniciarJuego, robarCarta, mostrarFinalizacion, cerrarFinalizacion, calcularYFinalizar } from './js/juego.js';
import { actualizarUI, configurarEventos, mostrarHistorial } from './js/ui.js';
import { mostrarZoom, cerrarZoom } from './js/zoom.js';
import { renderLeaderboard, toggleLeaderboard } from './js/leaderboard.js';
import { inicializarModal, crearJugadoresDesdeModal, toggleVistaJugadores, agregarJugador, getJugadores, sumarPuntosAJugador } from './js/jugadores.js';
import { inicializarApuestas } from './js/apuestas.js';

function init() {
    initState();
    generarMazo();
    configurarEventos();
    inicializarModal();
    inicializarApuestas();
    actualizarUI();
    renderLeaderboard();

    window.cerrarZoom = cerrarZoom;
    window.toggleLeaderboard = toggleLeaderboard;
    window.mostrarHistorial = mostrarHistorial;
    window.reiniciarPartida = reiniciarJuego;
    window.toggleVistaJugadores = toggleVistaJugadores;
    window.agregarJugador = agregarJugador;
    window.iniciarPartida = crearJugadoresDesdeModal;
    window.getJugadores = getJugadores;
    window.mostrarFinalizacion = mostrarFinalizacion;
    window.cerrarFinalizacion = cerrarFinalizacion;
    window.calcularYFinalizar = calcularYFinalizar;
    window.sumarPuntosAJugador = sumarPuntosAJugador;

    window.robarYMostrar = function() {
        const carta = robarCarta();
        if (carta) {
            mostrarZoom(carta);
        }
    };

    console.log('HotCarreras - Iniciado');
    console.log('Cartas en mazo: ' + state.mazo.length);
}

document.addEventListener('DOMContentLoaded', init);