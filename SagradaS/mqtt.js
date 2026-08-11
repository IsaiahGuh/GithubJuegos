// ===== MQTT.JS =====
// Sistema multijugador - CON ENTRADA Y RECONEXION

let mqttClient = null;
let currentRoom = null;
let playersData = {};
let myId = null;
let myName = "Jugador";
let isRoomCreator = false;

// ============================================================
// CONECTAR A SALA
// ============================================================

function connectToRoom(code, isReconnect) {
    if (isReconnect === undefined) isReconnect = false;
    
    showLoading(isReconnect ? 'Reconectando a la sala...' : 'Conectando con la sala...');

    mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    mqttClient.on('connect', () => {
        currentRoom = code;
        const topic = `sagradas_app/room/${code}`;
        mqttClient.subscribe(topic);
        
        playersData[myId] = { 
            name: myName, 
            score: window.gameState?.myTotalScore || 0, 
            moves: [...(window.gameState?.moveHistory || [])],
            cardId: window.gameState?.currentCardId || 1,
            availableCards: window.cartillasState?.availableCards ? window.cartillasState.availableCards.map(c => c.id) : [],
            isCreator: isRoomCreator
        };
        
        joinSuccess(code);
        
        if (typeof saveSession === 'function') {
            saveSession();
        }
        
        // ---- SIEMPRE solicitar jugadores existentes, tanto en conexión como reconexión ----
        setTimeout(() => {
            solicitarJugadoresExistentes();
        }, 500);
        
        // Si no es reconexión, también asignar creador (por si somos el primero)
        if (!isReconnect) {
            setTimeout(() => {
                verificarYAsignarCreador();
            }, 800);
        }
    });

    mqttClient.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.id === myId) return;

            // ============================================================
            // 1. PRESENCIA
            // ============================================================
            if (data.action === 'presence') {
                playersData[data.id] = { 
                    name: data.name || 'Jugador',
                    score: data.score || 0,
                    moves: data.moves || [],
                    cardId: data.cardId || 1,
                    availableCards: data.availableCards || [],
                    isCreator: data.isCreator || false,
                    cardState: data.cardState || null
                };
                
                if (data.cardState) {
                    if (!window._playerCardStates) {
                        window._playerCardStates = {};
                    }
                    window._playerCardStates[data.id] = data.cardState;
                }
                
                verificarYAsignarCreador();
                
                const creatorId = encontrarCreador();
                if (creatorId && creatorId !== myId) {
                    if (data.isCreator && data.publicObjectives && data.publicObjectives.length > 0) {
                        window.gameState.publicObjectives = [...data.publicObjectives];
                        window.gameState.tools = [...data.tools] || [];
                        herramientasState.herramientas_seleccionadas = [...data.tools] || [];
                        herramientasState.herramientas_disponibles = [...data.tools] || [];
                        console.log('Objetivos recibidos del creador:', window.gameState.publicObjectives);
                        if (window.cartillasState && window.cartillasState.initialCardSelectionDone) {
                            renderGameInfo();
                        }
                        showTemporaryMessage('Objetivos y herramientas recibidos del creador');
                    }
                }
                
                renderLeaderboard();
                return;
            }
            
            // ============================================================
            // 2. SYNC_PLAYERS - Solicitud de jugadores existentes
            // ============================================================
            if (data.action === 'sync_players') {
                console.log(data.name + ' se unio, enviando lista completa de jugadores...');

                if (data.id && data.name) {
                    if (!playersData[data.id]) {
                        playersData[data.id] = {};
                    }
                    playersData[data.id].name = data.name;
                    playersData[data.id].isCreator = data.isCreator || false;
                    playersData[data.id].score = data.score || 0;
                    playersData[data.id].moves = data.moves || [];
                    playersData[data.id].cardId = data.cardId || 1;
                    playersData[data.id].availableCards = data.availableCards || [];
                    playersData[data.id].cardState = data.cardState || null;
                    renderLeaderboard();
                }

                const allPlayers = Object.keys(playersData).map(id => ({
                    id: id,
                    name: playersData[id].name || 'Jugador',
                    score: playersData[id].score || 0,
                    moves: playersData[id].moves || [],
                    cardId: playersData[id].cardId || 1,
                    availableCards: playersData[id].availableCards || [],
                    isCreator: playersData[id].isCreator || false,
                    cardState: playersData[id].cardState || null,
                    privateObjectiveId: playersData[id].privateObjectiveId || null,
                    publicDetalle: playersData[id].publicDetalle || [],
                    privateScore: playersData[id].privateScore || 0,
                    colorExtra: playersData[id].colorExtra || 0,
                    favoresPuntos: playersData[id].favoresPuntos || 0,
                    casillasVaciasPuntos: playersData[id].casillasVaciasPuntos || 0,
                    colorAsignado: playersData[id].colorAsignado || coloresState.asignaciones[id] || null,
                }));

                const topic = `sagradas_app/room/${currentRoom}`;
                const payload = {
                    action: 'player_list_response',
                    id: myId,
                    name: myName,
                    allPlayers: allPlayers,
                    targetId: data.id,
                    publicObjectives: isRoomCreator ? window.gameState.publicObjectives : [],
                    tools: isRoomCreator ? window.gameState.tools : [],
                    isCreator: isRoomCreator,
                    coloresAsignados: coloresState.asignaciones,
                    coloresUsados: coloresState.coloresUsados,
                };
                mqttClient.publish(topic, JSON.stringify(payload));
                console.log('Enviando lista de ' + allPlayers.length + ' jugadores a ' + data.name);
                return;
            }
            
            // ============================================================
            // 3. PLAYER_LIST_RESPONSE - Respuesta con lista de jugadores
            // ============================================================
            if (data.action === 'player_list_response') {
                if (data.targetId === myId) {
                    console.log('Recibiendo lista de jugadores de ' + data.name);

                    if (data.allPlayers && Array.isArray(data.allPlayers)) {
                        data.allPlayers.forEach(p => {
                            playersData[p.id] = {
                                name: p.name || 'Jugador',
                                score: p.score || 0,
                                moves: p.moves || [],
                                cardId: p.cardId || 1,
                                availableCards: p.availableCards || [],
                                isCreator: p.isCreator || false,
                                cardState: p.cardState || null,
                                privateObjectiveId: p.privateObjectiveId || null,
                                publicDetalle: p.publicDetalle || [],
                                privateScore: p.privateScore || 0,
                                colorExtra: p.colorExtra || 0,
                                favoresPuntos: p.favoresPuntos || 0,
                                casillasVaciasPuntos: p.casillasVaciasPuntos || 0,
                                colorAsignado: p.colorAsignado || null,
                            };
                            if (p.cardState) {
                                if (!window._playerCardStates) {
                                    window._playerCardStates = {};
                                }
                                window._playerCardStates[p.id] = p.cardState;
                            }
                        });

                        if (data.coloresAsignados) {
                            coloresState.asignaciones = { ...coloresState.asignaciones, ...data.coloresAsignados };
                            coloresState.coloresUsados = data.coloresUsados || [];
                            coloresState.coloresAsignados = true;
                            if (window.myId && coloresState.asignaciones[window.myId]) {
                                coloresState.miColor = coloresState.asignaciones[window.myId];
                                if (typeof renderFavoresConColor === 'function') renderFavoresConColor();
                            }
                        }

                        if (data.isCreator && data.publicObjectives && data.publicObjectives.length > 0) {
                            if (window.gameState.publicObjectives.length === 0) {
                                window.gameState.publicObjectives = [...data.publicObjectives];
                                window.gameState.tools = [...data.tools] || [];
                                herramientasState.herramientas_seleccionadas = [...data.tools] || [];
                                herramientasState.herramientas_disponibles = [...data.tools] || [];
                                if (window.cartillasState && window.cartillasState.initialCardSelectionDone) {
                                    renderGameInfo();
                                }
                                showTemporaryMessage('Objetivos y herramientas sincronizados');
                            }
                        }

                        renderLeaderboard();
                    } else {
                        // Fallback: si no hay lista, procesar un solo jugador
                        playersData[data.id] = {
                            name: data.name || 'Jugador',
                            score: data.score || 0,
                            moves: data.moves || [],
                            cardId: data.cardId || 1,
                            availableCards: data.availableCards || [],
                            isCreator: data.isCreator || false,
                            cardState: data.cardState || null,
                            privateObjectiveId: data.privateObjectiveId || null,
                            publicDetalle: data.publicDetalle || [],
                            privateScore: data.privateScore || 0,
                            colorExtra: data.colorExtra || 0,
                            favoresPuntos: data.favoresPuntos || 0,
                            casillasVaciasPuntos: data.casillasVaciasPuntos || 0,
                            colorAsignado: data.colorAsignado || null,
                        };
                        if (data.cardState) {
                            if (!window._playerCardStates) {
                                window._playerCardStates = {};
                            }
                            window._playerCardStates[data.id] = data.cardState;
                        }
                        renderLeaderboard();
                    }
                }
                return;
            }
            
            // ============================================================
            // 4. CREADOR CONFIRMADO
            // ============================================================
            if (data.action === 'creator_confirmed') {
                if (data.id !== myId && data.publicObjectives) {
                    window.gameState.publicObjectives = [...data.publicObjectives];
                    window.gameState.tools = [...data.tools] || [];
                    herramientasState.herramientas_seleccionadas = [...data.tools] || [];
                    herramientasState.herramientas_disponibles = [...data.tools] || [];
                    console.log('Objetivos confirmados por el creador:', window.gameState.publicObjectives);
                    if (window.cartillasState && window.cartillasState.initialCardSelectionDone) {
                        renderGameInfo();
                    }
                    showTemporaryMessage('Objetivos y herramientas recibidos del creador');
                }
                playersData[data.id] = { 
                    ...playersData[data.id],
                    name: data.name || playersData[data.id]?.name || 'Jugador',
                    isCreator: true
                };
                renderLeaderboard();
                return;
            }
            
            // ============================================================
            // 5. REQUEST_OBJECTIVES - Solicitar objetivos al creador
            // ============================================================
            if (data.action === 'request_objectives') {
                if (isRoomCreator && data.targetId === myId) {
                    const topic = `sagradas_app/room/${currentRoom}`;
                    const payload = {
                        action: 'creator_confirmed',
                        id: myId,
                        name: myName,
                        isCreator: true,
                        publicObjectives: window.gameState.publicObjectives || [],
                        tools: window.gameState.tools || []
                    };
                    mqttClient.publish(topic, JSON.stringify(payload));
                    console.log('Enviando objetivos al jugador:', data.id);
                }
                return;
            }
            
            // ============================================================
            // 6. CARDS_DEALT - Reparto de cartillas (con colores incluidos)
            // ============================================================
            if (data.action === 'cards_dealt' && data.allPlayerCards) {
                console.log('Recibiendo cartillas del creador');
                console.log('Mis datos:', { myId: window.myId, myName: window.myName });
                console.log('Cartillas recibidas:', Object.keys(data.allPlayerCards));
                
                window.cartillasState.allPlayerCards = data.allPlayerCards;
                window.cartillasState.allPlayerPrivateObjectives = data.allPlayerPrivateObjectives || {};
                window.cartillasState.cardsDealt = true;
                
                if (data.publicObjectives && data.publicObjectives.length > 0) {
                    window.gameState.publicObjectives = [...data.publicObjectives];
                }
                if (data.tools && data.tools.length > 0) {
                    window.gameState.tools = [...data.tools];
                    herramientasState.herramientas_seleccionadas = [...data.tools];
                    herramientasState.herramientas_disponibles = [...data.tools];
                }
                
                if (data.coloresAsignados && data.coloresAsignados !== null) {
                    coloresState.asignaciones = data.coloresAsignados;
                    coloresState.coloresUsados = data.coloresUsados || [];
                    coloresState.coloresAsignados = true;
                    
                    if (window.myId && coloresState.asignaciones[window.myId]) {
                        coloresState.miColor = coloresState.asignaciones[window.myId];
                        console.log('Color asignado desde reparto: ' + getNombreColor(coloresState.miColor));
                        const colorNombre = getNombreColor(coloresState.miColor);
                        showTemporaryMessage('Tu color asignado: ' + colorNombre, 2500);
                    }
                    
                    if (typeof renderFavoresConColor === 'function') {
                        renderFavoresConColor();
                    }
                    renderLeaderboard();
                }
                
                const myCards = data.allPlayerCards[window.myId] || [];
                window.cartillasState.availableCards = myCards.map(function(id) {
                    return getCardById(id);
                }).filter(function(c) { return c !== null; });
                
                console.log('Mis cartillas:', myCards);
                console.log('Cartillas disponibles:', window.cartillasState.availableCards);
                
                if (data.allPlayerPrivateObjectives) {
                    window.gameState.privateObjectiveId = data.allPlayerPrivateObjectives[window.myId] || null;
                    console.log('Mi objetivo privado:', window.gameState.privateObjectiveId);
                }
                
                if (window.cartillasState.availableCards.length > 0 && !window.cartillasState.initialCardSelectionDone) {
                    showTemporaryMessage('Cartillas repartidas, selecciona la tuya');
                    if (typeof showInitialCardSelector === 'function') {
                        setTimeout(function() {
                            showInitialCardSelector(window.cartillasState.availableCards);
                        }, 300);
                    }
                } else {
                    console.warn('No hay cartillas disponibles o ya fueron seleccionadas');
                    console.log('availableCards:', window.cartillasState.availableCards);
                    console.log('initialCardSelectionDone:', window.cartillasState.initialCardSelectionDone);
                }
                
                if (window.cartillasState && window.cartillasState.initialCardSelectionDone) {
                    renderGameInfo();
                }
                
                renderLeaderboard();
                return;
            }
            
            // ============================================================
            // 7. SYNC - Sincronizacion normal (CON PUNTOS DE OBJETIVOS Y CARDSTATE)
            // ============================================================
            if (data.action === 'sync' || data.action === 'game_start') {
                console.log('Recibido sync de ' + data.name + ' - Score: ' + data.score + ', Moves: ' + (data.moves?.length || 0));
                
                if (!window.playersData) {
                    window.playersData = {};
                }
                
                const previousState = window.playersData[data.id] || {};
                
                window.playersData[data.id] = { 
                    name: data.name || previousState.name || 'Jugador',
                    score: data.score !== undefined ? data.score : previousState.score || 0,
                    moves: data.moves || previousState.moves || [],
                    cardId: data.cardId || previousState.cardId || 1,
                    availableCards: data.availableCards || previousState.availableCards || [],
                    isCreator: data.isCreator !== undefined ? data.isCreator : previousState.isCreator || false,
                    privateObjectiveId: data.privateObjectiveId || previousState.privateObjectiveId || null,
                    publicDetalle: data.publicDetalle || previousState.publicDetalle || [],
                    privateScore: data.privateScore !== undefined ? data.privateScore : previousState.privateScore || 0,
                    colorExtra: data.colorExtra !== undefined ? data.colorExtra : previousState.colorExtra || 0,
                    favoresPuntos: data.favoresPuntos !== undefined ? data.favoresPuntos : previousState.favoresPuntos || 0,
                    casillasVaciasPuntos: data.casillasVaciasPuntos !== undefined ? data.casillasVaciasPuntos : previousState.casillasVaciasPuntos || 0,
                    colorAsignado: data.colorAsignado || previousState.colorAsignado || null,
                    cardState: data.cardState || previousState.cardState || null
                };
                
                if (data.cardState) {
                    if (!window._playerCardStates) {
                        window._playerCardStates = {};
                    }
                    window._playerCardStates[data.id] = data.cardState;
                    
                    if (typeof window.actualizarZoomEnTiempoReal === 'function') {
                        window.actualizarZoomEnTiempoReal(data.id);
                    }
                }
                
                if (data.coloresAsignados) {
                    coloresState.asignaciones = {
                        ...coloresState.asignaciones,
                        ...data.coloresAsignados
                    };
                    if (data.coloresUsados) {
                        coloresState.coloresUsados = data.coloresUsados;
                    }
                    coloresState.coloresAsignados = true;
                    
                    if (data.id === window.myId && data.coloresAsignados[window.myId]) {
                        coloresState.miColor = data.coloresAsignados[window.myId];
                        console.log('Mi color sincronizado: ' + getNombreColor(coloresState.miColor));
                        if (typeof renderFavoresConColor === 'function') {
                            renderFavoresConColor();
                        }
                    }
                }
                
                if (typeof window.renderLeaderboard === 'function') {
                    setTimeout(() => {
                        window.renderLeaderboard();
                        console.log('Render forzado: ' + data.name + ' = ' + data.score + 'pts');
                    }, 50);
                }
                
                if (data.isCreator && data.publicObjectives && data.publicObjectives.length > 0) {
                    if (window.gameState.publicObjectives.length === 0) {
                        window.gameState.publicObjectives = [...data.publicObjectives];
                        window.gameState.tools = [...data.tools] || [];
                        herramientasState.herramientas_seleccionadas = [...data.tools] || [];
                        herramientasState.herramientas_disponibles = [...data.tools] || [];
                        console.log('Objetivos sincronizados desde sync:', window.gameState.publicObjectives);
                        if (window.cartillasState && window.cartillasState.initialCardSelectionDone) {
                            renderGameInfo();
                        }
                    }
                }
                
                return;
            }
            
            // ============================================================
            // 8. TOOL_USED - Sincronizacion de herramientas usadas
            // ============================================================
            if (data.action === 'tool_used') {
                if (typeof window.sincronizarHerramientasDesdeMQTT === 'function') {
                    const toolData = {
                        herramientas_usadas_global: data.herramientas_usadas_global || null,
                        favores: data.favores || null,
                        herramientaId: data.herramientaId || null,
                        jugadorId: data.id || null
                    };
                    window.sincronizarHerramientasDesdeMQTT(toolData);
                }
                
                playersData[data.id] = { 
                    name: data.name || playersData[data.id]?.name || 'Jugador',
                    score: data.score || 0,
                    moves: data.moves || [],
                    cardId: data.cardId || 1,
                    availableCards: data.availableCards || [],
                    isCreator: data.isCreator || false,
                    cardState: data.cardState || null
                };
                
                if (data.cardState) {
                    if (!window._playerCardStates) {
                        window._playerCardStates = {};
                    }
                    window._playerCardStates[data.id] = data.cardState;
                }
                
                renderLeaderboard();
                return;
            }
            
            // ============================================================
            // 9. JOIN - Por compatibilidad
            // ============================================================
            if (data.action === 'join') {
                playersData[data.id] = { 
                    name: data.name || 'Jugador',
                    score: data.score || 0,
                    moves: data.moves || [],
                    cardId: data.cardId || 1,
                    availableCards: data.availableCards || [],
                    isCreator: data.isCreator || false,
                    cardState: data.cardState || null
                };
                
                if (data.cardState) {
                    if (!window._playerCardStates) {
                        window._playerCardStates = {};
                    }
                    window._playerCardStates[data.id] = data.cardState;
                }
                
                renderLeaderboard();
                broadcastScore('sync');
                return;
            }
            
            // ============================================================
            // 10. COLORS_SYNC - Sincronizacion de colores
            // ============================================================
            if (data.action === 'colors_sync') {
                if (data.id !== myId) {
                    if (typeof recibirColoresSincronizados === 'function') {
                        recibirColoresSincronizados(data);
                    }
                }
                return;
            }
            
            // ============================================================
            // 11. FULL_RESET - Reinicio completo
            // ============================================================
            if (data.action === 'full_reset') {
                if (data.id !== myId) {
                    console.log('Recibiendo reinicio completo de la partida');
                    if (typeof window.receiveFullResetFromMQTT === 'function') {
                        window.receiveFullResetFromMQTT(data);
                    }
                }
                return;
            }

            // ============================================================
            // 12. GAME_FINISHED - Finalizacion de partida
            // ============================================================
            if (data.action === 'game_finished') {
                if (data.id !== myId) {
                    console.log('Recibiendo finalizacion de partida de:', data.id);
                    
                    window.gameState.isFinished = true;
                    
                    if (!window.playersData) {
                        window.playersData = {};
                    }
                    
                    window.playersData[data.id] = {
                        ...window.playersData[data.id],
                        name: data.name || window.playersData[data.id]?.name || 'Jugador',
                        score: data.score || window.playersData[data.id]?.score || 0,
                        moves: data.moves || window.playersData[data.id]?.moves || [],
                        cardId: data.cardId || window.playersData[data.id]?.cardId || 1,
                        isCreator: data.isCreator || false,
                        publicDetalle: data.publicDetalle || [],
                        privateScore: data.privateScore || 0,
                        colorExtra: data.colorExtra || 0,
                        favoresPuntos: data.favoresPuntos || 0,
                        casillasVaciasPuntos: data.casillasVaciasPuntos || 0,
                        colorAsignado: data.coloresAsignados ? data.coloresAsignados[data.id] : null,
                        cardState: data.cardState || null
                    };
                    
                    if (data.cardState) {
                        if (!window._playerCardStates) {
                            window._playerCardStates = {};
                        }
                        window._playerCardStates[data.id] = data.cardState;
                    }
                    
                    if (data.coloresAsignados) {
                        coloresState.asignaciones = {
                            ...coloresState.asignaciones,
                            ...data.coloresAsignados
                        };
                        if (data.coloresUsados) {
                            coloresState.coloresUsados = data.coloresUsados;
                        }
                        coloresState.coloresAsignados = true;
                    }
                    
                    if (typeof window.renderLeaderboard === 'function') {
                        setTimeout(() => {
                            window.renderLeaderboard();
                            console.log('Leaderboard actualizado con datos finales de ' + data.name);
                        }, 50);
                    }
                    
                    showTemporaryMessage(data.name + ' finalizo la partida');
                    
                    const finishBtn = document.getElementById('finishGameBtn');
                    if (finishBtn) {
                        finishBtn.disabled = true;
                        finishBtn.style.opacity = '0.5';
                        finishBtn.style.cursor = 'default';
                    }
                }
                return;
            }

            
        } catch(e) { 
            console.error("Error procesando mensaje MQTT:", e); 
        }
    });
}

