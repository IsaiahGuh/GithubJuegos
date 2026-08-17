// juego.js
// ===== CONFIGURACION =====
// --- Como funciona el mazo/lotes/ciclos (para futuras modificaciones) ---
// - `mazoRestante` guarda los numeros de corredor (1..36) que TODAVIA no se
//   han repartido en esta partida. Se baraja una sola vez, al presionar
//   "Corredores" por primera vez, y se va consumiendo de a poco.
// - Cada vez que se presiona "Corredores" arranca un CICLO nuevo: se
//   reparten LOTES_POR_CICLO (2) lotes de tamano = numJugadores * 2 cada
//   uno, sacados directamente de `mazoRestante`. El primer lote se reparte
//   al presionar el boton; el segundo se reparte SOLO Y AUTOMATICAMENTE en
//   cuanto todos terminan de escoger las cartas del primer lote (ver
//   verificarSiguienteLote()), sin que nadie tenga que presionar nada. Como
//   se saca sin reponer, un numero de corredor JAMAS se repite entre lotes.
// - `cartas` acumula TODAS las cartas repartidas en la partida (de todos
//   los lotes/ciclos), no se reemplaza entre lotes. Cada carta recuerda a
//   que lote pertenece en su campo `tanda`.
// - `tandaActual` es el indice del ultimo lote repartido (0, 1, 2...) y
//   `cicloTandaInicio` es el indice del primer lote del ciclo actual.
// - Recien cuando los 2 lotes del ciclo fueron repartidos Y seleccionados
//   por completo (cada jugador con sus 4 corredores) se habilita el boton
//   "Usar" (ver todosLotesCicloCompletos()).
// - El boton "Corredores" se bloquea apenas arranca un ciclo, y se vuelve a
//   habilitar solo cuando TODAS las cartas de ese ciclo (las 4 de cada
//   jugador) ya fueron usadas/descartadas (ver cicloTerminado()).
var cartas = [];
var misSelecciones = [];
var MAX_SELECCIONES = 2; // corredores por jugador, por lote
var TOTAL_IMAGENES = 36;
var cartaActivaId = null; // ya no se usa a nivel global, se usa por jugador
var tandaActual = -1; // -1 = todavia no se ha repartido ningun lote
var mazoRestante = []; // numeros de corredor que faltan por repartir
// --- CICLOS DE REPARTO ---
// Cada vez que se presiona "Corredores" arranca un CICLO nuevo. Un ciclo
// reparte LOTES_POR_CICLO lotes (2) de forma automatica, uno detras de
// otro: en cuanto todos los jugadores terminan de escoger las cartas del
// lote actual, se reparte de inmediato el siguiente lote del mismo ciclo,
// sin que nadie tenga que presionar ningun boton. Recien cuando los
// LOTES_POR_CICLO lotes fueron repartidos Y seleccionados por completo
// (cada jugador con sus 4 corredores) se habilita el boton "Usar". El
// boton "Corredores" se vuelve a habilitar solo cuando TODAS las cartas
// del ciclo actual fueron descartadas (jugadas).
var LOTES_POR_CICLO = 2;
var cicloTandaInicio = 0; // indice de "tanda" en el que arranco el ciclo actual
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
    verificarSiguienteLote();
}
window.seleccionarCarta = seleccionarCarta;

// Devuelve true si el CICLO actual (los LOTES_POR_CICLO lotes repartidos
// desde la ultima vez que se presiono "Corredores") ya esta completamente
// resuelto: es decir, todas las cartas de esos lotes fueron descartadas
// (jugadas). Mientras esto sea false, el boton "Corredores" permanece
// bloqueado.
function cicloTerminado() {
    if (tandaActual < 0) return true; // todavia no se reparte nada
    for (var i = 0; i < cartas.length; i++) {
        var c = cartas[i];
        if (c.tanda >= cicloTandaInicio && c.tanda <= tandaActual && !c.descartada) {
            return false;
        }
    }
    return true;
}
window.cicloTerminado = cicloTerminado;

// Devuelve true solo cuando YA se repartieron los LOTES_POR_CICLO lotes del
// ciclo actual Y todas esas cartas ya fueron seleccionadas por algun
// jugador (es decir, cada jugador ya tiene sus 4 corredores). Solo a partir
// de aqui se puede usar el boton "Usar" para jugar una carta.
function todosLotesCicloCompletos() {
    if (tandaActual < cicloTandaInicio + LOTES_POR_CICLO - 1) return false;
    for (var i = 0; i < cartas.length; i++) {
        var c = cartas[i];
        if (c.tanda >= cicloTandaInicio && c.tanda <= tandaActual && !c.seleccionadoPor) {
            return false;
        }
    }
    return true;
}
window.todosLotesCicloCompletos = todosLotesCicloCompletos;

