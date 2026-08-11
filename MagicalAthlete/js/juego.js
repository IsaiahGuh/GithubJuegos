// ===== LOGICA DEL JUEGO =====
var cartas = [];
var misSelecciones = [];
var MAX_SELECCIONES = 2;
var TOTAL_IMAGENES = 36;

function iniciarJuego() {
    var numJugadores = Object.keys(playersData).length;
    if (numJugadores < 2) {
        alert('Se necesitan al menos 2 jugadores para iniciar la partida.');
        return;
    }
    
    var numCartas = numJugadores * 2;
    var cartasGeneradas = [];
    
    var indicesDisponibles = [];
    for (var i = 1; i <= TOTAL_IMAGENES; i++) {
        indicesDisponibles.push(i);
    }
    
    for (var i = indicesDisponibles.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = indicesDisponibles[i];
        indicesDisponibles[i] = indicesDisponibles[j];
        indicesDisponibles[j] = temp;
    }
    
    var indicesSeleccionados = indicesDisponibles.slice(0, numCartas);
    
    for (var i = 0; i < indicesSeleccionados.length; i++) {
        cartasGeneradas.push({
            id: 'carta-' + i,
            numero: indicesSeleccionados[i],
            imagen: 'imagenes/Corredor_' + indicesSeleccionados[i] + '.png',
            seleccionadoPor: null,
            seleccionadoPorId: null
        });
    }
    
    cartas = cartasGeneradas;
    misSelecciones = [];
    
    broadcastStart(cartas);
    
    renderizarCartas();
    actualizarUI();
    saveSession();
}

function seleccionarCarta(cartaId) {
    if (!gameStarted) {
        alert('El juego aun no ha comenzado. Presiona "Corredores" para iniciar.');
        return;
    }
    
    if (misSelecciones.length >= MAX_SELECCIONES) {
        alert('Ya seleccionaste tus 2 cartas maximas.');
        return;
    }
    
    var carta = null;
    for (var i = 0; i < cartas.length; i++) {
        if (cartas[i].id === cartaId) {
            carta = cartas[i];
            break;
        }
    }
    
    if (!carta) {
        console.error('Carta no encontrada:', cartaId);
        return;
    }
    
    if (carta.seleccionadoPor) {
        alert('Esta carta ya fue seleccionada por ' + carta.seleccionadoPor);
        return;
    }
    
    if (misSelecciones.indexOf(cartaId) !== -1) {
        alert('Ya seleccionaste esta carta.');
        return;
    }
    
    carta.seleccionadoPor = myName;
    carta.seleccionadoPorId = myId;
    misSelecciones.push(cartaId);
    
    playersData[myId].selecciones = misSelecciones.slice();
    
    broadcastSelect(cartaId);
    
    renderizarCartas();
    actualizarUI();
    renderLeaderboard();
    saveSession();
}

function actualizarEstadoLocal(data) {
    if (data.cartas) {
        cartas = data.cartas;
        renderizarCartas();
    }
    if (data.selecciones) {
        misSelecciones = data.selecciones;
    }
    actualizarUI();
    saveSession();
}

function obtenerJugadores() {
    var jugadores = [];
    var ids = Object.keys(playersData);
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        jugadores.push({
            id: id,
            name: playersData[id].name,
            selecciones: playersData[id].selecciones || []
        });
    }
    return jugadores;
}

function obtenerCartaSeleccionadaPor(selecciones, cartaId) {
    for (var i = 0; i < selecciones.length; i++) {
        if (selecciones[i] === cartaId) {
            return true;
        }
    }
    return false;
}