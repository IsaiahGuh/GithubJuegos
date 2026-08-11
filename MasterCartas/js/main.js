// js/main.js - PUNTO DE ENTRADA (Simplificado)
import { state, initState } from './config.js';
import { 
    generarMazo, 
    reiniciarJuego, 
    reiniciarPartida, 
    setActualizarUICallback,
    setActualizarLeaderboardCallback
} from './juego.js';
import { actualizarUI, configurarEventos, mostrarModalHistorial } from './ui.js';
import { abrirZoom, cerrarZoom, configurarZoomEventos } from './zoom.js';
import { renderLeaderboard, toggleLeaderboard } from './leaderboard.js';
import { inicializarModal } from './jugadores.js';
import { abrirModalOtorgar, cerrarModalOtorgar } from './otorgar.js';

// ============================================
// INICIALIZACION
// ============================================

function init() {
    // Configurar callbacks
    setActualizarUICallback(actualizarUI);
    setActualizarLeaderboardCallback(renderLeaderboard);
    
    // Inicializar estado
    initState();
    generarMazo();
    
    // Configurar UI
    configurarEventos();
    configurarZoomEventos();
    
    // Inicializar lista de jugadores en el modal
    inicializarModal();
    
    // Renderizar
    actualizarUI();
    renderLeaderboard();
    
    // EXPONER FUNCIONES GLOBALES (solo las que necesitan acceso desde HTML)
    window.cerrarZoom = cerrarZoom;
    window.toggleLeaderboard = toggleLeaderboard;
    window.abrirZoom = abrirZoom;
    window.actualizarUI = actualizarUI;
    window.renderLeaderboard = renderLeaderboard;
    window.mostrarModalHistorial = mostrarModalHistorial;
    window.reiniciarPartida = reiniciarPartida;
    window.abrirModalOtorgar = abrirModalOtorgar;
    window.cerrarModalOtorgar = cerrarModalOtorgar;
    
    // Las funciones del modal ya están expuestas desde jugadores.js
    // (toggleVistaJugadores, agregarJugador, iniciarPartida)
    
    console.log('MasterCartas - Iniciado');
    console.log('Cartas en mazo: ' + state.mazo.length);
}

// ============================================
// EVENTOS
// ============================================

document.addEventListener('DOMContentLoaded', init);