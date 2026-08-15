// ===== SISTEMA MULTIJUGADOR MQTT =====
var mqttClient = null;
var myId = Math.random().toString(36).substr(2, 9);
var currentRoom = null;
var playersData = {};
var myName = 'Jugador';
var claimResolved = false;
var pendingClaim = null;

function connectToRoom(code, isReconnect) {
    if (isReconnect === undefined) isReconnect = false;
    
    showLoading(isReconnect ? 'Reconectando a la sala...' : 'Conectando con la sala...');
    claimResolved = isReconnect;
    pendingClaim = null;

    mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    mqttClient.on('connect', function() {
        currentRoom = code;
        var topic = 'quixx_app_xyz/room/' + code;
        mqttClient.subscribe(topic);
        
        playersData[myId] = { 
            name: myName, 
            score: myTotalScore, 
            moves: moveHistory.slice() 
        };
        
        joinSuccess(code);
        broadcastSync();
        saveSession();
        // Si no hay host, reclamar tras breve retraso
        setTimeout(function() {
            if (!hostId) claimHost();
        }, 1500);
    });

    mqttClient.on('message', function(topic, message) {
        try {
            var data = JSON.parse(message.toString());
            if (data.id === myId) return;

            // Manejo de host
            if (data.hostId && (!hostId || !hostIsPresent())) {
                hostId = data.hostId;
                refreshHostStatus();
            }

            if (data.action === 'reset_all') {
                applyReset();
                return;
            }

            if (data.action === 'remove') {
                delete playersData[data.id];
                renderLeaderboard();
                // Actualizar orden de turnos si el jugador removido estaba en la lista
                if (gameStarted) {
                    turnOrder = turnOrder.filter(id => id !== data.id);
                    if (turnOrder.length === 0) {
                        gameStarted = false;
                        updateUI();
                    }
                }
                return;
            }

            if (data.action === 'claim_offer') {
                if (data.targetId === myId && !claimResolved && moveHistory.length === 0 && (data.moves || []).length > 0) {
                    claimResolved = true;
                    pendingClaim = { oldId: data.offeredId, name: data.name, score: data.score, moves: data.moves || [] };
                    showClaimModal(pendingClaim);
                }
                return;
            }

            if (!claimResolved && data.name === myName && moveHistory.length === 0 && (data.moves || []).length > 0) {
                claimResolved = true;
                pendingClaim = { oldId: data.id, name: data.name, score: data.score, moves: data.moves || [] };
                showClaimModal(pendingClaim);
                return;
            }

            // Actualizar datos del jugador
            playersData[data.id] = { 
                name: data.name, 
                score: data.score || 0,
                moves: data.moves || []
            };
            renderLeaderboard();

            // Acciones de turno
            if (data.action === 'game_start') {
                turnOrder = data.turnOrder;
                hostId = data.hostId || hostId;
                currentTurnIndex = 0;
                gameStarted = true;
                turnLocked = false;
                afterTurnBecameMine();
                updateUI();
                saveSession();
            }
            else if (data.action === 'turn_advance') {
                applyTurnAdvance(data.nextIndex);
            }

            // Sincronizacion de puntajes
            if (data.action === 'sync' || data.action === 'join') {
                // Ya se actualizó playersData
                // Si el que se une tiene partida iniciada, reenviar estado
                if (data.action === 'join' && gameStarted) {
                    // Reenviar el estado actual al recién llegado
                    broadcastGameStart();
                    broadcastTurnAdvance(currentTurnIndex);
                }
                // Buscar posible reclamo de nombre
                var cachedMatch = null;
                for (var id in playersData) {
                    if (id !== data.id && playersData[id].name === data.name && (playersData[id].moves || []).length > 0) {
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

function broadcastSync() {
    if (mqttClient && currentRoom) {
        var topic = 'quixx_app_xyz/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'sync',
            id: myId,
            name: myName,
            score: myTotalScore,
            moves: moveHistory.slice(),
            hostId: hostId
        });
        mqttClient.publish(topic, payload);
    }
}

function broadcastReset() {
    if (mqttClient && currentRoom) {
        var topic = 'quixx_app_xyz/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'reset_all',
            id: myId
        });
        mqttClient.publish(topic, payload);
    }
}

function broadcastRemove(idToRemove) {
    if (mqttClient && currentRoom) {
        var topic = 'quixx_app_xyz/room/' + currentRoom;
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
        var topic = 'quixx_app_xyz/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'claim_offer',
            targetId: targetId,
            offeredId: offeredId,
            name: cached.name,
            score: cached.score,
            moves: cached.moves || []
        });
        mqttClient.publish(topic, payload);
    }
}

function showClaimModal(claim) {
    var modal = document.getElementById('claimModal');
    var text = document.getElementById('claimText');
    if (text) {
        text.textContent = 'Ya hay un jugador "' + claim.name + '" en la sala con ' + claim.score + ' pts. ¿Eres tu (te desconectaste antes)?';
    }
    if (modal) modal.style.display = 'flex';
}

function acceptClaim() {
    if (!pendingClaim) return;
    var staleTempId = myId;

    broadcastRemove(staleTempId);

    delete playersData[staleTempId];
    myId = pendingClaim.oldId;
    moveHistory = pendingClaim.moves.slice();
    updateVisuals();
    calculateScores();
    document.getElementById('claimModal').style.display = 'none';
    pendingClaim = null;
    updateUI();
}

function declineClaim() {
    pendingClaim = null;
    document.getElementById('claimModal').style.display = 'none';
}