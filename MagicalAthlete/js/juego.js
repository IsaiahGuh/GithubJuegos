// ===== CONFIGURACION =====
var cartas = [];
var misSelecciones = [];
var MAX_SELECCIONES = 2; // por tanda
var TOTAL_IMAGENES = 36;
var cartaActivaId = null; // ya no se usa a nivel global, se usa por jugador
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
    if (carta.descartada) {
        alert('Esta carta ya fue descartada.');
        return;
    }
    if (carta.esGanadora) {
        alert('Esta carta ya es ganadora.');
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
        return c && c.tanda === tandaActual && !c.descartada && !c.esGanadora;
    });
    if (seleccionadasEnTanda.length >= MAX_SELECCIONES) {
        alert('Ya seleccionaste tus 2 cartas en esta tanda.');
        return;
    }
    carta.seleccionadoPor = myName;
    carta.seleccionadoPorId = myId;
    misSelecciones.push(cartaId);
    if (!playersData[myId]) {
        playersData[myId] = { name: myName, selecciones: [], cartasGanadoras: [], activeCardId: null };
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
                descartada: false,
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
        playersData[id].activeCardId = null;
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
        return c.tanda === tandaActual && !c.seleccionadoPor && !c.descartada && !c.esGanadora;
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
    // Obtener cartas no descartadas de mis selecciones (incluyendo ganadoras)
    var misCartas = [];
    for (var i = 0; i < misSelecciones.length; i++) {
        var cId = misSelecciones[i];
        var carta = null;
        for (var j = 0; j < cartas.length; j++) {
            if (cartas[j].id === cId) {
                carta = cartas[j];
                break;
            }
        }
        if (carta && !carta.descartada) {
            misCartas.push(carta);
        }
    }
    if (misCartas.length === 0) {
        var empty2 = document.createElement('div');
        empty2.className = 'empty-message';
        empty2.textContent = 'No tienes cartas disponibles';
        container.appendChild(empty2);
        return;
    }
    var activeId = playersData[myId] ? playersData[myId].activeCardId : null;
    for (var k = 0; k < misCartas.length; k++) {
        var carta = misCartas[k];
        var esActiva = (activeId === carta.id);
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
        if (carta.esGanadora || carta.descartada) {
            btnUsar.disabled = true;
        }
        btnUsar.addEventListener('click', function(cId) {
            return function() {
                setActiveCard(cId);
            };
        }(carta.id));
        wrapper.appendChild(btnUsar);
        container.appendChild(wrapper);
    }
}

function setActiveCard(cartaId) {
    if (!playersData[myId]) {
        playersData[myId] = { name: myName, selecciones: [], cartasGanadoras: [], activeCardId: null };
    }
    var carta = null;
    for (var i = 0; i < cartas.length; i++) {
        if (cartas[i].id === cartaId) {
            carta = cartas[i];
            break;
        }
    }
    if (!carta || carta.descartada || carta.esGanadora) {
        alert('Esta carta no esta disponible.');
        return;
    }
    if (playersData[myId].activeCardId === cartaId) {
        playersData[myId].activeCardId = null;
    } else {
        playersData[myId].activeCardId = cartaId;
    }
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'set_active',
            id: myId,
            activeCardId: playersData[myId].activeCardId
        });
        mqttClient.publish(topic, payload);
    }
    renderizarMisCorredores();
    actualizarUI();
    saveSession();
}
window.setActiveCard = setActiveCard;

function descartarActivas(ganadorId) {
    for (var id in playersData) {
        var data = playersData[id];
        if (!data) continue;
        var activeId = data.activeCardId;
        if (activeId) {
            for (var i = 0; i < cartas.length; i++) {
                if (cartas[i].id === activeId) {
                    if (id === ganadorId && cartas[i].esGanadora) {
                        // Carta ganadora: la marcamos como descartada y la eliminamos de misSelecciones
                        cartas[i].descartada = true;
                        if (id === myId) {
                            var idx = misSelecciones.indexOf(activeId);
                            if (idx !== -1) {
                                misSelecciones.splice(idx, 1);
                            }
                        }
                    } else {
                        cartas[i].descartada = true;
                        if (id === myId) {
                            var idx = misSelecciones.indexOf(activeId);
                            if (idx !== -1) {
                                misSelecciones.splice(idx, 1);
                            }
                        }
                    }
                    break;
                }
            }
        }
        data.activeCardId = null;
        if (id === myId) {
            data.selecciones = misSelecciones.slice();
        }
    }
    broadcastState('sync');
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();
    saveSession();
}
window.descartarActivas = descartarActivas;