// ============================================================
// FUNCIONES DE SINCRONIZACION
// ============================================================

function encontrarCreador() {
    for (const pid of Object.keys(playersData)) {
        if (playersData[pid].isCreator === true) {
            return pid;
        }
    }
    return null;
}

function verificarYAsignarCreador() {
    const creatorId = encontrarCreador();
    const playerIds = Object.keys(playersData);
    const sortedIds = [...playerIds].sort();
    
    if (!creatorId) {
        if (sortedIds.length > 0 && sortedIds[0] === myId) {
            isRoomCreator = true;
            playersData[myId].isCreator = true;
            
            generarObjetivosYHerramientas();
            broadcastCreatorStatus();
            
            showTemporaryMessage('Eres el creador de la sala');
            console.log('Asignado como creador (primer jugador en la sala)');
            
            renderLeaderboard();
            if (window.cartillasState && window.cartillasState.initialCardSelectionDone) {
                renderGameInfo();
            }
        } else if (sortedIds.length > 0 && sortedIds[0] !== myId) {
            console.log('Esperando que el primer jugador se declare creador...');
        }
        return;
    }
    
    if (creatorId !== myId) {
        if (window.gameState.publicObjectives.length === 0) {
            console.log('Solicitando objetivos al creador...');
            solicitarObjetivosAlCreador(creatorId);
        }
    }
}

