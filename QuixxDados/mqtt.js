// ===== SISTEMA MULTIJUGADOR MQTT =====
var mqttClient = null;
var myId = Math.random().toString(36).substr(2, 9);
var currentRoom = null;
var playersData = {};
var myName = 'Jugador';
var claimResolved = false;
var pendingClaim = null;

// ===== OCULTAR JUGADORES RECIEN LLEGADOS HASTA CONFIRMAR QUE NO SON UN RECLAMO =====
// Cuando alguien se une con un nombre que ya existe en la sala (tipicamente porque se
// desconecto y volvio a entrar sin usar "Reconectar"), no lo mostramos de inmediato:
// esperamos a que se resuelva el reclamo. Si nadie lo reclama en un margen breve, se
// revela igual como jugador nuevo.
var hiddenJoiningIds = {};
var confirmedDuplicateIds = {};
var joinGraceTimers = {};

function hideJoiningId(id) { hiddenJoiningIds[id] = true; }
function scheduleRevealIfNoClaim(id) {
    clearTimeout(joinGraceTimers[id]);
    joinGraceTimers[id] = setTimeout(function() {
        delete joinGraceTimers[id];
        if (!hiddenJoiningIds[id]) return;
        if (id === myId && pendingClaim) return;
        if (confirmedDuplicateIds[id]) return;
        revealJoiningId(id);
    }, 1800);
}
function revealJoiningId(id) {
    delete hiddenJoiningIds[id];
    delete confirmedDuplicateIds[id];
    clearTimeout(joinGraceTimers[id]);
    delete joinGraceTimers[id];
    if (id !== myId) sfxJoin();
    updatePendingOrder();
    renderLeaderboard();
}
function forgetJoiningId(id) {
    delete hiddenJoiningIds[id];
    delete confirmedDuplicateIds[id];
    clearTimeout(joinGraceTimers[id]);
    delete joinGraceTimers[id];
}

// ===== PUBLICAR EN LA SALA =====
function publishRoom(payload) {
    if (!mqttClient || !currentRoom) return;
    mqttClient.publish('quixx_app_xyz/room/' + currentRoom, JSON.stringify(payload));
}

