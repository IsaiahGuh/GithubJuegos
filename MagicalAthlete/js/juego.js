var cartas = [];
var misSelecciones = [];
var MAX_SELECCIONES = 2;
var TOTAL_IMAGENES = 36;
var cartaActivaId = null;

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
    if (carta.seleccionadoPor) {
        alert('Esta carta ya fue seleccionada por ' + carta.seleccionadoPor);
        return;
    }
    if (misSelecciones.length >= MAX_SELECCIONES) {
        alert('Ya seleccionaste tus 2 cartas maximas.');
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
}
window.seleccionarCarta = seleccionarCarta;

function iniciarJuego() {
    var numJugadores = Object.keys(playersData).length;
    if (numJugadores === 0) {
        alert('No hay jugadores en la sala. Espera a que alguien se una.');
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
            seleccionadoPorId: null,
            esGanadora: false
        });
    }
    misSelecciones = [];
    cartaActivaId = null;
    puntosPorJugador = {};
    estadoRonda = { usado3: false, usado2: false, ganadorCartaId: null, jugadorGanador: null };
    for (var id in playersData) {
        playersData[id].selecciones = [];
        playersData[id].cartasGanadoras = [];
        puntosPorJugador[id] = 0;
    }
    cartas = cartasGeneradas;
    broadcastStart(cartas);
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();
    saveSession();
}

function renderizarMisCorredores() {
    var container = document.getElementById('my-cards-container');
    container.innerHTML = '';
    
    if (misSelecciones.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'empty-message';
        empty.textContent = 'Aún no has seleccionado corredores';
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
            badge.textContent = '★ GANADORA';
            imgContainer.appendChild(badge);
        }
        wrapper.appendChild(imgContainer);
        
        var btnUsar = document.createElement('button');
        btnUsar.className = 'btn-sm btn-usar';
        btnUsar.textContent = 'Usar';
        
        // Bloquear el botón si hay una carta activa y no es esta
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

// Exponer para ui.js
window.actualizarUI = actualizarUI;