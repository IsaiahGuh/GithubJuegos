// mqtt.js (se añade broadcastSetActive)
// ===== SISTEMA MULTIJUGADOR MQTT =====
var mqttClient = null;
var myId = Math.random().toString(36).substr(2, 9);
var currentRoom = null;
var playersData = {};
var myName = 'Jugador';
var claimResolved = false;
var pendingClaim = null;
var gameStarted = false;
var gameInitiator = null;
var hostId = null; // id del jugador anfitrion de la sala (unico que puede reiniciar)
var hostClaimTimer = null;
var hostHeartbeatInterval = null;

// Fusiona el arreglo de cartas recibido por red con el que tenemos localmente,
// en vez de reemplazarlo por completo. Esto evita que un mensaje "sync" que
// llegue tarde o desordenado (la red MQTT no garantiza orden) "resucite" una
// carta que ya sabiamos que estaba descartada. Los campos criticos
// (descartada, esGanadora) son monotonos: una vez true, se quedan en true
// sin importar lo que diga el mensaje entrante.
function mergeCartas(incomingCartas) {
    if (!incomingCartas || !incomingCartas.length) return;
    var localById = {};
    for (var i = 0; i < cartas.length; i++) {
        localById[cartas[i].id] = cartas[i];
    }
    var merged = [];
    for (var j = 0; j < incomingCartas.length; j++) {
        var inc = incomingCartas[j];
        var loc = localById[inc.id];
        if (!loc) {
            merged.push(inc);
            continue;
        }
        merged.push({
            id: inc.id,
            numero: inc.numero,
            imagen: inc.imagen,
            tanda: inc.tanda !== undefined ? inc.tanda : loc.tanda,
            descartada: !!(loc.descartada || inc.descartada),
            esGanadora: !!(loc.esGanadora || inc.esGanadora),
            seleccionadoPor: loc.seleccionadoPor || inc.seleccionadoPor || null,
            seleccionadoPorId: loc.seleccionadoPorId || inc.seleccionadoPorId || null
        });
    }
    cartas = merged;
}
window.mergeCartas = mergeCartas;

// Si el activeCardId que llega por red apunta a una carta que en nuestro
// estado actual ya esta descartada (o que no existe), lo ignoramos. Esto
// evita que un jugador que se reconecta con datos atrasados (por ejemplo,
// porque cerro la pagina antes de enterarse de que su carta fue descartada)
// "resucite" esa carta como si siguiera activa en la ronda.
function activeCardIdSaneado(id) {
    if (!id) return null;
    for (var i = 0; i < cartas.length; i++) {
        if (cartas[i].id === id) {
            return cartas[i].descartada ? null : id;
        }
    }
    return id; // si no la conocemos aun (p.ej. cartas todavia no ha llegado), la dejamos pasar
}
window.activeCardIdSaneado = activeCardIdSaneado;

