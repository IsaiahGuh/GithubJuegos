// ===== ESTADO DE LA SALA / CONEXION =====
let mqttClient = null;
let currentRoom = null;
let playersData = {};
let isRoomCreator = false;
let hostId = null;
function refreshHostStatus() {
    isRoomCreator = (hostId !== null && hostId === myId);
}
function hostIsPresent() {
    return hostId !== null && !!playersData[hostId];
}
function claimHost() {
    hostId = myId;
    isRoomCreator = true;
    broadcastSync();
    if (gameStarted) broadcastGameStateSync();
    updateHostWarning();
    renderPreGame(); renderTurnBanner(); renderLeaderboard();
}
function updateHostWarning() {
    const bar = document.getElementById('hostWarningBar');
    if (!bar) return;
    const shouldShow = !!currentRoom && hostId !== null && !hostIsPresent() && !isRoomCreator;
    bar.style.display = shouldShow ? 'flex' : 'none';
}

let claimResolved = false;
let pendingClaim = null;

// ===== CONEXION MQTT =====
function connectToRoom(code, isReconnect = false) {
    showLoading(isReconnect ? "Reconectando a la sala..." : "Conectando con la sala...");
    claimResolved = isReconnect;
    pendingClaim = null;
    gameLog = [];
    seenLogIds = new Set();

    mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    mqttClient.on('connect', () => {
        currentRoom = code;
        mqttClient.subscribe(`yatzy_app_xyz/room/${code}`);
        playersData[myId] = { name: myName, color: playerColors[myId] || null, scores: { ...myScores }, extraYatzys: myExtraYatzys, score: totalScore(myScores, myExtraYatzys) };
        joinSuccess(code);
        broadcastSync('join');
        persistSession();

        // Si nadie responde con un anfitrion dentro de este margen (sala vacia
        // o todos llegaron por link sin pasar por "Crear Sala"), me reclamo host.
        // El jitter evita que dos personas que entran al mismo tiempo se
        // autoreclamen host en el mismo instante.
        const claimDelay = 1400 + Math.random() * 900;
        setTimeout(() => {
            if (currentRoom === code && !hostId) claimHost();
        }, claimDelay);
    });

    mqttClient.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.id === myId) return;

            if (data.hostId && (!hostId || !hostIsPresent())) {
                hostId = data.hostId;
                refreshHostStatus();
            }

            if (data.action === 'remove') { delete playersData[data.id]; renderLeaderboard(); renderPreGame(); updateHostWarning(); return; }

            if (data.action === 'claim_offer') {
                if (data.targetId === myId && !claimResolved && Object.values(myScores).every(v => v === null) && (data.scores)) {
                    claimResolved = true;
                    pendingClaim = { oldId: data.offeredId, name: data.name, score: data.score, scores: data.scores, extraYatzys: data.extraYatzys || 0 };
                    showClaimModal(pendingClaim);
                }
                return;
            }

            if (!claimResolved && data.name === myName && Object.values(myScores).every(v => v === null) && data.scores && Object.values(data.scores).some(v => v !== null)) {
                claimResolved = true;
                pendingClaim = { oldId: data.id, name: data.name, score: data.score, scores: data.scores, extraYatzys: data.extraYatzys || 0 };
                showClaimModal(pendingClaim);
                return;
            }

            if (data.action === 'game_start') {
                turnOrder = data.turnOrder;
                playerColors = data.colors;
                Object.keys(playerColors).forEach(id => { if (playersData[id]) playersData[id].color = playerColors[id]; });
                if (playersData[myId]) playersData[myId].color = playerColors[myId];
                currentTurnIndex = 0;
                gameStarted = true;
                afterTurnBecameMine();
                renderPreGame(); renderTurnBanner(); renderDice(); renderScores(); renderLeaderboard();
                saveState();
                return;
            }

            if (data.action === 'game_state_sync') {
                if (!gameStarted) {
                    turnOrder = data.turnOrder;
                    playerColors = data.colors;
                    currentTurnIndex = data.currentTurnIndex;
                    gameStarted = true;
                    Object.keys(playerColors).forEach(id => { if (playersData[id]) playersData[id].color = playerColors[id]; });
                    if (playersData[myId]) playersData[myId].color = playerColors[myId];
                    afterTurnBecameMine();
                    renderPreGame(); renderTurnBanner(); renderDice(); renderScores(); renderLeaderboard();
                }
                return;
            }

            if (data.action === 'turn_advance') { applyTurnAdvance(data.nextIndex); return; }
            if (data.action === 'game_reset') { applyGameReset(); return; }
            if (data.action === 'log_entry') { addLogEntry(data.entry, false); return; }
            if (data.action === 'event_toast') { showEventToast(data.text); return; }

            playersData[data.id] = { name: data.name, color: data.color, scores: data.scores, extraYatzys: data.extraYatzys || 0, score: data.score };
            renderLeaderboard();
            renderPreGame();
            updateHostWarning();

            if (data.action === 'join') {
                broadcastSync();
                if (gameStarted) broadcastGameStateSync();
                const cachedMatch = Object.keys(playersData).find(id =>
                    id !== data.id && playersData[id].name === data.name && playersData[id].scores && Object.values(playersData[id].scores).some(v => v !== null)
                );
                if (cachedMatch) broadcastClaimOffer(data.id, cachedMatch);
            }
        } catch (e) { console.error("Mensaje invalido", e); }
    });

    mqttClient.on('error', () => { hideLoading(); showNotice("Error de red. Revisa tu internet.", "Sin conexion"); });
}

// ===== RECLAMO DE NOMBRE =====
function showClaimModal(claim) {
    document.getElementById('claimText').textContent = `Ya hay un jugador "${claim.name}" en la sala con ${claim.score} pts. ¿Eres tu (te desconectaste antes)?`;
    document.getElementById('claimModal').style.display = 'flex';
}
function acceptClaim() {
    if (!pendingClaim) return;
    const staleTempId = myId;
    broadcastRemove(staleTempId);
    delete playersData[staleTempId];
    myId = pendingClaim.oldId;
    myScores = { ...pendingClaim.scores };
    myExtraYatzys = pendingClaim.extraYatzys || 0;
    myBonusAnnounced = upperBonus(myScores) === 35;
    refreshHostStatus();
    saveState();
    renderScores();
    renderPreGame();
    updateHostWarning();
    document.getElementById('claimModal').style.display = 'none';
    pendingClaim = null;
}
function declineClaim() { pendingClaim = null; document.getElementById('claimModal').style.display = 'none'; }

function broadcastRemove(idToRemove) {
    if (mqttClient && currentRoom) mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({ action: 'remove', id: idToRemove }));
}
function broadcastClaimOffer(targetId, offeredId) {
    if (mqttClient && currentRoom) {
        const cached = playersData[offeredId];
        if (!cached) return;
        mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({
            action: 'claim_offer', targetId, offeredId, name: cached.name, score: cached.score, scores: cached.scores, extraYatzys: cached.extraYatzys || 0
        }));
    }
}