function solicitarJugadoresExistentes() {
    if (mqttClient && currentRoom) {
        const topic = `sagradas_app/room/${currentRoom}`;
        const payload = {
            action: 'sync_players',
            id: myId,
            name: myName,
            isCreator: isRoomCreator
        };
        mqttClient.publish(topic, JSON.stringify(payload));
        console.log('Solicitando lista de jugadores existentes...');
    }
}

function solicitarObjetivosAlCreador(creatorId) {
    if (mqttClient && currentRoom) {
        const topic = `sagradas_app/room/${currentRoom}`;
        const payload = {
            action: 'request_objectives',
            id: myId,
            targetId: creatorId
        };
        mqttClient.publish(topic, JSON.stringify(payload));
        console.log('Solicitando objetivos al creador:', creatorId);
    }
}

// ============================================================
// FUNCIONES DEL CREADOR
// ============================================================

function generarObjetivosYHerramientas() {
    const allPublics = [...OBJETIVOS_PUBLICOS];
    const shuffledPublics = allPublics.sort(() => Math.random() - 0.5);
    const publicObjectives = shuffledPublics.slice(0, 3).map(o => o.id);
    
    const tools = seleccionarHerramientasParaRonda();
    
    window.gameState.publicObjectives = publicObjectives;
    window.gameState.tools = tools;
    herramientasState.herramientas_seleccionadas = tools;
    herramientasState.herramientas_disponibles = tools;
    
    console.log('Creador: Objetivos generados:', publicObjectives);
    console.log('Creador: Herramientas generadas:', tools.map(id => getHerramientaById(id)?.nombre));
    
    if (window.cartillasState && window.cartillasState.initialCardSelectionDone) {
        renderGameInfo();
    }
}