function connectToRoom(code, isReconnect) {
    if (isReconnect === undefined) isReconnect = false;
    
    if (!isReconnect) {
        playersData = {};
        puntosPorJugador = {};
        estadoRonda = { usado3: false, usado2: false, ganadorCartaId: null, jugadorGanador: null };
        cartas = [];
        misSelecciones = [];
        cartaActivaId = null;
        tandaActual = -1;
        cicloTandaInicio = 0;
        mazoRestante = [];
        copiasVisuales = {};
        gameStarted = false;
        gameInitiator = null;
        hostId = null;
    }

    if (hostClaimTimer) {
        clearTimeout(hostClaimTimer);
        hostClaimTimer = null;
    }
    if (hostHeartbeatInterval) {
        clearInterval(hostHeartbeatInterval);
        hostHeartbeatInterval = null;
    }

    showLoading(isReconnect ? 'Reconectando a la sala...' : 'Conectando con la sala...');
    claimResolved = isReconnect;
    pendingClaim = null;

    mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    mqttClient.on('connect', function() {
        currentRoom = code;
        var topic = 'magical_athlete/room/' + code;
        mqttClient.subscribe(topic);
        
        if (!playersData[myId]) {
            playersData[myId] = { 
                name: myName, 
                selecciones: misSelecciones || [],
                cartasGanadoras: [],
                activeCardId: null
            };
        } else {
            playersData[myId].name = myName;
            playersData[myId].selecciones = misSelecciones || [];
            if (playersData[myId].activeCardId === undefined) {
                playersData[myId].activeCardId = null;
            }
        }
        
        joinSuccess(code);
        broadcastState('join');

        // Siempre pedimos el estado actual a los demas: esto es clave para que
        // alguien que se desconecto (celular apagado, salio de la pagina, etc.)
        // reciba el estado real y actualizado al reconectar, en vez de quedarse
        // con su copia local desactualizada.
        broadcastRequestState();

        // Determinar anfitrion: si nadie responde con un hostId conocido en un
        // par de segundos, este jugador se autoproclama anfitrion.
        if (!hostId) {
            hostClaimTimer = setTimeout(function() {
                if (!hostId) {
                    hostId = myId;
                    broadcastHostClaim();
                    actualizarUI();
                    saveSession();
                }
            }, 1800);
        }

        // El anfitrion reenvia el estado completo cada cierto tiempo para
        // autocorregir a cualquier cliente que haya perdido mensajes por la
        // red (MQTT publica sin garantia de entrega).
        if (hostHeartbeatInterval) clearInterval(hostHeartbeatInterval);
        hostHeartbeatInterval = setInterval(function() {
            if (hostId === myId && currentRoom) {
                broadcastState('sync');
            }
        }, 15000);

        saveSession();
    });

    mqttClient.on('message', function(topic, message) {
        try {
            var data = JSON.parse(message.toString());
            if (data.id === myId) return;

            if (data.action === 'claim_offer') {
                if (data.targetId === myId && !claimResolved && misSelecciones.length === 0 && (data.selecciones || []).length > 0) {
                    claimResolved = true;
                    pendingClaim = { 
                        oldId: data.offeredId, 
                        name: data.name, 
                        selecciones: data.selecciones || [],
                        cartasGanadoras: data.cartasGanadoras || []
                    };
                    showClaimModal(pendingClaim);
                }
                return;
            }

            if (!claimResolved && data.name === myName && misSelecciones.length === 0 && (data.selecciones || []).length > 0) {
                claimResolved = true;
                pendingClaim = { 
                    oldId: data.id, 
                    name: data.name, 
                    selecciones: data.selecciones || [],
                    cartasGanadoras: data.cartasGanadoras || []
                };
                showClaimModal(pendingClaim);
                return;
            }

            if (data.id && data.name && data.action !== 'request_state' && data.action !== 'remove' && data.action !== 'sync' && data.action !== 'set_active') {
                if (!playersData[data.id]) {
                    playersData[data.id] = { name: data.name, selecciones: [], cartasGanadoras: [], activeCardId: null };
                }
                playersData[data.id].name = data.name;
                if (data.selecciones) {
                    playersData[data.id].selecciones = data.selecciones;
                }
                if (data.cartasGanadoras) {
                    playersData[data.id].cartasGanadoras = data.cartasGanadoras;
                }
                renderLeaderboard();
            }

            if (data.action === 'reset_all') {
                var seenNames = {};
                var toRemove = [];
                for (var id in playersData) {
                    var name = playersData[id].name;
                    if (seenNames[name] !== undefined) {
                        toRemove.push(id);
                    } else {
                        seenNames[name] = id;
                    }
                }
                for (var i = 0; i < toRemove.length; i++) {
                    delete playersData[toRemove[i]];
                    delete puntosPorJugador[toRemove[i]];
                }
                resetLocalGame();
                return;
            }

            if (data.action === 'host_claim') {
                // Si no tenemos anfitrion, o el que llega tiene id "menor"
                // (para resolver empates si dos se autoproclaman a la vez),
                // adoptamos ese id como anfitrion.
                if (!hostId || data.id < hostId) {
                    hostId = data.id;
                    if (hostClaimTimer) {
                        clearTimeout(hostClaimTimer);
                        hostClaimTimer = null;
                    }
                    actualizarUI();
                    saveSession();
                }
                return;
            }

            if (data.hostId && (!hostId || data.hostId < hostId)) {
                hostId = data.hostId;
                if (hostClaimTimer) {
                    clearTimeout(hostClaimTimer);
                    hostClaimTimer = null;
                }
            }

            if (data.action === 'start') {
                gameStarted = true;
                gameInitiator = data.id;
                cartas = data.cartas || [];
                tandaActual = data.tandaActual !== undefined ? data.tandaActual : 0;
                mazoRestante = data.mazoRestante || [];
                if (data.nuevoCiclo) {
                    // Este lote es el primero de un ciclo nuevo (los dos
                    // lotes que se reparten automaticamente por cada
                    // "Corredores").
                    cicloTandaInicio = tandaActual;
                }
                if (data.id !== myId && data.esPrimerLote) {
                    // Solo reiniciamos nuestro estado local si es el PRIMER
                    // lote de una partida nueva; si es un lote adicional
                    // (continuacion de la misma partida), conservamos
                    // nuestros puntos y demas datos actuales.
                    misSelecciones = [];
                    puntosPorJugador = {};
                    cartaActivaId = null;
                    copiasVisuales = {};
                }
                estadoRonda = { usado3: false, usado2: false, ganadorCartaId: null, jugadorGanador: null };
                for (var pid in playersData) {
                    if (!puntosPorJugador[pid]) {
                        puntosPorJugador[pid] = 0;
                    }
                    if (playersData[pid] && playersData[pid].activeCardId === undefined) {
                        playersData[pid].activeCardId = null;
                    }
                }
                renderizarCartas();
                renderizarMisCorredores();
                actualizarUI();
                saveSession();
            }

            if (data.action === 'puntaje_global') {
                var jugadorId = data.id;
                var tipo = data.tipo;
                var nuevosPuntos = data.puntos;
                if (jugadorId === myId) {
                    puntosPorJugador[myId] = nuevosPuntos;
                } else {
                    if (!puntosPorJugador[jugadorId]) {
                        puntosPorJugador[jugadorId] = 0;
                    }
                    puntosPorJugador[jugadorId] = nuevosPuntos;
                }
                if (tipo === '+3' || tipo === '+2') {
                    estadoRonda.usado3 = (tipo === '+3');
                    estadoRonda.usado2 = (tipo === '+2');
                    if (tipo === '+3') {
                        estadoRonda.ganadorCartaId = data.cartaId || null;
                        estadoRonda.jugadorGanador = data.id;
                        for (var i = 0; i < cartas.length; i++) {
                            if (cartas[i].id === data.cartaId) {
                                cartas[i].esGanadora = true;
                                break;
                            }
                        }
                        if (playersData[jugadorId]) {
                            if (!playersData[jugadorId].cartasGanadoras) {
                                playersData[jugadorId].cartasGanadoras = [];
                            }
                            if (playersData[jugadorId].cartasGanadoras.indexOf(data.cartaId) === -1) {
                                playersData[jugadorId].cartasGanadoras.push(data.cartaId);
                            }
                        }
                    }
                    if (tipo === '+2') {
                        // Cada jugador aplica el descarte en su propio
                        // dispositivo (en vez de esperar a que le llegue el
                        // "sync" de quien presiono el boton). Esto es lo que
                        // hace que la carta ganadora SI desaparezca de "Mis
                        // Corredores" en la pantalla del ganador, y que su
                        // activeCardId quede libre para la siguiente ronda.
                        if (typeof window.aplicarDescarteActivas === 'function') {
                            window.aplicarDescarteActivas(estadoRonda.jugadorGanador);
                        }
                        setTimeout(function() {
                            reiniciarRonda();
                        }, 500);
                    }
                }
                actualizarUI();
                saveSession();
            }

            if (data.action === 'estado_ronda') {
                estadoRonda = data.estado;
                actualizarUI();
                saveSession();
            }

            if (data.action === 'set_active') {
                var jugadorId = data.id;
                var activeCardId = data.activeCardId;
                if (playersData[jugadorId]) {
                    playersData[jugadorId].activeCardId = activeCardId;
                } else {
                    playersData[jugadorId] = { name: data.name || jugadorId, selecciones: [], cartasGanadoras: [], activeCardId: activeCardId };
                }
                renderizarMisCorredores();
                actualizarUI();
                saveSession();
            }

            if (data.action === 'select') {
                var cartaId = data.cartaId;
                var jugadorNombre = data.name;
                var jugadorId = data.id;
                var selecciones = data.selecciones || [];
                var tandaSelect = data.tandaActual !== undefined ? data.tandaActual : 0;
                
                for (var i = 0; i < cartas.length; i++) {
                    if (cartas[i].id === cartaId) {
                        cartas[i].seleccionadoPor = jugadorNombre;
                        cartas[i].seleccionadoPorId = jugadorId;
                        break;
                    }
                }
                
                if (playersData[jugadorId]) {
                    playersData[jugadorId].selecciones = selecciones;
                }
                
                if (jugadorId === myId) {
                    misSelecciones = selecciones.slice();
                }
                
                renderizarCartas();
                renderizarMisCorredores();
                renderLeaderboard();
                actualizarUI();
                saveSession();
                if (typeof window.verificarSiguienteLote === 'function') {
                    window.verificarSiguienteLote();
                }
            }

            if (data.action === 'remove') {
                delete playersData[data.id];
                delete puntosPorJugador[data.id];
                renderLeaderboard();
                return;
            }

            if (data.action === 'sync') {
                if (data.cartas) {
                    mergeCartas(data.cartas);
                    renderizarCartas();
                }
                if (data.tandaActual !== undefined) {
                    tandaActual = data.tandaActual;
                }
                if (data.cicloTandaInicio !== undefined) {
                    cicloTandaInicio = data.cicloTandaInicio;
                }
                if (data.mazoRestante !== undefined) {
                    mazoRestante = data.mazoRestante;
                }
                if (data.gameStarted !== undefined) {
                    gameStarted = data.gameStarted;
                }
                if (data.gameInitiator) {
                    gameInitiator = data.gameInitiator;
                }
                if (data.playersData) {
                    for (var pid in data.playersData) {
                        if (pid !== myId) {
                            if (!playersData[pid]) {
                                playersData[pid] = { name: data.playersData[pid].name, selecciones: [], cartasGanadoras: [], activeCardId: null };
                            }
                            playersData[pid].name = data.playersData[pid].name;
                            playersData[pid].selecciones = data.playersData[pid].selecciones || [];
                            playersData[pid].cartasGanadoras = data.playersData[pid].cartasGanadoras || [];
                            // --- FIX: Solo actualizar si el mensaje incluye activeCardId ---
                            if (data.playersData[pid].activeCardId !== undefined) {
                                playersData[pid].activeCardId = activeCardIdSaneado(data.playersData[pid].activeCardId);
                            }
                        }
                    }
                }
                if (data.puntosPorJugador) {
                    for (var pid in data.puntosPorJugador) {
                        if (pid !== myId) {
                            puntosPorJugador[pid] = data.puntosPorJugador[pid];
                        }
                    }
                }
                if (data.estadoRonda) {
                    estadoRonda = data.estadoRonda;
                }
                actualizarUI();
                saveSession();
            }

            if (data.action === 'request_state') {
                broadcastState('sync');
            }

            if (data.action === 'join' || data.action === 'sync') {
                if (!playersData[data.id]) {
                    playersData[data.id] = {
                        name: data.name,
                        selecciones: data.selecciones || [],
                        cartasGanadoras: data.cartasGanadoras || [],
                        activeCardId: data.activeCardId !== undefined ? activeCardIdSaneado(data.activeCardId) : null
                    };
                } else {
                    playersData[data.id].name = data.name;
                    playersData[data.id].selecciones = data.selecciones || [];
                    playersData[data.id].cartasGanadoras = data.cartasGanadoras || [];
                    // Solo actualizar si el mensaje incluye activeCardId
                    if (data.activeCardId !== undefined) {
                        playersData[data.id].activeCardId = activeCardIdSaneado(data.activeCardId);
                    }
                    // Si no viene, conservamos el valor que ya tenía
                }
                renderLeaderboard();

                var cachedMatch = null;
                for (var id in playersData) {
                    if (id !== data.id && playersData[id].name === data.name && (playersData[id].selecciones || []).length > 0) {
                        cachedMatch = id;
                        break;
                    }
                }
                if (cachedMatch && (!data.selecciones || data.selecciones.length === 0)) {
                    broadcastClaimOffer(data.id, cachedMatch);
                }
            }

        } catch(e) { 
            console.error('Mensaje invalido', e); 
        }
    });

    mqttClient.on('error', function(err) {
        hideLoading();
        alert('Error de red. Revisa tu internet.');
    });
}

