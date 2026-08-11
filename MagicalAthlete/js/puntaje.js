// ===== LOGICA DE PUNTUACION GLOBAL =====
var puntosPorJugador = {};
var estadoRonda = {
    usado3: false,
    usado2: false,
    ganadorCartaId: null,
    jugadorGanador: null
};

function inicializarPuntos() {
    for (var id in playersData) {
        if (!puntosPorJugador[id]) {
            puntosPorJugador[id] = 0;
        }
    }
}

function asignarPuntoGlobal(tipo) {
    if (!myId || !myName) {
        alert('No estás conectado a una sala.');
        return;
    }

    if (!puntosPorJugador[myId]) {
        puntosPorJugador[myId] = 0;
    }

    if (tipo === '+3') {
        if (estadoRonda.usado3) {
            alert('+3 ya fue usado esta ronda.');
            return;
        }
        if (misSelecciones.length === 0) {
            alert('Selecciona al menos una carta primero.');
            return;
        }
        var cartaId = cartaActivaId || misSelecciones[0];
        for (var i = 0; i < cartas.length; i++) {
            if (cartas[i].id === cartaId) {
                cartas[i].esGanadora = true;
                break;
            }
        }
        puntosPorJugador[myId] += 3;
        estadoRonda.usado3 = true;
        estadoRonda.ganadorCartaId = cartaId;
        estadoRonda.jugadorGanador = myId;
        if (!playersData[myId].cartasGanadoras) {
            playersData[myId].cartasGanadoras = [];
        }
        if (playersData[myId].cartasGanadoras.indexOf(cartaId) === -1) {
            playersData[myId].cartasGanadoras.push(cartaId);
        }
        broadcastPuntajeGlobal('+3');
        broadcastEstadoRonda();
        actualizarUI();
        saveSession();
    } else if (tipo === '+2') {
        if (!estadoRonda.usado3) {
            alert('Debes usar +3 primero.');
            return;
        }
        if (estadoRonda.usado2) {
            alert('+2 ya fue usado esta ronda.');
            return;
        }
        puntosPorJugador[myId] += 2;
        estadoRonda.usado2 = true;
        broadcastPuntajeGlobal('+2');
        broadcastEstadoRonda();
        actualizarUI();
        saveSession();
        setTimeout(function() {
            reiniciarRonda();
        }, 500);
    } else if (tipo === '+1') {
        puntosPorJugador[myId] += 1;
        broadcastPuntajeGlobal('+1');
        actualizarUI();
        saveSession();
    } else if (tipo === '-1') {
        puntosPorJugador[myId] -= 1;
        broadcastPuntajeGlobal('-1');
        actualizarUI();
        saveSession();
    }
}

function reiniciarRonda() {
    estadoRonda.usado3 = false;
    estadoRonda.usado2 = false;
    estadoRonda.ganadorCartaId = null;
    estadoRonda.jugadorGanador = null;
    broadcastEstadoRonda();
    actualizarUI();
    saveSession();
}

function actualizarBotonesGlobales() {
    document.getElementById('btnPuntaje3').disabled = estadoRonda.usado3;
    document.getElementById('btnPuntaje2').disabled = !estadoRonda.usado3 || estadoRonda.usado2;
    document.getElementById('btnPuntajeMenos').disabled = false;
    document.getElementById('btnPuntajeMas').disabled = false;
}

window.asignarPuntoGlobal = asignarPuntoGlobal;
window.reiniciarRonda = reiniciarRonda;