// ===== CONEXION MQTT =====
function connectToRoom(code, isReconnect) {
    if (isReconnect === undefined) isReconnect = false;

    showLoading(isReconnect ? 'Reconectando a la sala...' : 'Conectando con la sala...');
    claimResolved = isReconnect;
    pendingClaim = null;
    activityLog = [];
    seenLogIds = {};

    var hasConnectedOnce = false;

    mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', {
        // Testamento MQTT: si la conexion se corta de forma abrupta, el broker publica
        // esto por nosotros. Es la unica fuente real de deteccion de desconexion.
        will: {
            topic: 'quixx_app_xyz/room/' + code,
            payload: JSON.stringify({ action: 'presence_lost', id: myId }),
            qos: 0,
            retain: false
        }
    });

    mqttClient.on('connect', function() {
        currentRoom = code;
        mqttClient.subscribe('quixx_app_xyz/room/' + code);

        var isSilentReconnect = hasConnectedOnce;
        hasConnectedOnce = true;

        playersData[myId] = {
            name: myName,
            color: playerColors[myId] || null,
            score: myTotalScore,
            moves: moveHistory.slice()
        };

        if (!isReconnect && !isSilentReconnect) {
            hideJoiningId(myId);
            scheduleRevealIfNoClaim(myId);
        }

        updatePendingOrder();
        if (isSilentReconnect) {
            // El cliente MQTT se reconecto solo (p.ej. un corte de red breve) despues de
            // que ya habiamos entrado a la sala con normalidad. Solo hace falta
            // resincronizar: NO se debe repetir el sonido/animacion de "entraste a la
            // sala" ni el temporizador de reclamo de anfitrion, o se duplican sin que el
            // jugador haya hecho nada nuevo.
            hideLoading();
        } else {
            joinSuccess(code);
            // Si nadie responde con un anfitrion dentro de este margen, me reclamo host.
            var claimDelay = 1400 + Math.random() * 900;
            setTimeout(function() {
                if (currentRoom === code && !hostId) claimHost();
            }, claimDelay);
        }
        broadcastSync('join');
        saveSession();
    });

    mqttClient.on('message', function(topic, message) {
        try {
            var data = JSON.parse(message.toString());

            // Cualquier mensaje de otro jugador lo marca como presente de nuevo
            // (excepto presence_lost, que dice lo contrario).
            if (data.id && data.id !== myId && data.action !== 'presence_lost' && playersData[data.id] && playersData[data.id].offline) {
                playersData[data.id].offline = false;
                renderLeaderboard();
            }

            if (data.action === 'presence_lost') {
                if (data.id !== myId && playersData[data.id]) {
                    playersData[data.id].offline = true;
                    renderLeaderboard();
                }
                return;
            }

            // En 'remove' e 'ingame_remove' el "id" es el jugador removido, no el emisor.
            if (data.action === 'remove') {
                if (data.id === myId) {
                    handleRemovedFromRoom();
                } else {
                    delete playersData[data.id];
                    pendingOrder = pendingOrder.filter(function(id) { return id !== data.id; });
                    delete playerColors[data.id];
                    forgetJoiningId(data.id);
                    updatePendingOrder();
                    renderLeaderboard();
                    if (gameStarted) {
                        turnOrder = turnOrder.filter(function(id) { return id !== data.id; });
                        if (turnOrder.length === 0) { gameStarted = false; updateUI(); }
                    }
                    if (isRoomCreator && !gameStarted) hostSyncPregameOrder();
                }
                return;
            }

            if (data.action === 'ingame_remove') {
                if (data.id === myId) {
                    handleRemovedFromRoom();
                } else {
                    applyIngameRemoval(data.id, data.turnOrder, data.nextIndex);
                }
                return;
            }

            if (data.id === myId) return;

            if (data.hostId && (!hostId || !hostIsPresent())) {
                hostId = data.hostId;
                refreshHostStatus();
            } else if (data.hostId && data.hostId !== hostId && isRoomCreator && hostIsPresent()) {
                // Alguien (p.ej. un anfitrion previo que se reconecto) todavia cree que el
                // anfitrion es otro. Como el anfitrion real y presente soy yo, reafirmo el
                // estado actual para que se corrija en todos los clientes.
                if (gameStarted) broadcastGameStateSync(); else hostSyncPregameOrder();
            }

            if (data.action === 'order_update') {
                if (!gameStarted) {
                    if (Array.isArray(data.order)) pendingOrder = data.order.slice();
                    if (data.colors) {
                        playerColors = data.colors;
                        for (var pid in playerColors) {
                            if (playersData[pid]) playersData[pid].color = playerColors[pid];
                        }
                    }
                    if (data.hostId) { hostId = data.hostId; refreshHostStatus(); }
                    renderLeaderboard();
                }
                return;
            }

            if (data.action === 'log_entry' && data.entry) {
                addLogEntry(data.entry, false);
                return;
            }

            if (data.action === 'event_toast') {
                showEventToast(data.text);
                return;
            }

            if (data.action === 'turn_marked') {
                // El jugador en turno acaba de marcar: se abre (o cierra) la ventana de robo
                // para todos los demas. Cada quien controla localmente si ya uso su robo.
                stealWindowOpen = !!data.open;
                hasStolenThisTurn = false;
                if (stealWindowOpen && !isMyTurn()) sfxSteal();
                updateUI();
                return;
            }

            if (data.action === 'reset_all') {
                applyReset();
                return;
            }

            if (data.action === 'claim_offer') {
                // Se confirma que el que se acaba de unir es (probablemente) alguien que ya
                // estaba en la sala: se mantiene oculto en todas las pantallas hasta que se
                // resuelva el reclamo (aceptar lo elimina sin haberse mostrado nunca;
                // rechazar lo revela como jugador nuevo). A diferencia de un simple margen
                // de seguridad con timeout, aqui queda bloqueado de forma permanente hasta
                // una resolucion explicita, igual que en Yatzy.
                if (data.targetId) {
                    confirmedDuplicateIds[data.targetId] = true;
                    hideJoiningId(data.targetId);
                    clearTimeout(joinGraceTimers[data.targetId]);
                    renderLeaderboard();
                }
                if (data.targetId === myId && !claimResolved && moveHistory.length === 0) {
                    claimResolved = true;
                    pendingClaim = { oldId: data.offeredId, name: data.name, score: data.score, moves: data.moves || [], color: data.color || null };
                    showClaimModal(pendingClaim);
                }
                return;
            }

            if (data.action === 'claim_declined') {
                // El jugador confirmo que es alguien distinto: ahora si se muestra como
                // un jugador nuevo normal en el leaderboard de todos.
                revealJoiningId(data.id);
                return;
            }

            if (!claimResolved && data.name === myName && moveHistory.length === 0 && data.moves && data.moves.length > 0) {
                claimResolved = true;
                confirmedDuplicateIds[myId] = true;
                hideJoiningId(myId);
                clearTimeout(joinGraceTimers[myId]);
                pendingClaim = { oldId: data.id, name: data.name, score: data.score, moves: data.moves || [], color: data.color || null };
                showClaimModal(pendingClaim);
                return;
            }

            // Actualizar datos del jugador — SOLO para mensajes que realmente traen esos
            // datos (sync/join). Los mensajes de turno (game_start, game_state_sync,
            // turn_advance) no llevan name/score/moves, y si se procesaran aqui
            // sobrescribirian al jugador que los envio con datos vacios/undefined en
            // las pantallas de los demas.
            if (data.action === 'sync' || data.action === 'join') {
                var isNewJoin = data.action === 'join' && !playersData[data.id];
                playersData[data.id] = {
                    name: data.name,
                    color: data.color || null,
                    score: data.score || 0,
                    moves: data.moves || []
                };

                if (isNewJoin) {
                    hideJoiningId(data.id);
                    scheduleRevealIfNoClaim(data.id);
                }

                updatePendingOrder();
                renderLeaderboard();
                updateVisuals(); // por si el candado de algun color se acaba de bloquear/liberar
                checkGameEnd();
            }

            // Acciones de turno
            if (data.action === 'game_start') {
                turnOrder = data.turnOrder;
                if (data.colors) {
                    playerColors = data.colors;
                    for (var id2 in playerColors) {
                        if (playersData[id2]) playersData[id2].color = playerColors[id2];
                    }
                }
                if (data.hostId) hostId = data.hostId;
                refreshHostStatus(); // mantiene isRoomCreator sincronizado con el hostId real
                currentTurnIndex = 0;
                gameStarted = true;
                turnLocked = false;
                startRoundSnapshot();
                afterTurnBecameMine();
                renderLeaderboard();
                updateUI();
                saveSession();
            }
            else if (data.action === 'game_state_sync') {
                // Se aplica siempre (no solo si !gameStarted): esto es lo que nos pone al
                // dia tras reconectar, ya que la sesion guardada localmente puede traer
                // gameStarted=true con un turnOrder/turno desactualizado.
                turnOrder = data.turnOrder;
                if (data.colors) {
                    playerColors = data.colors;
                    for (var id2b in playerColors) {
                        if (playersData[id2b]) playersData[id2b].color = playerColors[id2b];
                    }
                }
                currentTurnIndex = data.currentTurnIndex;
                if (data.hostId) hostId = data.hostId;
                refreshHostStatus(); // mantiene isRoomCreator sincronizado con el hostId real
                gameStarted = true;
                startRoundSnapshot();
                afterTurnBecameMine();
                renderLeaderboard();
                updateUI();
                saveSession();
            }
            else if (data.action === 'turn_advance') {
                applyTurnAdvance(data.nextIndex);
            }

            // Sincronizacion de puntajes / deteccion de reconexion con el mismo nombre
            if (data.action === 'sync' || data.action === 'join') {
                if (data.action === 'join') {
                    if (gameStarted) {
                        broadcastGameStateSync();
                    }
                    // Cada jugador ya presente en la sala reenvia sus propios datos
                    // (nombre, puntaje, tablero, color) para que el recien llegado los
                    // reciba. El orden/colores de la sala de espera los sincroniza el
                    // anfitrion aparte, pero los datos de CADA jugador solo los tiene el
                    // propio jugador.
                    broadcastSync();
                }
                var cachedMatch = null;
                for (var id3 in playersData) {
                    if (id3 !== data.id && playersData[id3].name === data.name) {
                        cachedMatch = id3;
                        break;
                    }
                }
                if (cachedMatch) {
                    broadcastClaimOffer(data.id, cachedMatch);
                }
                if (data.action === 'join' && isRoomCreator && !gameStarted) hostSyncPregameOrder();
            }
        } catch(e) {
            console.error('Mensaje invalido', e);
        }
    });

    mqttClient.on('error', function(err) {
        hideLoading();
        showNotice('Error de red. Revisa tu internet.', 'Sin conexion');
    });
}