function broadcastState(action) {
    if (action === undefined) action = 'sync';
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: action,
            id: myId,
            name: myName,
            selecciones: misSelecciones || [],
            cartas: cartas || [],
            tandaActual: tandaActual,
            cicloTandaInicio: cicloTandaInicio,
            mazoRestante: mazoRestante || [],
            gameStarted: gameStarted,
            gameInitiator: gameInitiator || null,
            playersData: playersData,
            puntosPorJugador: puntosPorJugador,
            estadoRonda: estadoRonda,
            hostId: hostId || null
        });
        var opts = { qos: 1 };
        // Los mensajes "sync" se retienen en el broker: asi, cualquier
        // jugador que se conecte o reconecte (celular apagado, se salio de
        // la pagina, etc.) recibe el ultimo estado conocido INMEDIATAMENTE
        // al suscribirse, sin depender de que otro cliente le responda a
        // tiempo con el estado.
        if (action === 'sync') {
            opts.retain = true;
        }
        mqttClient.publish(topic, payload, opts);
    }
}

function broadcastRequestState() {
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'request_state',
            id: myId
        });
        mqttClient.publish(topic, payload, { qos: 1 });
    }
}

function broadcastHostClaim() {
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'host_claim',
            id: myId
        });
        mqttClient.publish(topic, payload, { qos: 1 });
    }
}

