// main.js
import { state, initState } from './js/config.js';
import { generarMazo, reiniciarJuego, robarCarta, mostrarFinalizacion, cerrarFinalizacion, calcularYFinalizar, setActualizarUICallback, mezclarMazo, getCartasRestantes } from './js/juego.js';
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
    
    setActualizarUICallback(actualizarUIFromUI);
    
    actualizarUIFromUI();
    renderLeaderboard();

    const originalIniciarPartida = crearJugadoresDesdeModal;
    window.iniciarPartida = function() {
        const resultado = originalIniciarPartida();
        if (resultado !== false) {
            generarMazo();
            actualizarUIFromUI();
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
        if (getCartasRestantes() === 0) {
            mezclarMazo();
            return;
        }
        const carta = robarCarta();
        if (carta) {
            mostrarZoom(carta);
        }
    };

    console.log('HotCarreras - Iniciado');
    console.log('Esperando configuracion de jugadores...');
}

document.addEventListener('DOMContentLoaded', init);