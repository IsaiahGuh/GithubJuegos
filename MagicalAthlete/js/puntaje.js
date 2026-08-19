// puntaje.js (sin cambios)
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
        alert('No estas conectado a una sala.');
        return;
    }

    if (!puntosPorJugador[myId]) {
        puntosPorJugador[myId] = 0;
    }

    if (tipo === '+3') {
        if (estadoRonda.usado3) {
            alert('1° ya fue usado esta ronda.');
            return;
        }
        var activeId = playersData[myId] ? playersData[myId].activeCardId : null;
        if (!activeId) {
            alert('Selecciona una carta activa con el boton "Usar" primero.');
            return;
        }
        var cartaEncontrada = false;
        for (var i = 0; i < cartas.length; i++) {
            if (cartas[i].id === activeId) {
                if (cartas[i].descartada || cartas[i].esGanadora) {
                    alert('Esta carta no esta disponible.');
                    return;
                }
                cartas[i].esGanadora = true;
                cartaEncontrada = true;
                break;
            }
        }
        if (!cartaEncontrada) {
            alert('Carta no encontrada.');
            return;
        }
        puntosPorJugador[myId] += 3;
        estadoRonda.usado3 = true;
        estadoRonda.ganadorCartaId = activeId;
        estadoRonda.jugadorGanador = myId;
        if (!playersData[myId].cartasGanadoras) {
            playersData[myId].cartasGanadoras = [];
        }
        if (playersData[myId].cartasGanadoras.indexOf(activeId) === -1) {
            playersData[myId].cartasGanadoras.push(activeId);
        }
        broadcastPuntajeGlobal('+3');
        broadcastEstadoRonda();
        actualizarUI();
        saveSession();
    } else if (tipo === '+2') {
        if (!estadoRonda.usado3) {
            alert('Debes usar 1° primero.');
            return;
        }
        if (estadoRonda.usado2) {
            alert('2° ya fue usado esta ronda.');
            return;
        }
        if (estadoRonda.jugadorGanador === myId) {
            alert('No puedes usar 2°, ya usaste 1°.');
            return;
        }
        puntosPorJugador[myId] += 2;
        estadoRonda.usado2 = true;
        if (typeof window.descartarActivas === 'function') {
            window.descartarActivas(estadoRonda.jugadorGanador);
        } else {
            console.error('descartarActivas no disponible');
        }
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
    for (var id in playersData) {
        if (playersData[id]) {
            playersData[id].activeCardId = null;
        }
    }
    broadcastEstadoRonda();
    actualizarUI();
    saveSession();
}

function actualizarBotonesGlobales() {
    var btn3 = document.getElementById('btnPuntaje3');
    var btn2 = document.getElementById('btnPuntaje2');
    var btnMenos = document.getElementById('btnPuntajeMenos');
    var btnMas = document.getElementById('btnPuntajeMas');

    if (!btn3 || !btn2 || !btnMenos || !btnMas) return;

    if (estadoRonda.usado3) {
        btn3.disabled = true;
        if (estadoRonda.jugadorGanador === myId) {
            btn2.disabled = true;
            btnMenos.disabled = true;
            btnMas.disabled = true;
        } else {
            btn2.disabled = estadoRonda.usado2;
            btnMenos.disabled = false;
            btnMas.disabled = false;
        }
    } else {
        btn3.disabled = false;
        btn2.disabled = true;
        btnMenos.disabled = false;
        btnMas.disabled = false;
    }
}

window.asignarPuntoGlobal = asignarPuntoGlobal;
window.reiniciarRonda = reiniciarRonda;