function broadcastRemove(idToRemove) {
    publishRoom({ action: 'remove', id: idToRemove });
}

function broadcastClaimOffer(targetId, offeredId) {
    var cached = playersData[offeredId];
    if (!cached) return;
    publishRoom({
        action: 'claim_offer',
        targetId: targetId,
        offeredId: offeredId,
        name: cached.name,
        score: cached.score,
        moves: cached.moves || [],
        color: cached.color || null
    });
}

function showClaimModal(claim) {
    var modal = document.getElementById('claimModal');
    var text = document.getElementById('claimText');
    if (text) {
        text.textContent = 'Ya hay un jugador "' + claim.name + '" en la sala con ' + claim.score + ' pts. ¿Eres tu (te desconectaste antes)?';
    }
    if (modal) modal.style.display = 'flex';
    sfxNotice();
}

function acceptClaim() {
    if (!pendingClaim) return;
    var staleTempId = myId;

    broadcastRemove(staleTempId);

    delete playersData[staleTempId];
    pendingOrder = pendingOrder.filter(function(id) { return id !== staleTempId; });
    delete playerColors[staleTempId];
    forgetJoiningId(staleTempId);

    myId = pendingClaim.oldId;
    moveHistory = pendingClaim.moves.slice();
    if (pendingClaim.color) playerColors[myId] = pendingClaim.color;
    refreshHostStatus();
    updateVisuals();
    calculateScores();
    updatePendingOrder();
    if (isRoomCreator && !gameStarted) hostSyncPregameOrder();
    if (gameStarted) afterTurnBecameMine();
    renderLeaderboard();
    document.getElementById('claimModal').style.display = 'none';
    pendingClaim = null;
    updateUI();
}

