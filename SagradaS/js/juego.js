// ===== JUEGO.JS =====
// Logica principal del juego - Sin gestion de cartillas

// Estado del juego
let gameState = {
    moveHistory: [],
    gameStarted: false,
    publicObjectives: [],
    tools: [],
    privateObjectiveId: null,
    selectedDifficulty: 0,
    isFinished: false
};

// ============================================================
// OBTENER ESTADO COMPLETO DE LA CARTILLA PARA SINCRONIZAR
// ============================================================

function getCardStateForSync() {
    const card = getCurrentCard();
    if (!card) return null;
    
    const cardState = {
        id: card.id,
        difficulty: card.difficulty || 3,
        rows: card.rows.map(row => 
            row.map(cell => ({
                value: cell.value,
                color: cell.color
            }))
        )
    };
    return cardState;
}

// ============================================================
// RECIBIR ESTADO DE CARTILLA DESDE OTRO JUGADOR
// ============================================================

function receiveCardStateFromMQTT(data) {
    if (!data || data.id === window.myId) return;
    if (!data.cardState) return;
    
    console.log('Recibiendo estado de cartilla de ' + (data.name || data.id));
    
    if (window.playersData && window.playersData[data.id]) {
        window.playersData[data.id].cardState = data.cardState;
        window.playersData[data.id].cardId = data.cardState.id || window.playersData[data.id].cardId;
    }
    
    if (!window._playerCardStates) {
        window._playerCardStates = {};
    }
    window._playerCardStates[data.id] = data.cardState;
}

// ============================================================
// NUEVO: FINALIZAR PARTIDA
// ============================================================

function finalizarPartida() {
    if (gameState.isFinished) {
        showTemporaryMessage('La partida ya fue finalizada');
        return;
    }
    
    if (!gameState.gameStarted || !cartillasState.initialCardSelectionDone) {
        showTemporaryMessage('No hay una partida activa para finalizar');
        return;
    }
    
    gameState.isFinished = true;
    
    calculateScores();
    
    let publicDetalle = [];
    let privateScore = 0;
    let colorExtra = 0;
    let favoresPuntos = 0;
    let casillasVaciasPuntos = 0;
    
    if (typeof window.calculateTotalScore === 'function') {
        const result = window.calculateTotalScore();
        publicDetalle = result.publicDetalle || [];
        privateScore = result.private || 0;
        colorExtra = result.colorExtra || 0;
        favoresPuntos = result.favoresPuntos || 0;
        casillasVaciasPuntos = result.casillasVaciasPuntos || 0;
    }
    
    const cardState = getCardStateForSync();
    
    renderLeaderboard();
    showTemporaryMessage('Partida finalizada! Revisa el leaderboard');
    
    if (window.broadcastScore) {
        window.broadcastScore('game_finished', { 
            isFinished: true,
            publicDetalle: publicDetalle,
            privateScore: privateScore,
            colorExtra: colorExtra,
            favoresPuntos: favoresPuntos,
            casillasVaciasPuntos: casillasVaciasPuntos,
            coloresAsignados: coloresState.asignaciones,
            coloresUsados: coloresState.coloresUsados,
            cardState: cardState
        });
    }
    
    const finishBtn = document.getElementById('finishGameBtn');
    if (finishBtn) {
        finishBtn.disabled = true;
        finishBtn.style.opacity = '0.5';
        finishBtn.style.cursor = 'default';
    }
}

// ============================================================
// RECIBIR FINALIZACION DESDE MQTT
// ============================================================

function receiveGameFinishedFromMQTT(data) {
    if (!data || data.id === window.myId) return;
    
    console.log('Recibiendo finalizacion de partida de:', data.id);
    
    gameState.isFinished = true;
    
    calculateScores();
    renderLeaderboard();
    
    showTemporaryMessage('El creador finalizo la partida');
    
    const finishBtn = document.getElementById('finishGameBtn');
    if (finishBtn) {
        finishBtn.disabled = true;
        finishBtn.style.opacity = '0.5';
        finishBtn.style.cursor = 'default';
    }
}