function broadcastPresence() {
    if (mqttClient && currentRoom) {
        const topic = `sagradas_app/room/${currentRoom}`;
        const cardState = typeof window.getCardStateForSync === 'function' ? window.getCardStateForSync() : null;
        const payload = {
            action: 'presence',
            id: myId,
            name: myName,
            score: window.gameState?.myTotalScore || 0,
            moves: window.gameState?.moveHistory || [],
            cardId: window.gameState?.currentCardId || 1,
            availableCards: window.cartillasState?.availableCards ? window.cartillasState.availableCards.map(c => c.id) : [],
            isCreator: isRoomCreator,
            publicObjectives: isRoomCreator ? window.gameState.publicObjectives : [],
            tools: isRoomCreator ? window.gameState.tools : [],
            cardState: cardState
        };
        mqttClient.publish(topic, JSON.stringify(payload));
    }
}

function broadcastCreatorStatus() {
    if (mqttClient && currentRoom && isRoomCreator) {
        const topic = `sagradas_app/room/${currentRoom}`;
        const payload = {
            action: 'creator_confirmed',
            id: myId,
            name: myName,
            isCreator: true,
            publicObjectives: window.gameState.publicObjectives || [],
            tools: window.gameState.tools || []
        };
        mqttClient.publish(topic, JSON.stringify(payload));
    }
}

