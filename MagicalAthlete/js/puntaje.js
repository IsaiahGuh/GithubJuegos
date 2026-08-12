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
            alert('+3 ya fue usado esta ronda.');
            return;
        }
        // Obtener la carta activa del jugador
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
        // Guardar en el jugador para que otros lo vean
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
        // Solo se permite si no eres el ganador de la ronda
        if (estadoRonda.jugadorGanador === myId) {
            alert('No puedes usar +2, ya usaste +3.');
            return;
        }
        puntosPorJugador[myId] += 2;
        estadoRonda.usado2 = true;
        // Descartar todas las cartas activas excepto la ganadora
        if (typeof window.descartarActivas === 'function') {
            window.descartarActivas(estadoRonda.jugadorGanador);
        } else {
            console.error('descartarActivas no disponible');
        }
        broadcastPuntajeGlobal('+2');
        broadcastEstadoRonda();
        actualizarUI();
        saveSession();
        // Reiniciar la ronda después de un breve retraso
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
    // Limpiar activeCardId de todos (ya se hizo en descartarActivas, pero por si acaso)
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
        // +3 bloqueado para todos
        btn3.disabled = true;

        if (estadoRonda.jugadorGanador === myId) {
            // El ganador de la ronda tiene todos los botones bloqueados
            btn2.disabled = true;
            btnMenos.disabled = true;
            btnMas.disabled = true;
        } else {
            // Para los demás: +2 disponible si no usado, +1 y -1 disponibles
            btn2.disabled = estadoRonda.usado2;
            btnMenos.disabled = false;
            btnMas.disabled = false;
        }
    } else {
        // Ronda sin +3: +3, -1, +1 habilitados; +2 bloqueado
        btn3.disabled = false;
        btn2.disabled = true;
        btnMenos.disabled = false;
        btnMas.disabled = false;
    }
}

window.asignarPuntoGlobal = asignarPuntoGlobal;
window.reiniciarRonda = reiniciarRonda;