function broadcastStart(cartasArray, tanda, mazo, esPrimerLote, nuevoCiclo) {
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'start',
            id: myId,
            name: myName,
            cartas: cartasArray,
            tandaActual: tanda !== undefined ? tanda : 0,
            cicloTandaInicio: cicloTandaInicio,
            mazoRestante: mazo || [],
            esPrimerLote: !!esPrimerLote,
            nuevoCiclo: !!nuevoCiclo,
            gameStarted: true,
            playersData: playersData,
            puntosPorJugador: puntosPorJugador,
            estadoRonda: estadoRonda,
            hostId: hostId || null
        });
        mqttClient.publish(topic, payload, { qos: 1, retain: true });
        gameStarted = true;
        gameInitiator = myId;
        tandaActual = tanda !== undefined ? tanda : 0;
        mazoRestante = mazo || [];
    }
}

function broadcastSelect(cartaId) {
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'select',
            id: myId,
            name: myName,
            cartaId: cartaId,
            selecciones: misSelecciones || [],
            tandaActual: tandaActual
        });
        mqttClient.publish(topic, payload, { qos: 1 });
    }
}

function broadcastPuntajeGlobal(tipo) {
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'puntaje_global',
            id: myId,
            name: myName,
            tipo: tipo,
            puntos: puntosPorJugador[myId],
            cartaId: estadoRonda.ganadorCartaId || null
        });
        mqttClient.publish(topic, payload, { qos: 1 });
    }
}

