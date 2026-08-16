// juego.js
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

// NOTA: renderizarMisCorredores() vive en ui.js (se carga despues de este
// archivo y sobrescribe cualquier definicion aqui). Se elimino la copia
// duplicada que existia en este archivo para evitar que quedara desactualizada.

// ========== FUNCIONES PARA INTERCAMBIO ==========
function mostrarModalSeleccion(cartasDisponibles, titulo, callback) {
    var modal = document.getElementById('intercambioModal');
    var contenido = document.getElementById('intercambioContenido');
    var tituloElem = document.getElementById('intercambioTitulo');
    if (!modal) {
        alert('Error: no se encontro el modal de intercambio.');
        return;
    }
    tituloElem.textContent = titulo || 'Selecciona una carta';
    contenido.innerHTML = '';

    cartasDisponibles.forEach(function(carta) {
        var div = document.createElement('div');
        div.className = 'carta-opcion';
        var img = document.createElement('img');
        img.src = carta.imagen;
        img.alt = '#' + carta.numero;
        img.loading = 'lazy';
        div.appendChild(img);
        var span = document.createElement('span');
        span.textContent = '#' + carta.numero;
        div.appendChild(span);

        div.addEventListener('click', function(e) {
            e.stopPropagation();
            cerrarIntercambio();
            callback(carta);
        });
        contenido.appendChild(div);
    });

    modal.style.display = 'flex';
}

function cerrarIntercambio() {
    var modal = document.getElementById('intercambioModal');
    if (modal) modal.style.display = 'none';
}
window.cerrarIntercambio = cerrarIntercambio;

// --- CARTA 17: muestra 3 cartas al azar que YA hayan salido (repartidas), NO sean ganadoras ni 17/33, sin repetir numero ---
function intercambiarPor17(cartaActual) {
    // Solo cartas de tandas ya repartidas (no cartas de tandas futuras aun no reveladas),
    // que no sean ganadoras, no sean ella misma, no sean 17 ni 33, y sin numeros duplicados.
    var vistos = {};
    var filtradas = cartas.filter(function(c) {
        if (c.id === cartaActual.id) return false;
        if (c.esGanadora) return false;
        if (c.numero === 17 || c.numero === 33) return false;
        if (c.tanda > tandaActual) return false; // aun no ha salido
        if (vistos[c.numero]) return false;
        vistos[c.numero] = true;
        return true;
    });
    if (filtradas.length === 0) {
        alert('No hay cartas disponibles para copiar (sin ganadoras ni especiales).');
        return;
    }
    // Mezclar
    for (var i = filtradas.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = filtradas[i];
        filtradas[i] = filtradas[j];
        filtradas[j] = temp;
    }
    // Tomar hasta 3
    var seleccionables = filtradas.slice(0, Math.min(3, filtradas.length));

    mostrarModalSeleccion(seleccionables, 'Elige una carta para copiar (17)', function(cartaElegida) {
        // Copiar visualmente
        cartaActual.numero = cartaElegida.numero;
        cartaActual.imagen = cartaElegida.imagen;
        // Activar la carta actual
        playersData[myId].activeCardId = cartaActual.id;
        broadcastSetActive(myId, cartaActual.id);
        // Sincronizar de inmediato el estado completo para que todos vean la
        // identidad copiada y el descarte funcione correctamente despues.
        broadcastState('sync');
        renderizarCartas();
        renderizarMisCorredores();
        actualizarUI();
        saveSession();
    });
}

