// juego.js
// ===== CONFIGURACION =====
// --- Como funciona el mazo/lotes (para futuras modificaciones) ---
// - `mazoRestante` guarda los numeros de corredor (1..36) que TODAVIA no se
//   han repartido en esta partida. Se baraja una sola vez, al presionar
//   "Corredores" por primera vez, y se va consumiendo de a poco.
// - Cada vez que se presiona "Corredores" se reparte UN lote nuevo de
//   tamano = numJugadores * 2 (si hay 4 jugadores, 8 cartas; si hay 3,
//   6 cartas), sacado directamente de `mazoRestante`. Como se saca sin
//   reponer, un numero de corredor JAMAS se repite entre lotes.
// - `cartas` acumula TODAS las cartas repartidas en la partida (de todos
//   los lotes), no se reemplaza entre lotes. Cada carta recuerda a que
//   lote pertenece en su campo `tanda`.
// - `tandaActual` es el indice del lote actualmente en juego (0, 1, 2...).
// - El boton "Corredores" se bloquea apenas se reparte un lote, y se
//   vuelve a habilitar solo cuando TODOS los jugadores ya usaron/descartaron
//   sus 2 cartas de ese lote (ver loteTerminado()).
var cartas = [];
var misSelecciones = [];
var MAX_SELECCIONES = 2; // corredores por jugador, por lote
var TOTAL_IMAGENES = 36;
var cartaActivaId = null; // ya no se usa a nivel global, se usa por jugador
var tandaActual = -1; // -1 = todavia no se ha repartido ningun lote
var mazoRestante = []; // numeros de corredor que faltan por repartir
// Cambio VISUAL y LOCAL de las cartas 17/33: cuando yo uso una de estas
// cartas para "copiar" a otro corredor, SOLO YO veo esa apariencia; el
// resto de jugadores sigue viendo la carta como #17 o #33. Por eso esto
// NUNCA se transmite por red ni se guarda en `cartas` (que es compartido):
// vive unicamente en este mapa local. cartaId -> { numero, imagen }
var copiasVisuales = {};

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
        alert('Esta carta no pertenece al lote actual.');
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
        alert('Ya seleccionaste tus 2 cartas de este lote.');
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
}
window.seleccionarCarta = seleccionarCarta;

// Devuelve true si el lote actual ya esta completamente resuelto: es decir,
// ningun jugador tiene ya una carta pendiente (sin descartar) de ese lote.
// Mientras esto sea false, el boton "Corredores" permanece bloqueado.
function loteTerminado() {
    if (tandaActual < 0) return true; // todavia no se reparte nada
    for (var id in playersData) {
        var data = playersData[id];
        if (!data || !data.selecciones) continue;
        for (var i = 0; i < data.selecciones.length; i++) {
            var cId = data.selecciones[i];
            for (var j = 0; j < cartas.length; j++) {
                if (cartas[j].id === cId && cartas[j].tanda === tandaActual && !cartas[j].descartada) {
                    return false;
                }
            }
        }
    }
    return true;
}
window.loteTerminado = loteTerminado;