// ============================================================
// BROADCAST SCORE - CON PUNTOS DE OBJETIVOS Y CARDSTATE
// ============================================================

function broadcastScore(action = 'sync', extraPayload = {}) {
    if (mqttClient && currentRoom) {
        const topic = `sagradas_app/room/${currentRoom}`;
        
        let currentScore = 0;
        let publicDetalle = [];
        let privateScore = 0;
        
        if (window.playersData && window.playersData[myId]) {
            currentScore = window.playersData[myId].score || 0;
        }
        
        if (typeof window.calculateTotalScore === 'function') {
            const result = window.calculateTotalScore();
            currentScore = result.total || 0;
            
            if (result.publicDetalle) {
                publicDetalle = result.publicDetalle;
            }
            if (result.private !== undefined) {
                privateScore = result.private;
            }
        }
        
        if (currentScore === 0 && window.gameState && window.gameState.myTotalScore) {
            currentScore = window.gameState.myTotalScore;
        }
        
        const currentMoves = window.gameState?.moveHistory ? [...window.gameState.moveHistory] : [];
        
        let cardState = null;
        if (typeof window.getCardStateForSync === 'function') {
            cardState = window.getCardStateForSync();
        }
        
        const payload = {
            action: action,
            id: myId,
            name: myName,
            score: currentScore,
            moves: currentMoves,
            cardId: window.gameState?.currentCardId || 1,
            availableCards: window.cartillasState?.availableCards ? window.cartillasState.availableCards.map(c => c.id) : [],
            privateObjectiveId: window.gameState?.privateObjectiveId || null,
            publicObjectives: window.gameState?.publicObjectives || [],
            tools: window.gameState?.tools || [],
            isCreator: isRoomCreator,
            cardState: cardState,
            publicDetalle: publicDetalle,
            privateScore: privateScore,
            ...extraPayload
        };
        
        if (action === 'cards_dealt') {
            payload.allPlayerCards = window.cartillasState.allPlayerCards;
            payload.allPlayerPrivateObjectives = window.cartillasState.allPlayerPrivateObjectives;
            if (coloresState.coloresAsignados) {
                payload.coloresAsignados = coloresState.asignaciones;
                payload.coloresUsados = coloresState.coloresUsados;
            }
        }
        
        if (action === 'tool_used') {
            const syncState = window.getHerramientasSyncState ? window.getHerramientasSyncState() : null;
            if (syncState) {
                payload.herramientas_usadas_global = syncState.herramientas_usadas_global;
                payload.favores = syncState.favores;
                payload.herramientaId = extraPayload.herramientaId || null;
                payload.jugadorId = extraPayload.jugadorId || myId;
            }
        }
        
        if (action === 'full_reset') {
            payload.publicObjectives = [];
            payload.tools = [];
            payload.colores = null;
            payload.clearAll = true;
        }
        
        if (action === 'game_finished') {
            payload.isFinished = true;
        }
        
        mqttClient.publish(topic, JSON.stringify(payload));
        console.log('Enviando ' + action + ' - Score: ' + currentScore + ', CardState: ' + (cardState ? 'SI' : 'NO'));
    }
}