// ============================================================
// CALCULAR PUNTUACION (usando puntaje.js)
// ============================================================

function calculateScores() {
    const card = getCurrentCard();
    if (!card) return;
    
    const isFinished = gameState.isFinished || false;
    
    if (typeof calcularPuntuacionCompleta === 'function') {
        const result = calcularPuntuacionCompleta(
            card,
            gameState.moveHistory,
            gameState.privateObjectiveId,
            gameState.publicObjectives,
            window.myId,
            isFinished
        );
        gameState._cachedScore = result;
        gameState.myTotalScore = result.total;
    }
    
    if (window.currentRoom && window.playersData) {
        const puntaje = calculateTotalScore();
        window.playersData[window.myId] = { 
            name: window.myName, 
            score: puntaje.total,
            moves: [...gameState.moveHistory],
            cardId: cartillasState.currentCardId || 1,
            availableCards: cartillasState.availableCards.map(c => c.id),
            isCreator: window.isRoomCreator || false
        };
        if (window.renderLeaderboard) renderLeaderboard();
        
        if (window.broadcastScore) {
            window.broadcastScore('sync');
        }
    }
}

// ============================================================
// CALCULAR PUNTUACION TOTAL
// ============================================================

function calculateTotalScore() {
    const card = getCurrentCard();
    if (!card) return { public: 0, private: 0, colorExtra: 0, favoresPuntos: 0, casillasVaciasPuntos: 0, total: 0, publicDetalle: [] };
    
    const moves = gameState.moveHistory;
    const publicIds = gameState.publicObjectives || [];
    const privateId = gameState.privateObjectiveId;
    const isFinished = gameState.isFinished || false;
    
    if (typeof calcularPuntuacionCompleta === 'function') {
        return calcularPuntuacionCompleta(card, moves, privateId, publicIds, window.myId, isFinished);
    }
    
    return { public: 0, private: 0, colorExtra: 0, favoresPuntos: 0, casillasVaciasPuntos: 0, total: 0, publicDetalle: [] };
}

// ============================================================
// MANEJAR CLICK EN CELDA
// ============================================================

function handleBoxClick(row, col) {
    if (gameState.isFinished) {
        showTemporaryMessage('La partida ya finalizo');
        return;
    }
    if (typeof openMarcador === 'function') {
        openMarcador(row, col);
    }
}

// ============================================================
// USAR HERRAMIENTA
// ============================================================

function usarHerramientaUI(toolId) {
    if (gameState.isFinished) {
        showTemporaryMessage('La partida ya finalizo');
        return;
    }
    
    const info = getHerramientaInfo(toolId);
    if (!info) return;
    
    if (info.yaUsadaPorMi) {
        showTemporaryMessage('Ya usaste esta herramienta');
        return;
    }
    
    if (!info.disponible) {
        showTemporaryMessage('No tienes suficientes favores (necesitas ' + info.costo + ', tienes ' + herramientasState.favores.disponibles + ')');
        return;
    }
    
    const tool = getHerramientaById(toolId);
    if (!tool) return;
    
    const resultado = usarHerramientaConFavores(toolId, window.myId || 'local');
    
    if (resultado.success) {
        showTemporaryMessage('"' + tool.nombre + '" usada (' + resultado.costo + ' favor' + (resultado.costo > 1 ? 'es' : '') + ')');
        
        if (window.broadcastScore) {
            const syncData = {
                herramientas_usadas_global: herramientasState.herramientas_usadas_global,
                favores: {
                    total: herramientasState.favores.total,
                    gastados: herramientasState.favores.gastados,
                    disponibles: herramientasState.favores.disponibles
                },
                herramientaId: toolId,
                jugadorId: window.myId || 'local'
            };
            window.broadcastScore('tool_used', syncData);
        }
        
        renderGameInfo();
        renderBoard();
    } else {
        showTemporaryMessage(resultado.razon);
    }
}

