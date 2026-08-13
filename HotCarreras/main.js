// main.js - PUNTO DE ENTRADA
import { state, initState } from './js/config.js';
import { generarMazo, reiniciarJuego, robarCarta } from './js/juego.js';
import { actualizarUI, configurarEventos, mostrarHistorial, mostrarZoom, cerrarZoom } from './js/ui.js';
import { renderLeaderboard, toggleLeaderboard } from './js/leaderboard.js';
import { inicializarModal, crearJugadoresDesdeModal, toggleVistaJugadores, agregarJugador, getJugadores, getTurnoActual, contarCartaRobada } from './js/jugadores.js';
import { inicializarApuestas } from './js/apuestas.js';

// ============================================
// INICIALIZACION
// ============================================

function init() {
    initState();
    generarMazo();
    configurarEventos();
    inicializarModal();
    inicializarApuestas(); // Muestra una apuesta aleatoria al inicio
    actualizarUI();
    renderLeaderboard();
    
    // Exponer funciones globales para uso en HTML
    window.cerrarZoom = cerrarZoom;
    window.toggleLeaderboard = toggleLeaderboard;
    window.mostrarHistorial = mostrarHistorial;
    window.reiniciarPartida = reiniciarJuego;
    window.toggleVistaJugadores = toggleVistaJugadores;
    window.agregarJugador = agregarJugador;
    window.iniciarPartida = crearJugadoresDesdeModal;
    window.getJugadores = getJugadores;
    window.getTurnoActual = getTurnoActual;
    
    window.robarYMostrar = function() {
        const carta = robarCarta();
        if (carta) {
            contarCartaRobada();
            mostrarZoom(carta);
        }
    };
    
    console.log('HotCarreras - Iniciado');
    console.log('Cartas en mazo: ' + state.mazo.length);
}

document.addEventListener('DOMContentLoaded', init);