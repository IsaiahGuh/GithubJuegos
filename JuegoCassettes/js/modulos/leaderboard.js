// js/modulos/leaderboard.js

// ========== LEADERBOARD ==========

var actualizandoLeaderboard = false;
var ultimaActualizacion = 0;

function obtenerJugadoresPorEquipo(equipo) {
    var jugadores = [];

    if (window.esModoOnline && window.esModoOnline()) {
        if (window.estadoJugador.equipo === equipo) {
            var stats = calcularPuntuacionEquipo(equipo);
            jugadores.push({
                id: window.estadoJugador.id,
                nombre: window.estadoJugador.nombre || 'Jugador',
                puntuacion: stats.total,
                esLocal: true
            });
        }
        
        var jugadoresConectados = window.jugadoresConectados || {};
        Object.keys(jugadoresConectados).forEach(function(id) {
            if (id === window.estadoJugador.id) return;
            var j = jugadoresConectados[id];
            if (j.equipo === equipo) {
                var stats2 = calcularPuntuacionEquipo(equipo);
                jugadores.push({
                    id: id,
                    nombre: j.nombre || 'Anonimo',
                    puntuacion: stats2.total,
                    esLocal: false
                });
            }
        });
        
        return jugadores;
    }

    if (window.estadoJugador.equipo === equipo && window.estadoJugador.nombre) {
        var stats3 = calcularPuntuacionEquipo(equipo);
        jugadores.push({
            id: 'local',
            nombre: window.estadoJugador.nombre,
            puntuacion: stats3.total,
            esLocal: true
        });
    }

    return jugadores;
}

function renderizarLeaderboard() {
    var container = document.getElementById('playersList');
    if (!container) return;

    var jugadoresA = obtenerJugadoresPorEquipo('A');
    var jugadoresB = obtenerJugadoresPorEquipo('B');

    container.innerHTML = '';

    var statsA = calcularPuntuacionEquipo('A');
    var cardA = document.createElement('div');
    cardA.className = 'player-card';
    if (window.estadoJugador.equipo === 'A') cardA.classList.add('me');

    var jugadoresHtmlA = '';
    if (jugadoresA.length > 0) {
        jugadoresA.sort(function(a, b) { return (b.puntuacion || 0) - (a.puntuacion || 0); });
        jugadoresA.forEach(function(j) {
            jugadoresHtmlA += 
                '<div class="player-row ' + (j.esLocal ? 'jugador-local' : '') + '">' +
                    '<span class="jugador-nombre">' + j.nombre + (j.esLocal ? ' (Tu)' : '') + '</span>' +
                    '<span class="jugador-puntos">' + (j.puntuacion || 0) + '</span>' +
                '</div>';
        });
    } else {
        jugadoresHtmlA = '<div class="player-row empty">Sin jugadores</div>';
    }

    cardA.innerHTML = 
        '<div class="player-card-header">' +
            '<span class="equipo-tag-a">Equipo A</span>' +
            '<div class="player-stats">' +
                '<span class="stat-desafios">Desafios: ' + statsA.desafios + '</span>' +
                '<span class="stat-cartas">Cartas: ' + statsA.cartas + '</span>' +
                '<span class="stat-total">Total: ' + statsA.total + '</span>' +
            '</div>' +
        '</div>' +
        '<div class="player-list">' + jugadoresHtmlA + '</div>';
    container.appendChild(cardA);

    var statsB = calcularPuntuacionEquipo('B');
    var cardB = document.createElement('div');
    cardB.className = 'player-card';
    if (window.estadoJugador.equipo === 'B') cardB.classList.add('me');

    var jugadoresHtmlB = '';
    if (jugadoresB.length > 0) {
        jugadoresB.sort(function(a, b) { return (b.puntuacion || 0) - (a.puntuacion || 0); });
        jugadoresB.forEach(function(j) {
            jugadoresHtmlB += 
                '<div class="player-row ' + (j.esLocal ? 'jugador-local' : '') + '">' +
                    '<span class="jugador-nombre">' + j.nombre + (j.esLocal ? ' (Tu)' : '') + '</span>' +
                    '<span class="jugador-puntos">' + (j.puntuacion || 0) + '</span>' +
                '</div>';
        });
    } else {
        jugadoresHtmlB = '<div class="player-row empty">Sin jugadores</div>';
    }

    cardB.innerHTML = 
        '<div class="player-card-header">' +
            '<span class="equipo-tag-b">Equipo B</span>' +
            '<div class="player-stats">' +
                '<span class="stat-desafios">Desafios: ' + statsB.desafios + '</span>' +
                '<span class="stat-cartas">Cartas: ' + statsB.cartas + '</span>' +
                '<span class="stat-total">Total: ' + statsB.total + '</span>' +
            '</div>' +
        '</div>' +
        '<div class="player-list">' + jugadoresHtmlB + '</div>';
    container.appendChild(cardB);
}

function actualizarLeaderboard() {
    if (actualizandoLeaderboard) return;
    
    var ahora = Date.now();
    if (ahora - ultimaActualizacion < 1000) {
        return;
    }
    ultimaActualizacion = ahora;
    
    actualizandoLeaderboard = true;
    
    try {
        if (window.esModoOnline && window.esModoOnline()) {
            var equipo = window.estadoJugador.equipo || 'A';
            var stats = calcularPuntuacionEquipo(equipo);
            window.enviarAccion('actualizar_puntuacion', {
                equipo: equipo,
                puntuacion: stats.total,
                desafios: stats.desafios,
                cartas: stats.cartas
            });
        }
        renderizarLeaderboard();
    } catch (e) {
        console.error("Error actualizando leaderboard:", e);
    } finally {
        setTimeout(function() {
            actualizandoLeaderboard = false;
        }, 100);
    }
}

function procesarPuntuacionRemota(data) {
    if (!data) return;
    renderizarLeaderboard();
}

function inicializarLeaderboard() {
    renderizarLeaderboard();
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.actualizarLeaderboard = actualizarLeaderboard;
window.renderizarLeaderboard = renderizarLeaderboard;
window.inicializarLeaderboard = inicializarLeaderboard;
window.procesarPuntuacionRemota = procesarPuntuacionRemota;