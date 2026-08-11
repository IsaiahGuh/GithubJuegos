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

function connectToRoom(code, isReconnect) {
    if (isReconnect === undefined) isReconnect = false;
    
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
                cartasGanadoras: []
            };
        }
        
        joinSuccess(code);
        broadcastState('join');
        
        if (!isReconnect) {
            broadcastRequestState();
        }
        
        saveSession();
    });

    mqttClient.on('message', function(topic, message) {
        try {
            var data = JSON.parse(message.toString());
            if (data.id === myId) return;

            // Reclamo
            if (data.action === 'claim_offer') {
                if (data.targetId === myId && !claimResolved && (data.selecciones || []).length > 0) {
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

            if (!claimResolved && data.name === myName && (data.selecciones || []).length > 0) {
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

            // Actualizar datos del jugador
            if (data.id && data.name && data.action !== 'request_state' && data.action !== 'remove') {
                if (!playersData[data.id]) {
                    playersData[data.id] = { name: data.name, selecciones: [], cartasGanadoras: [] };
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

            // Acciones
            if (data.action === 'start') {
                gameStarted = true;
                gameInitiator = data.id;
                cartas = data.cartas || [];
                if (data.id !== myId) {
                    misSelecciones = [];
                    puntosPorJugador = {};
                    estadoRonda = { usado3: false, usado2: false, ganadorCartaId: null, jugadorGanador: null };
                    cartaActivaId = null;
                }
                // Inicializar puntos para todos los jugadores
                for (var pid in playersData) {
                    if (!puntosPorJugador[pid]) {
                        puntosPorJugador[pid] = 0;
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
                        // Actualizar cartasGanadoras del jugador
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

            if (data.action === 'select') {
                var cartaId = data.cartaId;
                var jugadorNombre = data.name;
                var jugadorId = data.id;
                var selecciones = data.selecciones || [];
                
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
            }

            if (data.action === 'remove') {
                delete playersData[data.id];
                delete puntosPorJugador[data.id];
                renderLeaderboard();
                return;
            }

            if (data.action === 'sync') {
                if (data.cartas) {
                    cartas = data.cartas;
                    renderizarCartas();
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
                            playersData[pid] = data.playersData[pid];
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

            if (data.action === 'join') {
                var cachedMatch = null;
                for (var id in playersData) {
                    if (id !== data.id && playersData[id].name === data.name && (playersData[id].selecciones || []).length > 0) {
                        cachedMatch = id;
                        break;
                    }
                }
                if (cachedMatch) {
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
            gameStarted: gameStarted,
            gameInitiator: gameInitiator || null,
            playersData: playersData,
            puntosPorJugador: puntosPorJugador,
            estadoRonda: estadoRonda
        });
        mqttClient.publish(topic, payload);
    }
}

function broadcastRequestState() {
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'request_state',
            id: myId
        });
        mqttClient.publish(topic, payload);
    }
}

function broadcastStart(cartasArray) {
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'start',
            id: myId,
            name: myName,
            cartas: cartasArray,
            gameStarted: true,
            playersData: playersData,
            puntosPorJugador: puntosPorJugador,
            estadoRonda: estadoRonda
        });
        mqttClient.publish(topic, payload);
        gameStarted = true;
        gameInitiator = myId;
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
            selecciones: misSelecciones || []
        });
        mqttClient.publish(topic, payload);
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
        mqttClient.publish(topic, payload);
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
        mqttClient.publish(topic, payload);
    }
}

function broadcastRemove(idToRemove) {
    if (mqttClient && currentRoom) {
        var topic = 'magical_athlete/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'remove',
            id: idToRemove
        });
        mqttClient.publish(topic, payload);
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
        mqttClient.publish(topic, payload);
    }
}

function showClaimModal(claim) {
    var modal = document.getElementById('claimModal');
    var text = document.getElementById('claimText');
    if (text) {
        text.textContent = 'Ya hay un jugador "' + claim.name + '" en la sala con ' + 
                          (claim.selecciones ? claim.selecciones.length : 0) + 
                          ' cartas seleccionadas. ¿Eres tu (te desconectaste antes)?';
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