// --- CARTA 33: muestra ganadoras que no sean 17 ni 33 ---
function intercambiarPor33(cartaActual) {
    var ganadoras = cartas.filter(function(c) {
        return c.esGanadora && c.numero !== 17 && c.numero !== 33;
    });
    if (ganadoras.length === 0) {
        alert('No hay cartas ganadoras disponibles (o son especiales).');
        return;
    }

    mostrarModalSeleccion(ganadoras, 'Elige una carta ganadora para copiar (33)', function(cartaElegida) {
        cartaActual.numero = cartaElegida.numero;
        cartaActual.imagen = cartaElegida.imagen;
        playersData[myId].activeCardId = cartaActual.id;
        broadcastSetActive(myId, cartaActual.id);
        // Sincronizar de inmediato el estado completo para que todos vean la
        // identidad copiada y el descarte funcione correctamente despues.
        broadcastState('sync');
        renderizarCartas();
        renderizarMisCorredores();
        actualizarUI();
        saveSession();
    });
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

    var activeActual = playersData[myId].activeCardId;

    // Si la carta clickeada YA es la activa: solo permitir desactivarla
    // (no reabrir el intercambio de 17/33, para no permitir cambiar de "copia").
    if (activeActual === cartaId) {
        playersData[myId].activeCardId = null;
        broadcastSetActive(myId, null);
        renderizarMisCorredores();
        actualizarUI();
        saveSession();
        return;
    }

    // Si ya hay OTRA carta activa esta ronda, no se permite cambiar de corredor.
    if (activeActual) {
        alert('Ya elegiste tu corredor para usar esta ronda. No puedes cambiar de carta hasta la proxima ronda.');
        return;
    }

    // ========== CARTAS ESPECIALES ==========
    if (carta.numero === 17) {
        intercambiarPor17(carta);
        return;
    }
    if (carta.numero === 33) {
        intercambiarPor33(carta);
        return;
    }
    // =======================================

    // Comportamiento normal: activar
    playersData[myId].activeCardId = cartaId;
    broadcastSetActive(myId, cartaId);
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
    // Reenvio redundante: la red MQTT publica sin garantia de entrega, asi que
    // se reenvia el estado poco despues para autocorregir a jugadores que
    // hayan perdido el primer mensaje (por ejemplo, si se reconectaron justo
    // en ese momento).
    setTimeout(function() {
        broadcastState('sync');
    }, 700);
}
window.descartarActivas = descartarActivas;

// Devuelve true solo si todos los jugadores que aun tienen cartas en juego
// ya eligieron (boton "Usar") la carta que van a usar esta ronda.
function todosEligieronCarta() {
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
        if (tieneCartas && !data.activeCardId) {
            return false;
        }
    }
    return true;
}
window.todosEligieronCarta = todosEligieronCarta;

function actualizarUI() {
    var startBtn = document.getElementById('startGameBtn');
    if (startBtn) {
        startBtn.disabled = gameStarted;
        startBtn.textContent = gameStarted ? 'Juego en curso' : 'Corredores';
    }
    var puntosDisplay = document.getElementById('misPuntosDisplay');
    if (puntosDisplay && puntosPorJugador[myId] !== undefined) {
        puntosDisplay.textContent = 'Puntos: ' + puntosPorJugador[myId];
    }
    var resetBtn = document.getElementById('resetGameBtn');
    if (resetBtn) {
        var esAnfitrion = !currentRoom || !hostId || hostId === myId;
        resetBtn.style.display = esAnfitrion ? '' : 'none';
    }
    renderLeaderboard();
    renderizarMisCorredores();
    if (typeof actualizarBotonesGlobales === 'function') {
        actualizarBotonesGlobales();
    }
    
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
        juegoTerminado = false;
    }
    
    if (juegoTerminado && gameStarted) {
        var btns = document.querySelectorAll('.btn-puntaje');
        for (var b = 0; b < btns.length; b++) {
            btns[b].disabled = true;
        }
        var list = document.getElementById('playersList');
        if (list) {
            var msg = document.createElement('div');
            msg.style.textAlign = 'center';
            msg.style.color = '#F8B195';
            msg.style.fontWeight = 'bold';
            msg.style.padding = '10px';
            msg.textContent = 'Juego terminado: no quedan cartas disponibles.';
            var oldMsg = list.querySelector('.game-ended-msg');
            if (oldMsg) oldMsg.remove();
            msg.className = 'game-ended-msg';
            list.prepend(msg);
        }
    } else {
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
    if (hostId && hostId !== myId) {
        alert('Solo el anfitrion de la sala puede reiniciar la partida.');
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
        duenoSpan.textContent = 'Dueno: ' + dueno;
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