// ============================================================
// SINCRONIZAR HERRAMIENTAS
// ============================================================

function sincronizarHerramientasDesdeMQTT(data) {
    if (!data) return;
    
    if (data.herramientas_usadas_global) {
        herramientasState.herramientas_usadas_global = data.herramientas_usadas_global;
    }
    
    if (data.favores) {
        herramientasState.favores.total = data.favores.total || herramientasState.favores.total;
        herramientasState.favores.gastados = data.favores.gastados || herramientasState.favores.gastados;
        herramientasState.favores.disponibles = data.favores.disponibles || herramientasState.favores.disponibles;
    }
    
    if (data.herramientaId && data.jugadorId && data.jugadorId !== window.myId) {
        const tool = getHerramientaById(data.herramientaId);
        const jugadorNombre = window.playersData && window.playersData[data.jugadorId] 
            ? window.playersData[data.jugadorId].name 
            : 'Alguien';
        if (tool) {
            showTemporaryMessage(jugadorNombre + ' uso "' + tool.nombre + '"');
        }
    }
    
    renderGameInfo();
    renderBoard();
}

// ============================================================
// RESET COMPLETO DE LA PARTIDA
// ============================================================

function resetFullGame() {
    window.gameState.publicObjectives = [];
    window.gameState.tools = [];
    herramientasState.herramientas_seleccionadas = [];
    herramientasState.herramientas_disponibles = [];
    herramientasState.herramientas_usadas = [];
    herramientasState.herramientas_usadas_global = {};
    herramientasState.favores = { total: 0, gastados: 0, disponibles: 0 };
    
    coloresState.asignaciones = {};
    coloresState.coloresUsados = [];
    coloresState.coloresAsignados = false;
    coloresState.miColor = null;
    
    cartillasState.allPlayerCards = {};
    cartillasState.allPlayerPrivateObjectives = {};
    cartillasState.cardsDealt = false;
    cartillasState.availableCards = [];
    cartillasState.currentCardId = null;
    cartillasState.selectedCardId = null;
    cartillasState.initialCardSelectionDone = false;
    cartillasState.cardSelectionInProgress = false;
    cartillasState.currentCardId = null;
    
    window.gameState.currentCardId = null;
    window.gameState.gameStarted = false;
    window.gameState.moveHistory = [];
    window.gameState.selectedDifficulty = 0;
    window.gameState.privateObjectiveId = null;
    window.gameState.isFinished = false;
    
    if (window.playersData) {
        Object.keys(window.playersData).forEach(id => {
            window.playersData[id].moves = [];
            window.playersData[id].score = 0;
            window.playersData[id].cardId = null;
            window.playersData[id].availableCards = [];
        });
    }
    
    if (typeof clearUndoHistory === 'function') clearUndoHistory();
    if (window._savedCellStates) window._savedCellStates = {};
    
    const card = getCurrentCard();
    if (card) {
        const originalCard = getCardById(cartillasState.currentCardId || window.gameState.currentCardId);
        if (originalCard) {
            card.rows.forEach((row, r) => {
                row.forEach((cell, c) => {
                    const originalCell = originalCard.rows[r][c];
                    cell.color = originalCell.color;
                    cell.value = originalCell.value;
                });
            });
        }
    }
    
    const gameInfo = document.getElementById('gameInfo');
    if (gameInfo) gameInfo.style.display = 'none';
    
    renderBoard();
    renderLeaderboard();
    
    const finishBtn = document.getElementById('finishGameBtn');
    if (finishBtn) {
        finishBtn.disabled = false;
        finishBtn.style.opacity = '1';
        finishBtn.style.cursor = 'pointer';
    }
    
    if (window.broadcastScore) {
        window.broadcastScore('full_reset', { clearAll: true });
    }
    
    const startBtn = document.getElementById('startGameBtn');
    if (startBtn) {
        startBtn.textContent = 'Vitrinas';
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
        startBtn.disabled = false;
    }
}