// Reparte automaticamente el siguiente lote del ciclo actual, sin que nadie
// tenga que presionar ningun boton. Solo lo ejecuta el anfitrion de la
// sala (o cualquiera si se juega sin sala), para evitar que dos jugadores
// repartan el mismo lote dos veces.
function repartirSiguienteLoteAutomatico() {
    var numJugadores = Object.keys(playersData).length;
    if (numJugadores === 0) return;
    var cartasPorLote = numJugadores * 2;
    if (mazoRestante.length < cartasPorLote) return; // no alcanza el mazo, se deja como esta

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
    broadcastStart(cartas, tandaActual, mazoRestante, false, false);
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();
    saveSession();
}
window.repartirSiguienteLoteAutomatico = repartirSiguienteLoteAutomatico;

// Revisa si el lote actual del ciclo ya fue completamente seleccionado (sin
// cartas disponibles) y, de ser asi, reparte de inmediato el siguiente lote
// del mismo ciclo. Se llama cada vez que alguien selecciona una carta
// (tanto localmente como al recibir la seleccion de otro jugador por red).
function verificarSiguienteLote() {
    if (tandaActual < 0) return;
    if (tandaActual >= cicloTandaInicio + LOTES_POR_CICLO - 1) return; // ya se repartieron todos los lotes del ciclo
    var quedanDisponibles = false;
    for (var i = 0; i < cartas.length; i++) {
        if (cartas[i].tanda === tandaActual && !cartas[i].seleccionadoPor) {
            quedanDisponibles = true;
            break;
        }
    }
    if (quedanDisponibles) return; // todavia hay cartas de este lote sin escoger
    var esAnfitrion = !currentRoom || !hostId || hostId === myId;
    if (!esAnfitrion) return;
    repartirSiguienteLoteAutomatico();
}
window.verificarSiguienteLote = verificarSiguienteLote;

function iniciarJuego() {
    var numJugadores = Object.keys(playersData).length;
    if (numJugadores === 0) {
        alert('No hay jugadores en la sala. Espera a que alguien se una.');
        return;
    }
    if (gameStarted && !cicloTerminado()) {
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

    // Al arrancar un ciclo nuevo (incluso si no es el primero), el estado de
    // la ronda de puntaje (1grado/2grado) siempre debe partir limpio.
    estadoRonda = { usado3: false, usado2: false, ganadorCartaId: null, jugadorGanador: null };

    tandaActual++;
    cicloTandaInicio = tandaActual; // este lote es el primero del nuevo ciclo
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

    // El segundo (y ultimo) lote de este ciclo se repartira automaticamente
    // en cuanto todos terminen de escoger las cartas de este primer lote
    // (ver verificarSiguienteLote()), sin necesidad de volver a presionar
    // "Corredores".
    broadcastStart(cartas, tandaActual, mazoRestante, esPrimerLote, true);
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

    if (typeof todosLotesCicloCompletos === 'function' && !todosLotesCicloCompletos()) {
        alert('Todavia faltan corredores por repartir/escoger. Espera a que todos los jugadores tengan sus 4 corredores antes de usar uno.');
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

// Aplica LOCALMENTE el descarte de las cartas activas de TODOS los
// jugadores (se ejecuta al presionar "2grado"). La carta del ganador
// (esGanadora === true) tambien se descarta y desaparece de "Mis
// Corredores", pero conserva su estatus de ganadora y sigue visible en el
// boton "Ganadores".
//
// IMPORTANTE: esta funcion NO transmite nada por red. Cada jugador la debe
// ejecutar en su propio dispositivo (ver descartarActivas() para quien
// presiona el boton, y el manejador de 'puntaje_global' en mqtt.js para el
// resto). Esto es clave: el campo `misSelecciones` (y `playersData[miId
// ].selecciones`) es un dato LOCAL de cada jugador, asi que solo dejar que
// el mensaje de red "sync" lo actualice puede llegar tarde o perderse, y
// entonces la carta ganadora nunca desaparece de "Mis Corredores" en la
// pantalla del propio ganador, dejando la ronda trabada. Al ejecutar este
// mismo calculo en cada dispositivo (usando el activeCardId ya sincronizado
// de cada jugador) el resultado es identico en todos y no depende de que
// un unico mensaje de red llegue bien.
function aplicarDescarteActivas(ganadorId) {
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
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();
    saveSession();
}
window.aplicarDescarteActivas = aplicarDescarteActivas;

// La ejecuta quien presiona "2grado": aplica el descarte en su propio
// dispositivo y ademas avisa al resto de la sala.
function descartarActivas(ganadorId) {
    aplicarDescarteActivas(ganadorId);
    broadcastState('sync');
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
        var puedeRepartir = !gameStarted || (typeof cicloTerminado === 'function' && cicloTerminado());
        startBtn.disabled = !puedeRepartir;
        if (!gameStarted) {
            startBtn.textContent = 'Corredores';
        } else if (puedeRepartir) {
            startBtn.textContent = 'Nuevos Corredores';
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
    cicloTandaInicio = 0;
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