function actualizarUI() {
    var startBtn = document.getElementById('startGameBtn');
    if (startBtn) {
        // El botón se deshabilita cuando el juego ya empezó
        startBtn.disabled = gameStarted;
        startBtn.textContent = gameStarted ? 'Juego en curso' : 'Corredores';
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
    
    // Verificar si todos los jugadores se han quedado sin cartas disponibles
    var juegoTerminado = true;
    if (gameStarted) {
        for (var id in playersData) {
            var data = playersData[id];
            if (!data) continue;
            var tieneCartas = false;
            if (data.selecciones) {
                for (var i = 0; i < data.selecciones.length; i++) {
                    var cId = data.selecciones[i];
                    for (var j = 0; j < cartas.length; j++) {
                        if (cartas[j].id === cId && !cartas[j].descartada) {
                            tieneCartas = true;
                            break;
                        }
                    }
                    if (tieneCartas) break;
                }
            }
            if (tieneCartas) {
                juegoTerminado = false;
                break;
            }
        }
    } else {
        juegoTerminado = false; // si no ha empezado, no termina
    }
    
    if (juegoTerminado && gameStarted) {
        // Deshabilitar botones de puntuación
        var btns = document.querySelectorAll('.btn-puntaje');
        for (var b = 0; b < btns.length; b++) {
            btns[b].disabled = true;
        }
        // Mostrar mensaje
        var list = document.getElementById('playersList');
        if (list) {
            var msg = document.createElement('div');
            msg.style.textAlign = 'center';
            msg.style.color = '#F8B195';
            msg.style.fontWeight = 'bold';
            msg.style.padding = '10px';
            msg.textContent = 'Juego terminado: no quedan cartas disponibles.';
            // Eliminar mensajes anteriores
            var oldMsg = list.querySelector('.game-ended-msg');
            if (oldMsg) oldMsg.remove();
            msg.className = 'game-ended-msg';
            list.prepend(msg);
        }
    } else {
        // Eliminar mensaje si existe
        var list2 = document.getElementById('playersList');
        if (list2) {
            var oldMsg2 = list2.querySelector('.game-ended-msg');
            if (oldMsg2) oldMsg2.remove();
        }
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
        playersData[id].activeCardId = null;
        puntosPorJugador[id] = 0;
    }
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();
    renderLeaderboard();
    saveSession();
}
window.resetLocalGame = resetLocalGame;

function mostrarGanadores() {
    var ganadoras = cartas.filter(function(c) { return c.esGanadora; });
    if (ganadoras.length === 0) {
        alert('No hay cartas ganadoras aun.');
        return;
    }
    var modal = document.getElementById('ganadoresModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ganadoresModal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = '<div class="modal-box zoom-box"><div id="ganadoresContent" class="zoom-content"></div><button class="modal-btn btn-secondary" onclick="document.getElementById(\'ganadoresModal\').style.display=\'none\'">Cerrar</button></div>';
        document.body.appendChild(modal);
    }
    var content = document.getElementById('ganadoresContent');
    if (!content) {
        content = modal.querySelector('.zoom-content');
    }
    content.innerHTML = '';
    var title = document.createElement('h3');
    title.textContent = 'Cartas Ganadoras';
    title.style.color = 'var(--text-main)';
    title.style.marginBottom = '15px';
    content.appendChild(title);

    for (var i = 0; i < ganadoras.length; i++) {
        var c = ganadoras[i];
        var cardContainer = document.createElement('div');
        cardContainer.style.display = 'flex';
        cardContainer.style.alignItems = 'center';
        cardContainer.style.gap = '10px';
        cardContainer.style.marginBottom = '10px';
        cardContainer.style.background = '#2a2a4a';
        cardContainer.style.padding = '8px';
        cardContainer.style.borderRadius = '8px';
        cardContainer.style.width = '100%';
        var img = document.createElement('img');
        img.src = c.imagen;
        img.alt = 'Corredor ' + c.numero;
        img.style.width = '60px';
        img.style.height = '80px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';
        cardContainer.appendChild(img);
        var info = document.createElement('div');
        info.style.display = 'flex';
        info.style.flexDirection = 'column';
        info.style.alignItems = 'flex-start';
        var numSpan = document.createElement('span');
        numSpan.textContent = '#' + c.numero;
        numSpan.style.fontWeight = 'bold';
        info.appendChild(numSpan);
        var dueno = 'Desconocido';
        for (var id in playersData) {
            if (playersData[id].cartasGanadoras && playersData[id].cartasGanadoras.indexOf(c.id) !== -1) {
                dueno = playersData[id].name;
                break;
            }
        }
        var duenoSpan = document.createElement('span');
        duenoSpan.textContent = 'Dueño: ' + dueno;
        duenoSpan.style.color = 'var(--text-muted)';
        duenoSpan.style.fontSize = '0.8rem';
        info.appendChild(duenoSpan);
        cardContainer.appendChild(info);
        content.appendChild(cardContainer);
    }
    modal.style.display = 'flex';
}
window.mostrarGanadores = mostrarGanadores;

function resetRound() {
    for (var id in playersData) {
        if (playersData[id]) {
            playersData[id].activeCardId = null;
        }
    }
    estadoRonda = { usado3: false, usado2: false, ganadorCartaId: null, jugadorGanador: null };
    cartaActivaId = null;
    broadcastState('sync');
    renderizarMisCorredores();
    actualizarUI();
    saveSession();
}
window.resetRound = resetRound;