// ============================================================
// RECIBIR RESET COMPLETO DESDE MQTT
// ============================================================

function receiveFullResetFromMQTT(data) {
    if (!data || data.id === window.myId) return;
    
    console.log('Recibiendo reinicio completo de la partida');
    
    window.gameState.publicObjectives = [];
    window.gameState.tools = [];
    herramientasState.herramientas_seleccionadas = [];
    herramientasState.herramientas_disponibles = [];
    herramientasState.herramientas_usadas = [];
    herramientasState.herramientas_usadas_global = {};
    herramientasState.favores = { total: 0, gastados: 0, disponibles: 0 };
    
    coloresState.asignaciones = {};
    coloresState.coloresUsados = [];
    coloresState.coloresAsignados = false;
    coloresState.miColor = null;
    
    cartillasState.allPlayerCards = {};
    cartillasState.allPlayerPrivateObjectives = {};
    cartillasState.cardsDealt = false;
    cartillasState.availableCards = [];
    cartillasState.currentCardId = null;
    cartillasState.selectedCardId = null;
    cartillasState.initialCardSelectionDone = false;
    cartillasState.cardSelectionInProgress = false;
    cartillasState.currentCardId = null;
    
    window.gameState.currentCardId = null;
    window.gameState.gameStarted = false;
    window.gameState.moveHistory = [];
    window.gameState.selectedDifficulty = 0;
    window.gameState.privateObjectiveId = null;
    window.gameState.isFinished = false;
    
    if (window.playersData) {
        Object.keys(window.playersData).forEach(id => {
            if (id !== data.id) {
                window.playersData[id].moves = [];
                window.playersData[id].score = 0;
                window.playersData[id].cardId = null;
                window.playersData[id].availableCards = [];
            }
        });
    }
    
    if (typeof clearUndoHistory === 'function') clearUndoHistory();
    if (window._savedCellStates) window._savedCellStates = {};
    
    const card = getCurrentCard();
    if (card) {
        const originalCard = getCardById(cartillasState.currentCardId || window.gameState.currentCardId);
        if (originalCard) {
            card.rows.forEach((row, r) => {
                row.forEach((cell, c) => {
                    const originalCell = originalCard.rows[r][c];
                    cell.color = originalCell.color;
                    cell.value = originalCell.value;
                });
            });
        }
    }
    
    const gameInfo = document.getElementById('gameInfo');
    if (gameInfo) gameInfo.style.display = 'none';
    
    renderBoard();
    renderLeaderboard();
    
    const startBtn = document.getElementById('startGameBtn');
    if (startBtn) {
        startBtn.textContent = 'Vitrinas';
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
        startBtn.disabled = false;
    }
    
    const finishBtn = document.getElementById('finishGameBtn');
    if (finishBtn) {
        finishBtn.disabled = false;
        finishBtn.style.opacity = '1';
        finishBtn.style.cursor = 'pointer';
    }
}

// ============================================================
// EXPORTAR
// ============================================================

window.gameState = gameState;
window.handleBoxClick = handleBoxClick;
window.calculateScores = calculateScores;
window.calculateTotalScore = calculateTotalScore;
window.usarHerramientaUI = usarHerramientaUI;
window.sincronizarHerramientasDesdeMQTT = sincronizarHerramientasDesdeMQTT;
window.resetFullGame = resetFullGame;
window.receiveFullResetFromMQTT = receiveFullResetFromMQTT;
window.finalizarPartida = finalizarPartida;
window.receiveGameFinishedFromMQTT = receiveGameFinishedFromMQTT;
window.getCardStateForSync = getCardStateForSync;
window.receiveCardStateFromMQTT = receiveCardStateFromMQTT;