function declineClaim() {
    pendingClaim = null;
    document.getElementById('claimModal').style.display = 'none';
    // Confirmamos que somos un jugador distinto: nos revelamos ya mismo y avisamos a los
    // demas para que tambien nos revelen sin esperar el margen de seguridad.
    revealJoiningId(myId);
    publishRoom({ action: 'claim_declined', id: myId });
}

// ===== SER REMOVIDO DE LA SALA (el anfitrion nos saco) =====
function handleRemovedFromRoom() {
    hideLoading();
    cancelEndTurnReminder();

    ['viewPlayerModal', 'confirmModal', 'removePlayerModal', 'gameOverModal', 'claimModal', 'endTurnReminderModal'].forEach(function(id) {
        var modal = document.getElementById(id);
        if (modal) modal.style.display = 'none';
    });
    var logPanel = document.getElementById('logPanel');
    if (logPanel) logPanel.style.display = 'none';

    if (mqttClient) { try { mqttClient.end(true); } catch (e) {} mqttClient = null; }
    currentRoom = null;
    playersData = {};
    pendingOrder = [];
    turnOrder = [];
    Object.keys(joinGraceTimers).forEach(function(id) { clearTimeout(joinGraceTimers[id]); });
    joinGraceTimers = {};
    hiddenJoiningIds = {};
    confirmedDuplicateIds = {};
    gameStarted = false;
    gameEnded = false;
    isRoomCreator = false;
    hostId = null;
    stealWindowOpen = false;
    hasStolenThisTurn = false;
    clearPendingEvents();

    var info = document.getElementById('roomInfoDisplay');
    if (info) info.style.display = 'none';
    var leaderboardPanel = document.getElementById('leaderboardPanel');
    if (leaderboardPanel) leaderboardPanel.style.display = 'none';

    clearSession();
    var banner = document.getElementById('sessionBanner');
    if (banner) banner.style.display = 'none';
    var reconnectBtn = document.getElementById('reconnectBtn');
    if (reconnectBtn) {
        reconnectBtn.disabled = true;
        reconnectBtn.style.opacity = '0.5';
        reconnectBtn.style.cursor = 'not-allowed';
    }

    var lobby = document.getElementById('lobbyModal');
    if (lobby) lobby.style.display = 'flex';
    showNotice('El anfitrion te saco de la sala. Debes volver a entrar para unirte de nuevo.', 'Fuera de la partida');
}