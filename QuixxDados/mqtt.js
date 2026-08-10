// ===== SISTEMA MULTIJUGADOR MQTT =====
let mqttClient = null;
let myId = Math.random().toString(36).substr(2, 9);
let currentRoom = null;
let playersData = {};
let myName = 'Jugador';
let claimResolved = false;
let pendingClaim = null;

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
        broadcastScore('join');
        saveSession();
    });

    mqttClient.on('message', function(topic, message) {
        try {
            var data = JSON.parse(message.toString());
            if (data.id === myId) return;

            if (data.action === 'reset_all') {
                moveHistory = [];
                updateVisuals();
                calculateScores();
                return;
            }

            if (data.action === 'remove') {
                delete playersData[data.id];
                renderLeaderboard();
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

            playersData[data.id] = { 
                name: data.name, 
                score: data.score,
                moves: data.moves || []
            };
            renderLeaderboard();

            if (data.action === 'join') {
                broadcastScore('sync');
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

function broadcastScore(action) {
    if (action === undefined) action = 'sync';
    if (mqttClient && currentRoom) {
        var topic = 'quixx_app_xyz/room/' + currentRoom;
        var payload = JSON.stringify({
            action: action,
            id: myId,
            name: myName,
            score: myTotalScore,
            moves: moveHistory.slice()
        });
        mqttClient.publish(topic, payload);
    }
}

function broadcastReset() {
    if (mqttClient && currentRoom) {
        var topic = 'quixx_app_xyz/room/' + currentRoom;
        var payload = JSON.stringify({
            action: 'reset_all',
            id: myId,
            name: myName
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
}

function declineClaim() {
    pendingClaim = null;
    document.getElementById('claimModal').style.display = 'none';
}