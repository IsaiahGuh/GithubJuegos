// main.js
// ===== PUNTO DE ENTRADA PRINCIPAL =====

// ===== MOSTRAR DATOS DESDE URL =====
function mostrarDatosURL() {
    var nombre = localStorage.getItem('cassettes_nombre_prefill');
    var sala = localStorage.getItem('cassettes_sala_prefill');
    
    if (nombre || sala) {
        var display = document.getElementById('urlDataDisplay');
        if (display) {
            display.style.display = 'block';
            document.getElementById('urlPlayerName').textContent = nombre || '---';
            document.getElementById('urlRoomCode').textContent = sala || '---';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.inicializarJuego) window.inicializarJuego();
    if (window.crearTablero) window.crearTablero();
    if (window.actualizarContadores) window.actualizarContadores();
    if (window.mostrarOpciones) window.mostrarOpciones();
    if (window.actualizarTemporizadoresUI) window.actualizarTemporizadoresUI();
    if (window.actualizarMarcador) window.actualizarMarcador();
    
    mostrarDatosURL();
    
    // Detectar sesion guardada
    var session = window.loadSession ? window.loadSession() : null;
    var banner = document.getElementById('sessionBanner');
    var reconnectBtn = document.getElementById('reconnectBtn');
    
    if (session && banner) {
        document.getElementById('sessionBannerText').textContent =
            'Tenías una partida abierta en la sala ' + session.roomCode + ' como "' + session.myName + '".';
        banner.style.display = 'block';
        
        if (reconnectBtn) {
            reconnectBtn.disabled = false;
            reconnectBtn.style.opacity = '1';
            reconnectBtn.style.cursor = 'pointer';
        }
    } else {
        if (reconnectBtn) {
            reconnectBtn.disabled = true;
            reconnectBtn.style.opacity = '0.5';
            reconnectBtn.style.cursor = 'not-allowed';
        }
    }
    
    if (window.mostrarLobby) window.mostrarLobby();
    if (window.inicializarLeaderboard) window.inicializarLeaderboard();
    if (window.actualizarVisibilidadSegunTurno) window.actualizarVisibilidadSegunTurno();
    
    // ===== EVENTOS =====
    document.getElementById('btnTiempo')?.addEventListener('click', function() {
        if (window.presionarBotonTiempo) window.presionarBotonTiempo();
    });
    
    document.getElementById('btnReinicio')?.addEventListener('mousedown', function(e) {
        if (window.iniciarHoldReinicio) window.iniciarHoldReinicio(e);
    });
    document.getElementById('btnReinicio')?.addEventListener('mouseup', function(e) {
        if (window.cancelarHoldReinicio) window.cancelarHoldReinicio(e);
    });
    document.getElementById('btnReinicio')?.addEventListener('mouseleave', function(e) {
        if (window.cancelarHoldReinicio) window.cancelarHoldReinicio(e);
    });
    
    document.getElementById('btnNuevaRonda')?.addEventListener('click', function() {
        if (window.nuevaRonda) window.nuevaRonda();
    });

    document.getElementById('btnOcultarCartas')?.addEventListener('click', function() {
        if (window.toggleOcultarCartas) window.toggleOcultarCartas();
    });
    
    document.getElementById('cerrarZoomBtn')?.addEventListener('click', function() {
        if (window.cerrarZoom) window.cerrarZoom();
    });
    
    document.getElementById('cancelarSeleccionBtn')?.addEventListener('click', function() {
        if (window.cerrarModal) window.cerrarModal(document.getElementById('modalSeleccionCelda'));
    });
    
    document.getElementById('cerrarHistorialBtn')?.addEventListener('click', function() {
        if (window.cerrarModal) window.cerrarModal(document.getElementById('modalHistorial'));
    });
    
    document.getElementById('cancelarCanjeBtn')?.addEventListener('click', function() {
        if (window.cerrarModal) window.cerrarModal(document.getElementById('modalCanje'));
    });
    
    document.getElementById('cerrarMensajeBtn')?.addEventListener('click', function() {
        if (window.cerrarModal) window.cerrarModal(document.getElementById('modalMensaje'));
    });
    
    document.getElementById('desafiosGanadosA')?.addEventListener('click', function() {
        if (window.mostrarHistorialFiltrado) window.mostrarHistorialFiltrado('A', 'desafio');
    });
    document.getElementById('cartasCompletadasA')?.addEventListener('click', function() {
        if (window.mostrarHistorialFiltrado) window.mostrarHistorialFiltrado('A', 'carta');
    });
    document.getElementById('desafiosGanadosB')?.addEventListener('click', function() {
        if (window.mostrarHistorialFiltrado) window.mostrarHistorialFiltrado('B', 'desafio');
    });
    document.getElementById('cartasCompletadasB')?.addEventListener('click', function() {
        if (window.mostrarHistorialFiltrado) window.mostrarHistorialFiltrado('B', 'carta');
    });
    
    document.getElementById('btnEquipo1')?.addEventListener('click', function() {
        var estado = window.estadoJuego;
        if (!estado) return;
        
        if (estado.tiempoCorriendo) {
            if (window.mostrarMensaje) window.mostrarMensaje('Espera', 'Ya hay un turno en curso');
            return;
        }
        
        if (window.esModoOnline && window.esModoOnline() && window.estadoJugador && window.estadoJugador.equipo !== 'A') {
            if (window.mostrarMensaje) window.mostrarMensaje('Espera', 'No eres del Equipo A');
            return;
        }
        
        if (window.puedeIniciarTurno && !window.puedeIniciarTurno('A')) {
            return;
        }
        
        if (estado.tiempoEquipoA <= 0) {
            if (window.mostrarMensaje) window.mostrarMensaje('Sin Tiempo', 'El Equipo A no tiene tiempo disponible');
            return;
        }
        
        if (estado.esperandoIniciarRonda) {
            if (window.mostrarMensaje) window.mostrarMensaje('Aviso', 'Primero inicia una ronda de desafio');
            return;
        }
        
        if (window.iniciarTemporizadorJuego) window.iniciarTemporizadorJuego('A');
        if (window.esModoOnline && window.esModoOnline() && window.enviarAccion) {
            window.enviarAccion('iniciar_turno', { equipo: 'A' });
        }
    });
    
    document.getElementById('btnEquipo2')?.addEventListener('click', function() {
        var estado = window.estadoJuego;
        if (!estado) return;
        
        if (estado.tiempoCorriendo) {
            if (window.mostrarMensaje) window.mostrarMensaje('Espera', 'Ya hay un turno en curso');
            return;
        }
        
        if (window.esModoOnline && window.esModoOnline() && window.estadoJugador && window.estadoJugador.equipo !== 'B') {
            if (window.mostrarMensaje) window.mostrarMensaje('Espera', 'No eres del Equipo B');
            return;
        }
        
        if (window.puedeIniciarTurno && !window.puedeIniciarTurno('B')) {
            return;
        }
        
        if (estado.tiempoEquipoB <= 0) {
            if (window.mostrarMensaje) window.mostrarMensaje('Sin Tiempo', 'El Equipo B no tiene tiempo disponible');
            return;
        }
        
        if (estado.esperandoIniciarRonda) {
            if (window.mostrarMensaje) window.mostrarMensaje('Aviso', 'Primero inicia una ronda de desafio');
            return;
        }
        
        if (window.iniciarTemporizadorJuego) window.iniciarTemporizadorJuego('B');
        if (window.esModoOnline && window.esModoOnline() && window.enviarAccion) {
            window.enviarAccion('iniciar_turno', { equipo: 'B' });
        }
    });
    
    // ===== CERRAR MODALES CON CLICK FUERA =====
    window.addEventListener('click', function(e) {
        var modals = ['modalZoom', 'modalSeleccionCelda', 'modalHistorial', 'modalCanje', 'modalMensaje', 'modalDesafio'];
        modals.forEach(function(id) {
            var el = document.getElementById(id);
            if (e.target === el) {
                if (id === 'modalDesafio' && window.estadoJuego && window.estadoJuego.desafioActivo) return;
                if (window.cerrarModal) window.cerrarModal(el);
            }
        });
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-equipo') || 
            e.target.closest('#btnCompletar') || 
            e.target.closest('#btnNuevaRonda') ||
            e.target.closest('#btnTiempo')) {
            setTimeout(function() { if (window.actualizarLeaderboard) window.actualizarLeaderboard(); }, 300);
        }
    });

    // ===== TOGGLE DE EQUIPO =====
    function actualizarLabelsToggle(toggleId) {
        var toggle = document.getElementById(toggleId);
        if (!toggle) return;
        var container = toggle.closest('.equipo-toggle-group');
        if (!container) return;
        var labelA = container.querySelector('.equipo-a-label');
        var labelB = container.querySelector('.equipo-b-label');
        if (!labelA || !labelB) return;
        
        if (toggle.checked) {
            labelA.classList.remove('active-a');
            labelB.classList.add('active-b');
        } else {
            labelA.classList.add('active-a');
            labelB.classList.remove('active-b');
        }
    }

    var toggle1 = document.getElementById('equipoToggle');
    var toggle2 = document.getElementById('equipoToggleJoin');

    if (toggle1) {
        toggle1.addEventListener('change', function() { actualizarLabelsToggle('equipoToggle'); });
        actualizarLabelsToggle('equipoToggle');
    }

    if (toggle2) {
        toggle2.addEventListener('change', function() { actualizarLabelsToggle('equipoToggleJoin'); });
        actualizarLabelsToggle('equipoToggleJoin');
    }
});

// Exponer funciones globales
window.mostrarDatosURL = mostrarDatosURL;