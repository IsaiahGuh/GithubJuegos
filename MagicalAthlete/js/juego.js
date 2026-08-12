// ===== CONFIGURACION =====
var cartas = [];
var misSelecciones = [];
var MAX_SELECCIONES = 2; // por tanda
var TOTAL_IMAGENES = 36;
var cartaActivaId = null;
var tandaActual = 0;
var TOTAL_TANDAS = 2;
var avanzando = false;

function seleccionarCarta(cartaId) {
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
    if (carta.tanda !== tandaActual) {
        alert('Esta carta no pertenece a la tanda actual.');
        return;
    }
    if (carta.seleccionadoPor) {
        alert('Esta carta ya fue seleccionada por ' + carta.seleccionadoPor);
        return;
    }
    var seleccionadasEnTanda = misSelecciones.filter(function(id) {
        var c = null;
        for (var j = 0; j < cartas.length; j++) {
            if (cartas[j].id === id) {
                c = cartas[j];
                break;
            }
        }
        return c && c.tanda === tandaActual;
    });
    if (seleccionadasEnTanda.length >= MAX_SELECCIONES) {
        alert('Ya seleccionaste tus 2 cartas en esta tanda.');
        return;
    }
    carta.seleccionadoPor = myName;
    carta.seleccionadoPorId = myId;
    misSelecciones.push(cartaId);
    if (!playersData[myId]) {
        playersData[myId] = { name: myName, selecciones: [], cartasGanadoras: [] };
    }
    playersData[myId].selecciones = misSelecciones.slice();
    broadcastSelect(cartaId);
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();
    renderLeaderboard();
    saveSession();
    verificarYAvanzarTanda();
}
window.seleccionarCarta = seleccionarCarta;

function iniciarJuego() {
    var numJugadores = Object.keys(playersData).length;
    if (numJugadores === 0) {
        alert('No hay jugadores en la sala. Espera a que alguien se una.');
        return;
    }
    var totalCartas = numJugadores * 4;
    var cartasPorTanda = numJugadores * 2;
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
    var indicesSeleccionados = indicesDisponibles.slice(0, totalCartas);
    var nuevasCartas = [];
    for (var t = 0; t < TOTAL_TANDAS; t++) {
        var inicio = t * cartasPorTanda;
        var fin = inicio + cartasPorTanda;
        for (var i = inicio; i < fin; i++) {
            nuevasCartas.push({
                id: 'carta-' + i,
                numero: indicesSeleccionados[i],
                imagen: 'imagenes/Corredor_' + indicesSeleccionados[i] + '.png',
                seleccionadoPor: null,
                seleccionadoPorId: null,
                esGanadora: false,
                tanda: t
            });
        }
    }
    misSelecciones = [];
    cartaActivaId = null;
    puntosPorJugador = {};
    estadoRonda = { usado3: false, usado2: false, ganadorCartaId: null, jugadorGanador: null };
    tandaActual = 0;
    avanzando = false;
    for (var id in playersData) {
        playersData[id].selecciones = [];
        playersData[id].cartasGanadoras = [];
        puntosPorJugador[id] = 0;
    }
    cartas = nuevasCartas;
    broadcastStart(cartas, tandaActual);
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();
    saveSession();
}
window.iniciarJuego = iniciarJuego;

function verificarYAvanzarTanda() {
    if (avanzando) return;
    var disponibles = cartas.filter(function(c) {
        return c.tanda === tandaActual && !c.seleccionadoPor;
    });
    if (disponibles.length === 0 && tandaActual < TOTAL_TANDAS - 1) {
        avanzando = true;
        avanzarTanda();
        setTimeout(function() {
            avanzando = false;
        }, 100);
    }
}

function avanzarTanda() {
    tandaActual++;
    broadcastNextTanda(tandaActual);
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();
    saveSession();
}
window.avanzarTanda = avanzarTanda;
window.verificarYAvanzarTanda = verificarYAvanzarTanda;

function renderizarMisCorredores() {
    var container = document.getElementById('my-cards-container');
    container.innerHTML = '';
    if (misSelecciones.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'empty-message';
        empty.textContent = 'Aun no has seleccionado corredores';
        container.appendChild(empty);
        return;
    }
    for (var i = 0; i < misSelecciones.length; i++) {
        var cartaId = misSelecciones[i];
        var carta = null;
        for (var j = 0; j < cartas.length; j++) {
            if (cartas[j].id === cartaId) {
                carta = cartas[j];
                break;
            }
        }
        if (!carta) continue;
        var esActiva = (cartaActivaId === cartaId);
        var esGanadora = carta.esGanadora || false;
        var wrapper = document.createElement('div');
        wrapper.className = 'my-card-wrapper' + (esActiva ? ' activa' : '') + (esGanadora ? ' ganadora' : '');
        var imgContainer = document.createElement('div');
        imgContainer.className = 'my-card-img';
        var img = document.createElement('img');
        img.src = carta.imagen;
        img.alt = 'Corredor ' + carta.numero;
        imgContainer.appendChild(img);
        var num = document.createElement('div');
        num.className = 'mini-number';
        num.textContent = '#' + carta.numero;
        imgContainer.appendChild(num);
        if (esGanadora) {
            var badge = document.createElement('div');
            badge.className = 'ganadora-badge';
            badge.textContent = 'GANADORA';
            imgContainer.appendChild(badge);
        }
        wrapper.appendChild(imgContainer);
        var btnUsar = document.createElement('button');
        btnUsar.className = 'btn-sm btn-usar';
        btnUsar.textContent = 'Usar';
        if (cartaActivaId !== null && cartaActivaId !== cartaId) {
            btnUsar.disabled = true;
        }
        btnUsar.addEventListener('click', function(cId) {
            return function() {
                if (cartaActivaId === cId) {
                    cartaActivaId = null;
                } else {
                    cartaActivaId = cId;
                }
                renderizarMisCorredores();
            };
        }(cartaId));
        wrapper.appendChild(btnUsar);
        container.appendChild(wrapper);
    }
}

function actualizarUI() {
    var startBtn = document.getElementById('startGameBtn');
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = 'Corredores';
    }
    var puntosDisplay = document.getElementById('misPuntosDisplay');
    if (puntosDisplay && puntosPorJugador[myId] !== undefined) {
        puntosDisplay.textContent = 'Puntos: ' + puntosPorJugador[myId];
    }
    renderLeaderboard();
    renderizarMisCorredores();
    if (typeof actualizarBotonesGlobales === 'function') {
        actualizarBotonesGlobales();
    }
}
window.actualizarUI = actualizarUI;

function resetGlobalGame() {
    if (!currentRoom) {
        resetLocalGame();
        return;
    }
    if (!confirm('Reiniciar la partida para TODOS los jugadores? Se perderan las selecciones y puntajes.')) {
        return;
    }
    broadcastReset();
    resetLocalGame();
}
window.resetGlobalGame = resetGlobalGame;

function resetLocalGame() {
    cartas = [];
    misSelecciones = [];
    puntosPorJugador = {};
    estadoRonda = { usado3: false, usado2: false, ganadorCartaId: null, jugadorGanador: null };
    cartaActivaId = null;
    tandaActual = 0;
    avanzando = false;
    gameStarted = false;
    gameInitiator = null;
    for (var id in playersData) {
        playersData[id].selecciones = [];
        playersData[id].cartasGanadoras = [];
        puntosPorJugador[id] = 0;
    }
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();
    renderLeaderboard();
    saveSession();
}
window.resetLocalGame = resetLocalGame;