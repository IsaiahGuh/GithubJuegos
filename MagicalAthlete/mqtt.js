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
        
        playersData[myId] = { 
            name: myName, 
            selecciones: misSelecciones || []
        };
        
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

            if (data.action === 'claim_offer') {
                if (data.targetId === myId && !claimResolved && (data.selecciones || []).length > 0) {
                    claimResolved = true;
                    pendingClaim = { 
                        oldId: data.offeredId, 
                        name: data.name, 
                        selecciones: data.selecciones || [] 
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
                    selecciones: data.selecciones || [] 
                };
                showClaimModal(pendingClaim);
                return;
            }

            if (data.id && data.name && data.action !== 'request_state' && data.action !== 'remove') {
                playersData[data.id] = { 
                    name: data.name, 
                    selecciones: data.selecciones || []
                };
                renderLeaderboard();
            }

            if (data.action === 'start') {
                gameStarted = true;
                gameInitiator = data.id;
                cartas = data.cartas || [];
                // Reiniciar selecciones de todos los jugadores (incluido el local)
                var ids = Object.keys(playersData);
                for (var i = 0; i < ids.length; i++) {
                    playersData[ids[i]].selecciones = [];
                }
                // Si soy yo, también reinicio mis selecciones
                if (data.id === myId) {
                    misSelecciones = [];
                }
                renderizarCartas();
                actualizarUI();
                saveSession();
            }

            if (data.action === 'select') {
                var cartaId = data.cartaId;
                var jugadorNombre = data.name;
                var jugadorId = data.id;
                
                for (var i = 0; i < cartas.length; i++) {
                    if (cartas[i].id === cartaId) {
                        cartas[i].seleccionadoPor = jugadorNombre;
                        cartas[i].seleccionadoPorId = jugadorId;
                        break;
                    }
                }
                
                if (playersData[jugadorId]) {
                    playersData[jugadorId].selecciones = data.selecciones || [];
                }
                
                renderizarCartas();
                renderLeaderboard();
                actualizarUI();
                saveSession();
            }

            if (data.action === 'remove') {
                delete playersData[data.id];
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
            gameInitiator: gameInitiator || null
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
            gameStarted: true
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
            selecciones: cached.selecciones || []
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