// ============================================================
// FUNCIONES DE SALA
// ============================================================

function joinSuccess(code) {
    hideLoading();
    document.getElementById('lobbyModal').style.display = 'none';
    
    const info = document.getElementById('roomInfoDisplay');
    if (info) {
        info.style.display = 'inline-block';
        info.textContent = 'SALA: ' + code;
    }
    
    const leaderboard = document.getElementById('leaderboardPanel');
    if (leaderboard) leaderboard.style.display = 'flex';
    
    if (typeof renderLeaderboard === 'function') renderLeaderboard();
    if (typeof renderBoard === 'function') renderBoard();
    
    if (isRoomCreator) {
        showTemporaryMessage('Eres el creador - Presiona "Vitrinas" para repartir cartillas');
    } else {
        showTemporaryMessage('Presiona "Vitrinas" para comenzar');
    }
}

function disconnectFromRoom() {
    if (mqttClient) {
        mqttClient.end();
        mqttClient = null;
    }
    currentRoom = null;
    playersData = {};
    isRoomCreator = false;
}

// ============================================================
// FUNCION DE DIAGNOSTICO
// ============================================================

function diagnosticarPuntaje() {
    console.log('===== DIAGNOSTICO DE PUNTAJE =====');
    console.log('myId:', myId);
    console.log('gameState.myTotalScore:', window.gameState?.myTotalScore);
    console.log('playersData[myId]?.score:', window.playersData?.[myId]?.score);
    console.log('calculateTotalScore():', window.calculateTotalScore ? window.calculateTotalScore().total : 'N/A');
    console.log('moveHistory length:', window.gameState?.moveHistory?.length);
    console.log('====================================');
}

// ============================================================
// EXPORTAR
// ============================================================

window.mqttClient = mqttClient;
window.currentRoom = currentRoom;
window.playersData = playersData;
window.myId = myId;
window.myName = myName;
window.isRoomCreator = isRoomCreator;
window.connectToRoom = connectToRoom;
window.broadcastScore = broadcastScore;
window.broadcastPresence = broadcastPresence;
window.broadcastCreatorStatus = broadcastCreatorStatus;
window.generarObjetivosYHerramientas = generarObjetivosYHerramientas;
window.disconnectFromRoom = disconnectFromRoom;
window.joinSuccess = joinSuccess;
window.encontrarCreador = encontrarCreador;
window.verificarYAsignarCreador = verificarYAsignarCreador;
window.solicitarObjetivosAlCreador = solicitarObjetivosAlCreador;
window.solicitarJugadoresExistentes = solicitarJugadoresExistentes;
window.diagnosticarPuntaje = diagnosticarPuntaje;

console.log('mqtt.js cargado - Con soporte para entrada y reconexion');