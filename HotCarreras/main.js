import { state, initState } from './js/config.js';
import { generarMazo, reiniciarJuego, robarCarta, mostrarFinalizacion, cerrarFinalizacion, calcularYFinalizar, setActualizarUICallback } from './js/juego.js';
import { actualizarUI as actualizarUIFromUI, configurarEventos, mostrarHistorial } from './js/ui.js';
import { mostrarZoom, cerrarZoom } from './js/zoom.js';
import { renderLeaderboard, toggleLeaderboard } from './js/leaderboard.js';
import { inicializarModal, crearJugadoresDesdeModal, toggleVistaJugadores, agregarJugador, getJugadores, sumarPuntosAJugador } from './js/jugadores.js';
import { inicializarApuestas } from './js/apuestas.js';

function init() {
    initState();
    configurarEventos();
    inicializarModal();
    inicializarApuestas();
    
    // Configurar el callback para que actualice el contador
    setActualizarUICallback(actualizarUIFromUI);
    
    actualizarUIFromUI(); // actualiza el contador inicial
    renderLeaderboard();

    // Sobrescribir iniciarPartida para generar mazo después de crear jugadores
    const originalIniciarPartida = crearJugadoresDesdeModal;
    window.iniciarPartida = function() {
        const resultado = originalIniciarPartida();
        if (resultado !== false) {
            generarMazo();
            actualizarUIFromUI(); // actualiza contador después de generar mazo
        }
        return resultado;
    };

    window.cerrarZoom = cerrarZoom;
    window.toggleLeaderboard = toggleLeaderboard;
    window.mostrarHistorial = mostrarHistorial;
    window.reiniciarPartida = reiniciarJuego;
    window.toggleVistaJugadores = toggleVistaJugadores;
    window.agregarJugador = agregarJugador;
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
    console.log('Esperando configuración de jugadores...');
}

document.addEventListener('DOMContentLoaded', init);