function broadcastEstadoRonda() {
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'estado_ronda',
            id: myId,
            estado: estadoRonda
        });
        mqttClient.publish(topic, payload, { qos: 1 });
    }
}

function broadcastRemove(idToRemove) {
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'remove',
            id: idToRemove
        });
        mqttClient.publish(topic, payload, { qos: 1 });
    }
}

function broadcastReset() {
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'reset_all',
            id: myId,
            name: myName
        });
        mqttClient.publish(topic, payload, { qos: 1 });
    }
}

function broadcastClaimOffer(targetId, offeredId) {
    if (mqttClient && currentRoom) {
        var cached = playersData[offeredId];
        if (!cached) return;
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'claim_offer',
            targetId: targetId,
            offeredId: offeredId,
            name: cached.name,
            selecciones: cached.selecciones || [],
            cartasGanadoras: cached.cartasGanadoras || []
        });
        mqttClient.publish(topic, payload, { qos: 1 });
    }
}

function broadcastSetActive(playerId, activeCardId) {
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'set_active',
            id: playerId,
            activeCardId: activeCardId
        });
        mqttClient.publish(topic, payload, { qos: 1 });
    }
}
window.broadcastSetActive = broadcastSetActive;

function showClaimModal(claim) {
    var modal = document.getElementById('claimModal');
    var text = document.getElementById('claimText');
    if (text) {
        text.textContent = 'Ya hay un jugador "' + claim.name + '" en la sala con ' + 
                          (claim.selecciones ? claim.selecciones.length : 0) + 
                          ' cartas seleccionadas. Eres tu (te desconectaste antes)?';
    }
    if (modal) modal.style.display = 'flex';
}

function acceptClaim() {
    if (!pendingClaim) return;
    var staleTempId = myId;

    broadcastRemove(staleTempId);

    delete playersData[staleTempId];
    delete puntosPorJugador[staleTempId];

    myId = pendingClaim.oldId;
    misSelecciones = pendingClaim.selecciones.slice();

    if (pendingClaim.cartasGanadoras) {
        if (!playersData[myId]) {
            playersData[myId] = { name: myName, selecciones: [], cartasGanadoras: [], activeCardId: null };
        }
        playersData[myId].cartasGanadoras = pendingClaim.cartasGanadoras.slice();
    }

    if (cartas.length > 0) {
        for (var i = 0; i < cartas.length; i++) {
            if (cartas[i].seleccionadoPorId === myId) {
                cartas[i].seleccionadoPor = myName;
                cartas[i].seleccionadoPorId = myId;
            }
        }
        renderizarCartas();
        renderizarMisCorredores();
    }

    document.getElementById('claimModal').style.display = 'none';
    pendingClaim = null;
    actualizarUI();
    saveSession();
}

function declineClaim() {
    pendingClaim = null;
    document.getElementById('claimModal').style.display = 'none';
}