function iniciarJuego() {
    var numJugadores = Object.keys(playersData).length;
    if (numJugadores === 0) {
        alert('No hay jugadores en la sala. Espera a que alguien se una.');
        return;
    }
    if (gameStarted && !loteTerminado()) {
        alert('Todavia hay corredores en juego. Espera a que todos usen y descarten sus corredores actuales.');
        return;
    }

    var cartasPorLote = numJugadores * 2;
    var esPrimerLote = !gameStarted;

    if (esPrimerLote) {
        // Partida nueva: armar y barajar el mazo completo de corredores.
        mazoRestante = [];
        for (var i = 1; i <= TOTAL_IMAGENES; i++) {
            mazoRestante.push(i);
        }
        for (var i = mazoRestante.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = mazoRestante[i];
            mazoRestante[i] = mazoRestante[j];
            mazoRestante[j] = temp;
        }
        cartas = [];
        misSelecciones = [];
        cartaActivaId = null;
        tandaActual = -1;
        copiasVisuales = {};
        puntosPorJugador = {};
        for (var id in playersData) {
            playersData[id].selecciones = [];
            playersData[id].cartasGanadoras = [];
            playersData[id].activeCardId = null;
            puntosPorJugador[id] = 0;
        }
    }

    if (mazoRestante.length < cartasPorLote) {
        alert('No quedan suficientes corredores en el mazo para repartir a todos los jugadores (quedan ' + mazoRestante.length + '). Reinicia la partida para barajar un mazo nuevo.');
        return;
    }

    // Al reiniciar un lote (incluso si no es el primero), el estado de la
    // ronda de puntaje (1grado/2grado) siempre debe partir limpio.
    estadoRonda = { usado3: false, usado2: false, ganadorCartaId: null, jugadorGanador: null };

    tandaActual++;
    var nuevasCartas = [];
    for (var k = 0; k < cartasPorLote; k++) {
        var numero = mazoRestante.shift();
        nuevasCartas.push({
            id: 'carta-' + tandaActual + '-' + k,
            numero: numero,
            imagen: 'imagenes/Corredor_' + numero + '.png',
            seleccionadoPor: null,
            seleccionadoPorId: null,
            esGanadora: false,
            descartada: false,
            tanda: tandaActual
        });
    }
    cartas = cartas.concat(nuevasCartas);
    gameStarted = true;

    broadcastStart(cartas, tandaActual, mazoRestante, esPrimerLote);
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();
    saveSession();
}
window.iniciarJuego = iniciarJuego;

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

// --- CARTA 17: deja "copiar" (solo visualmente, y SOLO PARA MI) la imagen de
// un corredor que TODAVIA no ha salido en ninguna tanda (sigue en el mazo).
// El resto de jugadores sigue viendo esta carta como "#17" normal: no se
// cambia carta.numero/imagen (eso es compartido), solo se guarda en
// `copiasVisuales`, que es local. No afecta su estado real (activa,
// ganadora, descartada), que siempre se maneja por el id real de la carta.
function intercambiarPor17(cartaActual) {
    if (!mazoRestante || mazoRestante.length === 0) {
        alert('No quedan corredores en el mazo para copiar.');
        return;
    }
    var candidatosNumeros = mazoRestante.filter(function(n) {
        return n !== 17 && n !== 33;
    });
    if (candidatosNumeros.length === 0) {
        alert('No quedan corredores disponibles en el mazo para copiar.');
        return;
    }
    // Mezclar
    var mezclados = candidatosNumeros.slice();
    for (var i = mezclados.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = mezclados[i];
        mezclados[i] = mezclados[j];
        mezclados[j] = temp;
    }
    var seleccionables = mezclados.slice(0, Math.min(3, mezclados.length)).map(function(n) {
        return { numero: n, imagen: 'imagenes/Corredor_' + n + '.png' };
    });

    mostrarModalSeleccion(seleccionables, 'Elige un corredor para copiar (17) - solo tu lo veras asi', function(elegido) {
        copiasVisuales[cartaActual.id] = { numero: elegido.numero, imagen: elegido.imagen };
        playersData[myId].activeCardId = cartaActual.id;
        broadcastSetActive(myId, cartaActual.id);
        broadcastState('sync');
        renderizarCartas();
        renderizarMisCorredores();
        actualizarUI();
        saveSession();
    });
}

// --- CARTA 33: deja "copiar" (solo visualmente, y SOLO PARA MI) la imagen de
// una carta ganadora ya existente. Igual que 17: el resto sigue viendo "#33".
function intercambiarPor33(cartaActual) {
    var vistos = {};
    var ganadoras = cartas.filter(function(c) {
        if (c.id === cartaActual.id) return false;
        if (!c.esGanadora) return false;
        if (c.numero === 17 || c.numero === 33) return false;
        if (vistos[c.numero]) return false; // evitar ofrecer el mismo numero dos veces
        vistos[c.numero] = true;
        return true;
    });
    if (ganadoras.length === 0) {
        alert('No hay cartas ganadoras disponibles (o son especiales).');
        return;
    }

    mostrarModalSeleccion(ganadoras, 'Elige una carta ganadora para copiar (33) - solo tu la veras asi', function(cartaElegida) {
        copiasVisuales[cartaActual.id] = { numero: cartaElegida.numero, imagen: cartaElegida.imagen };
        playersData[myId].activeCardId = cartaActual.id;
        broadcastSetActive(myId, cartaActual.id);
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

    // Si ya elegiste una carta esta ronda (sea esta misma u otra), la eleccion
    // queda bloqueada: no se puede deshacer ni cambiar hasta la proxima ronda.
    if (activeActual) {
        if (activeActual !== cartaId) {
            alert('Ya elegiste tu corredor para usar esta ronda. No puedes cambiar de carta hasta la proxima ronda.');
        }
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
    // Sincronizamos el estado completo de inmediato: ayuda a que el resto de
    // jugadores (y el leaderboard) sepan cuanto antes que ya elegiste tu carta.
    broadcastState('sync');
    renderizarMisCorredores();
    actualizarUI();
    saveSession();
}
window.setActiveCard = setActiveCard;

// Descarta las cartas activas de TODOS los jugadores (se llama al presionar
// "2grado"). La carta del ganador (esGanadora === true) tambien se descarta
// y desaparece de "Mis Corredores", pero conserva su estatus de ganadora y
// sigue visible en el boton "Ganadores".
function descartarActivas(ganadorId) {
    for (var id in playersData) {
        var data = playersData[id];
        if (!data) continue;
        var activeId = data.activeCardId;
        if (activeId) {
            for (var i = 0; i < cartas.length; i++) {
                if (cartas[i].id === activeId) {
                    cartas[i].descartada = true;
                    if (id === myId) {
                        var idx = misSelecciones.indexOf(activeId);
                        if (idx !== -1) {
                            misSelecciones.splice(idx, 1);
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
    setTimeout(function() {
        broadcastState('sync');
    }, 2000);
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
        var puedeRepartir = !gameStarted || (typeof loteTerminado === 'function' && loteTerminado());
        startBtn.disabled = !puedeRepartir;
        if (!gameStarted) {
            startBtn.textContent = 'Corredores';
        } else if (puedeRepartir) {
            startBtn.textContent = 'Siguiente lote';
        } else {
            startBtn.textContent = 'Corredores en juego';
        }
    }
    var puntosDisplay = document.getElementById('misPuntosDisplay');
    if (puntosDisplay && puntosPorJugador[myId] !== undefined) {
        puntosDisplay.textContent = 'Puntos: ' + puntosPorJugador[myId];
    }
    var restantesDisplay = document.getElementById('mazoRestanteDisplay');
    if (restantesDisplay) {
        restantesDisplay.textContent = 'Restantes: ' + (mazoRestante ? mazoRestante.length : 0);
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

    // El juego se considera terminado solo cuando nadie tiene cartas en
    // juego Y ya no queda mazo suficiente para repartir un lote nuevo.
    var juegoTerminado = false;
    if (gameStarted) {
        var quedanCartasEnJuego = false;
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
                quedanCartasEnJuego = true;
                break;
            }
        }
        var numJugadoresActual = Object.keys(playersData).length;
        var alcanzaMazo = mazoRestante.length >= (numJugadoresActual * 2) && numJugadoresActual > 0;
        if (!quedanCartasEnJuego && !alcanzaMazo) {
            juegoTerminado = true;
        }
    }

    if (juegoTerminado) {
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
            msg.textContent = 'Juego terminado: no quedan corredores en el mazo.';
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
    // Refrescamos el mensaje "sync" retenido para que cualquiera que se una
    // despues del reinicio reciba el estado ya reiniciado, no el anterior.
    broadcastState('sync');
}
window.resetGlobalGame = resetGlobalGame;

function resetLocalGame() {
    cartas = [];
    misSelecciones = [];
    puntosPorJugador = {};
    estadoRonda = { usado3: false, usado2: false, ganadorCartaId: null, jugadorGanador: null };
    cartaActivaId = null;
    tandaActual = -1;
    mazoRestante = [];
    copiasVisuales = {};
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
        var visual = copiasVisuales[c.id] || null;
        var numeroMostrado = visual ? visual.numero : c.numero;
        var imagenMostrada = visual ? visual.imagen : c.imagen;
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
        img.src = imagenMostrada;
        img.alt = 'Corredor ' + numeroMostrado;
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
        numSpan.textContent = '#' + numeroMostrado;
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