// ===== JUEGO.JS =====
// Lógica principal del juego - Con función finalizar

// Estado del juego
let gameState = {
    currentCardId: null,
    moveHistory: [],
    gameStarted: false,
    publicObjectives: [],
    tools: [],
    privateObjectiveId: null,
    availableCards: [],
    selectedCardId: null,
    initialCardSelectionDone: false,
    cardsDealt: false,
    allPlayerCards: {},
    allPlayerPrivateObjectives: {},
    cardSelectionInProgress: false,
    selectedDifficulty: 0,
    isFinished: false // NUEVO: indica si la partida ha finalizado
};

// Obtener cartilla actual
function getCurrentCard() {
    return getCardById(gameState.currentCardId) || getCardById(1);
}

// Manejar click en celda
function handleBoxClick(row, col) {
    if (gameState.isFinished) {
        showTemporaryMessage('⛔ La partida ya finalizó');
        return;
    }
    if (typeof openMarcador === 'function') {
        openMarcador(row, col);
    }
}

// ============================================================
// OBTENER ESTADO COMPLETO DE LA CARTILLA PARA SINCRONIZAR
// ============================================================

function getCardStateForSync() {
    const card = getCurrentCard();
    if (!card) return null;
    
    // Crear una copia del estado de la cartilla con los valores actuales
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
    
    console.log(`📥 Recibiendo estado de cartilla de ${data.name || data.id}`);
    
    // Guardar el estado de la cartilla del jugador
    if (window.playersData && window.playersData[data.id]) {
        window.playersData[data.id].cardState = data.cardState;
        window.playersData[data.id].cardId = data.cardState.id || window.playersData[data.id].cardId;
    }
    
    // También guardar en un mapa separado para acceso rápido
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
        showTemporaryMessage('⛔ La partida ya fue finalizada');
        return;
    }
    
    if (!gameState.gameStarted || !gameState.initialCardSelectionDone) {
        showTemporaryMessage('⛔ No hay una partida activa para finalizar');
        return;
    }
    
    // Marcar como finalizada
    gameState.isFinished = true;
    
    // Recalcular puntajes con los nuevos criterios (favores y casillas vacías)
    calculateScores();
    
    // ✅ OBTENER DETALLES COMPLETOS PARA ENVIAR
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
    
    // ✅ OBTENER EL ESTADO COMPLETO DE LA CARTILLA
    const cardState = getCardStateForSync();
    
    // Renderizar leaderboard con los nuevos tags
    renderLeaderboard();
    
    // Mostrar mensaje de confirmación
    showTemporaryMessage('🏁 ¡Partida finalizada! Revisa el leaderboard');
    
    // ✅ Sincronizar con otros jugadores - ENVIAR TODOS LOS DETALLES
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
    
    // Deshabilitar el botón de Terminar
    const finishBtn = document.getElementById('finishGameBtn');
    if (finishBtn) {
        finishBtn.disabled = true;
        finishBtn.style.opacity = '0.5';
        finishBtn.style.cursor = 'default';
    }
}

// ============================================================
// RECIBIR FINALIZACIÓN DESDE MQTT
// ============================================================

function receiveGameFinishedFromMQTT(data) {
    if (!data || data.id === window.myId) return;
    
    console.log('🏁 Recibiendo finalización de partida de:', data.id);
    
    gameState.isFinished = true;
    
    // Recalcular puntajes
    calculateScores();
    renderLeaderboard();
    
    showTemporaryMessage('🏁 El creador finalizó la partida');
    
    // Deshabilitar el botón de Terminar
    const finishBtn = document.getElementById('finishGameBtn');
    if (finishBtn) {
        finishBtn.disabled = true;
        finishBtn.style.opacity = '0.5';
        finishBtn.style.cursor = 'default';
    }
}

// ============================================================
// CALCULAR PUNTUACIÓN (usando puntaje.js)
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
        // ✅ ACTUALIZAR myTotalScore
        gameState.myTotalScore = result.total;
    }
    
    if (window.currentRoom && window.playersData) {
        const puntaje = calculateTotalScore();
        window.playersData[window.myId] = { 
            name: window.myName, 
            score: puntaje.total,
            moves: [...gameState.moveHistory],
            cardId: gameState.currentCardId || 1,
            availableCards: gameState.availableCards.map(c => c.id),
            isCreator: window.isRoomCreator || false
        };
        if (window.renderLeaderboard) renderLeaderboard();
        
        // ✅ FORZAR BROADCAST DEL PUNTAJE ACTUALIZADO
        if (window.broadcastScore) {
            window.broadcastScore('sync');
        }
    }
}

// ============================================================
// CALCULAR PUNTUACIÓN TOTAL
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
// REPARTIR CARTILLAS
// ============================================================

function repartirCartillasUnicas() {
    // Si la partida está finalizada, no se puede repartir
    if (gameState.isFinished) {
        showTemporaryMessage('⛔ La partida ya finalizó');
        return;
    }
    
    if (gameState.cardsDealt) {
        showTemporaryMessage('Las cartillas ya fueron repartidas');
        if (gameState.availableCards.length > 0) {
            showInitialCardSelector(gameState.availableCards);
        }
        return;
    }
    
    if (window.isRoomCreator) {
        if (typeof asignarColoresAJugadores === 'function') {
            const coloresAsignados = asignarColoresAJugadores();
            if (typeof sincronizarColores === 'function') {
                sincronizarColores();
            }
            console.log('🎨 Colores asignados por el creador:', coloresState.asignaciones);
        }
    }
    
    const playerIds = Object.keys(window.playersData || {});
    if (playerIds.length === 0) {
        showTemporaryMessage('No hay jugadores en la sala');
        return;
    }
    
    const isCreator = window.isRoomCreator || false;
    
    const allCards = [...CARTILLAS];
    const shuffledCards = allCards.sort(() => Math.random() - 0.5);
    const cardsPerPlayer = 4;
    const totalNeeded = playerIds.length * cardsPerPlayer;
    
    if (totalNeeded > shuffledCards.length) {
        showTemporaryMessage('No hay suficientes cartillas para todos los jugadores');
        return;
    }
    
    let cardIndex = 0;
    const playerCards = {};
    playerIds.forEach(playerId => {
        const cards = [];
        for (let i = 0; i < cardsPerPlayer; i++) {
            cards.push(shuffledCards[cardIndex].id);
            cardIndex++;
        }
        playerCards[playerId] = cards;
    });
    
    const allPrivates = [...OBJETIVOS_PRIVADOS];
    const shuffledPrivates = allPrivates.sort(() => Math.random() - 0.5);
    
    if (shuffledPrivates.length < playerIds.length) {
        showTemporaryMessage('No hay suficientes objetivos privados para todos');
        return;
    }
    
    const playerPrivateObjectives = {};
    playerIds.forEach((playerId, index) => {
        playerPrivateObjectives[playerId] = shuffledPrivates[index].id;
    });
    
    if (isCreator) {
        if (gameState.publicObjectives.length === 0) {
            generarObjetivosYHerramientas();
        }
        if (gameState.tools.length === 0) {
            const tools = seleccionarHerramientasParaRonda();
            gameState.tools = tools;
            herramientasState.herramientas_seleccionadas = tools;
            herramientasState.herramientas_disponibles = tools;
        }
    } else {
        if (gameState.publicObjectives.length === 0) {
            showTemporaryMessage('⏳ Esperando objetivos del creador...');
            
            let attempts = 0;
            const maxAttempts = 30;
            
            function esperarObjetivos() {
                attempts++;
                if (gameState.publicObjectives.length > 0) {
                    continuarReparto(isCreator, playerIds, playerCards, playerPrivateObjectives);
                    return;
                }
                if (attempts >= maxAttempts) {
                    console.warn('⚠️ Timeout esperando objetivos - Generando locales');
                    const allPublics = [...OBJETIVOS_PUBLICOS];
                    const shuffledPublics = allPublics.sort(() => Math.random() - 0.5);
                    gameState.publicObjectives = shuffledPublics.slice(0, 3).map(o => o.id);
                    const tools = seleccionarHerramientasParaRonda();
                    gameState.tools = tools;
                    herramientasState.herramientas_seleccionadas = tools;
                    herramientasState.herramientas_disponibles = tools;
                    showTemporaryMessage('⚠️ Usando objetivos locales (fallback)');
                    continuarReparto(isCreator, playerIds, playerCards, playerPrivateObjectives);
                    return;
                }
                setTimeout(esperarObjetivos, 100);
            }
            setTimeout(esperarObjetivos, 100);
            return;
        }
        continuarReparto(isCreator, playerIds, playerCards, playerPrivateObjectives);
    }
}

function continuarReparto(isCreator, playerIds, playerCards, playerPrivateObjectives) {
    gameState.allPlayerCards = playerCards;
    gameState.allPlayerPrivateObjectives = playerPrivateObjectives;
    gameState.cardsDealt = true;
    
    const myCards = playerCards[window.myId] || [];
    gameState.availableCards = myCards.map(id => getCardById(id)).filter(c => c !== null);
    gameState.privateObjectiveId = playerPrivateObjectives[window.myId] || null;
    
    if (gameState.availableCards.length > 0) {
        showInitialCardSelector(gameState.availableCards);
    }
    
    if (isCreator) {
        if (typeof sincronizarColores === 'function' && coloresState.coloresAsignados) {
            sincronizarColores();
        }
    }
    
    if (window.broadcastScore) {
        const payload = {
            allPlayerCards: playerCards,
            allPlayerPrivateObjectives: playerPrivateObjectives,
            publicObjectives: gameState.publicObjectives,
            tools: gameState.tools,
            isCreator: isCreator,
            coloresAsignados: coloresState.coloresAsignados ? coloresState.asignaciones : null,
            coloresUsados: coloresState.coloresAsignados ? coloresState.coloresUsados : null
        };
        window.broadcastScore('cards_dealt', payload);
    }
    
    if (isCreator && gameState.initialCardSelectionDone) {
        renderGameInfo();
    }
    
    const msg = isCreator ? 
        '📋 Cartillas repartidas - Eres el creador' :
        '📋 Cartillas repartidas - Selecciona tu cartilla';
    showTemporaryMessage(msg);
}

function iniciarJuego() {
    if (gameState.isFinished) {
        showTemporaryMessage('⛔ La partida ya finalizó');
        return;
    }
    
    if (gameState.gameStarted && gameState.initialCardSelectionDone) {
        showTemporaryMessage('La partida ya está en curso');
        return;
    }
    
    if (gameState.cardsDealt && gameState.availableCards.length > 0) {
        showInitialCardSelector(gameState.availableCards);
        return;
    }
    
    repartirCartillasUnicas();
}

// ============================================================
// SELECCIONAR CARTILLA
// ============================================================

function showInitialCardSelector(cards) {
    const grid = document.getElementById('cardSelectorGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const coloresMap = {
        'red': '#e53935',
        'yellow': '#fdd835',
        'green': '#43a047',
        'blue': '#1e88e5',
        'purple': '#8e24aa'
    };
    
    cards.forEach(card => {
        const item = document.createElement('div');
        item.className = 'card-selector-item';
        
        let miniBoardHtml = '<div class="mini-board-preview">';
        card.rows.forEach(row => {
            miniBoardHtml += '<div class="mini-row-preview">';
            row.forEach(cell => {
                const hasColor = cell.color !== null;
                const hasValue = cell.value !== null && cell.value !== undefined;
                let cellClass = 'mini-cell-preview';
                
                if (hasValue && typeof cell.value === 'number') {
                    let bg = '#2d2d2d';
                    let dotColor = '#ffffff';
                    
                    if (hasColor && cell.color) {
                        bg = coloresMap[cell.color] || bg;
                        dotColor = cell.color === 'yellow' ? '#222222' : '#ffffff';
                    }
                    
                    miniBoardHtml += `<div class="${cellClass}">${renderizarDado(cell.value, bg, dotColor)}</div>`;
                } else if (hasColor) {
                    cellClass += ` color-${cell.color}`;
                    miniBoardHtml += `<div class="${cellClass}"></div>`;
                } else {
                    cellClass += ' empty';
                    miniBoardHtml += `<div class="${cellClass}"></div>`;
                }
            });
            miniBoardHtml += '</div>';
        });
        miniBoardHtml += '</div>';
        
        let dotsHtml = '';
        for (let i = 0; i < card.difficulty; i++) {
            dotsHtml += '●';
        }
        for (let i = card.difficulty; i < 6; i++) {
            dotsHtml += '○';
        }
        
        item.innerHTML = `
            ${miniBoardHtml}
            <div class="card-difficulty">${dotsHtml}</div>
        `;
        
        item.addEventListener('click', () => selectInitialCard(card.id));
        grid.appendChild(item);
    });
    
    openModalById('cardSelectorModal');
}

function selectInitialCard(cardId) {
    if (gameState.isFinished) {
        showTemporaryMessage('⛔ La partida ya finalizó');
        return false;
    }
    
    const available = gameState.availableCards.map(c => c.id);
    if (!available.includes(cardId)) {
        showTemporaryMessage('Esta cartilla no está disponible para ti');
        return false;
    }
    
    if (gameState.cardSelectionInProgress) {
        return false;
    }
    gameState.cardSelectionInProgress = true;
    
    const isCreator = window.isRoomCreator || false;
    
    if (!isCreator && gameState.publicObjectives.length === 0) {
        showTemporaryMessage('⏳ Esperando objetivos del creador...');
        gameState.cardSelectionInProgress = false;
        
        let attempts = 0;
        const maxAttempts = 30;
        
        function esperarYSeleccionar() {
            attempts++;
            if (gameState.publicObjectives.length > 0) {
                ejecutarSeleccionCard(cardId);
                return;
            }
            if (attempts >= maxAttempts) {
                showTemporaryMessage('⚠️ No se recibieron objetivos - Usando fallback');
                const allPublics = [...OBJETIVOS_PUBLICOS];
                const shuffledPublics = allPublics.sort(() => Math.random() - 0.5);
                gameState.publicObjectives = shuffledPublics.slice(0, 3).map(o => o.id);
                if (gameState.tools.length === 0) {
                    const tools = seleccionarHerramientasParaRonda();
                    gameState.tools = tools;
                    herramientasState.herramientas_seleccionadas = tools;
                    herramientasState.herramientas_disponibles = tools;
                }
                ejecutarSeleccionCard(cardId);
                return;
            }
            setTimeout(esperarYSeleccionar, 100);
        }
        setTimeout(esperarYSeleccionar, 100);
        return false;
    }
    
    return ejecutarSeleccionCard(cardId);
}

function ejecutarSeleccionCard(cardId) {
    const card = getCardById(cardId);
    if (!card) {
        showTemporaryMessage('Error: Cartilla no encontrada');
        gameState.cardSelectionInProgress = false;
        return false;
    }
    
    gameState.selectedDifficulty = card.difficulty;
    inicializarFavores(card.difficulty);
    
    gameState.currentCardId = cardId;
    gameState.selectedCardId = cardId;
    gameState.initialCardSelectionDone = true;
    gameState.moveHistory = [];
    gameState.isFinished = false; // Resetear estado de finalización al empezar
    clearUndoHistory();
    window._savedCellStates = {};
    
    if (gameState.publicObjectives.length === 0) {
        console.warn('⚠️ Generando objetivos de emergencia');
        const allPublics = [...OBJETIVOS_PUBLICOS];
        const shuffledPublics = allPublics.sort(() => Math.random() - 0.5);
        gameState.publicObjectives = shuffledPublics.slice(0, 3).map(o => o.id);
    }
    if (gameState.tools.length === 0) {
        console.warn('⚠️ Generando herramientas de emergencia');
        const tools = seleccionarHerramientasParaRonda();
        gameState.tools = tools;
        herramientasState.herramientas_seleccionadas = tools;
        herramientasState.herramientas_disponibles = tools;
    }
    
    gameState.gameStarted = true;
    gameState.cardSelectionInProgress = false;
    
    closeModalById('cardSelectorModal');
    
    renderGameInfo();
    renderBoard();
    calculateScores();
    
    // Reactivar botón de Terminar
    const finishBtn = document.getElementById('finishGameBtn');
    if (finishBtn) {
        finishBtn.disabled = false;
        finishBtn.style.opacity = '1';
        finishBtn.style.cursor = 'pointer';
    }
    
    const gameInfo = document.getElementById('gameInfo');
    if (gameInfo) gameInfo.style.display = 'block';
    
    const startBtn = document.getElementById('startGameBtn');
    if (startBtn) {
        startBtn.textContent = 'Vitrinas';
        startBtn.style.opacity = '0.7';
        startBtn.style.cursor = 'default';
        startBtn.disabled = true;
    }
    
    if (window.broadcastScore) {
        window.broadcastScore('game_start');
    }
    
    showTemporaryMessage(`🎮 ¡Partida iniciada! Dificultad ${card.difficulty} - ${card.difficulty} favores`);
    return true;
}

// ============================================================
// RESET COMPLETO DE LA PARTIDA (SOLO CREADOR)
// ============================================================

function resetFullGame() {
    // Cualquier jugador puede reiniciar
    
    // Limpiar objetivos
    window.gameState.publicObjectives = [];
    window.gameState.tools = [];
    herramientasState.herramientas_seleccionadas = [];
    herramientasState.herramientas_disponibles = [];
    herramientasState.herramientas_usadas = [];
    herramientasState.herramientas_usadas_global = {};
    herramientasState.favores = { total: 0, gastados: 0, disponibles: 0 };
    
    // Limpiar colores
    coloresState.asignaciones = {};
    coloresState.coloresUsados = [];
    coloresState.coloresAsignados = false;
    coloresState.miColor = null;
    
    // Limpiar cartillas
    window.gameState.allPlayerCards = {};
    window.gameState.allPlayerPrivateObjectives = {};
    window.gameState.cardsDealt = false;
    window.gameState.availableCards = [];
    window.gameState.currentCardId = null;
    window.gameState.selectedCardId = null;
    window.gameState.initialCardSelectionDone = false;
    window.gameState.gameStarted = false;
    window.gameState.cardSelectionInProgress = false;
    window.gameState.moveHistory = [];
    window.gameState.selectedDifficulty = 0;
    window.gameState.privateObjectiveId = null;
    window.gameState.isFinished = false; // Resetear estado de finalización
    
    // Limpiar jugadores
    if (window.playersData) {
        Object.keys(window.playersData).forEach(id => {
            window.playersData[id].moves = [];
            window.playersData[id].score = 0;
            window.playersData[id].cardId = null;
            window.playersData[id].availableCards = [];
        });
    }
    
    // Limpiar deshacer
    if (typeof clearUndoHistory === 'function') clearUndoHistory();
    if (window._savedCellStates) window._savedCellStates = {};
    
    // Restaurar cartilla
    const card = getCurrentCard();
    if (card) {
        const originalCard = getCardById(window.gameState.currentCardId);
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
    
    // Ocultar game info
    const gameInfo = document.getElementById('gameInfo');
    if (gameInfo) gameInfo.style.display = 'none';
    
    renderBoard();
    renderLeaderboard();
    
    // Reactivar botón de Terminar
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
// FUNCIÓN PARA RECIBIR RESET COMPLETO DESDE MQTT
// ============================================================

function receiveFullResetFromMQTT(data) {
    if (!data || data.id === window.myId) return;
    
    console.log('🔄 Recibiendo reinicio completo de la partida');
    
    // ===== LIMPIAR TODO =====
    
    // 1. Limpiar objetivos
    window.gameState.publicObjectives = [];
    window.gameState.tools = [];
    herramientasState.herramientas_seleccionadas = [];
    herramientasState.herramientas_disponibles = [];
    herramientasState.herramientas_usadas = [];
    herramientasState.herramientas_usadas_global = {};
    herramientasState.favores = { total: 0, gastados: 0, disponibles: 0 };
    
    // 2. Limpiar colores
    coloresState.asignaciones = {};
    coloresState.coloresUsados = [];
    coloresState.coloresAsignados = false;
    coloresState.miColor = null;
    
    // 3. Limpiar cartillas
    window.gameState.allPlayerCards = {};
    window.gameState.allPlayerPrivateObjectives = {};
    window.gameState.cardsDealt = false;
    window.gameState.availableCards = [];
    window.gameState.currentCardId = null;
    window.gameState.selectedCardId = null;
    window.gameState.initialCardSelectionDone = false;
    window.gameState.gameStarted = false;
    window.gameState.cardSelectionInProgress = false;
    window.gameState.moveHistory = [];
    window.gameState.selectedDifficulty = 0;
    window.gameState.privateObjectiveId = null;
    window.gameState.isFinished = false; // Resetear estado de finalización
    
    // 4. Limpiar jugadores (excepto el creador)
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
    
    // 5. Limpiar deshacer
    if (typeof clearUndoHistory === 'function') clearUndoHistory();
    if (window._savedCellStates) window._savedCellStates = {};
    
    // 6. Restaurar la cartilla actual a su estado original
    const card = getCurrentCard();
    if (card) {
        const originalCard = getCardById(window.gameState.currentCardId);
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
    
    // 7. Ocultar game info
    const gameInfo = document.getElementById('gameInfo');
    if (gameInfo) gameInfo.style.display = 'none';
    
    // 8. Renderizar UI limpia
    renderBoard();
    renderLeaderboard();
    
    // 9. Restaurar botones
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
// USAR HERRAMIENTA
// ============================================================

function usarHerramientaUI(toolId) {
    if (gameState.isFinished) {
        showTemporaryMessage('⛔ La partida ya finalizó');
        return;
    }
    
    const info = getHerramientaInfo(toolId);
    if (!info) return;
    
    if (info.yaUsadaPorMi) {
        showTemporaryMessage('❌ Ya usaste esta herramienta');
        return;
    }
    
    if (!info.disponible) {
        showTemporaryMessage(`❌ No tienes suficientes favores (necesitas ${info.costo}, tienes ${herramientasState.favores.disponibles})`);
        return;
    }
    
    const tool = getHerramientaById(toolId);
    if (!tool) return;
    
    const resultado = usarHerramientaConFavores(toolId, window.myId || 'local');
    
    if (resultado.success) {
        showTemporaryMessage(`✅ "${tool.nombre}" usada (${resultado.costo} favor${resultado.costo > 1 ? 'es' : ''})`);
        
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
        showTemporaryMessage(`❌ ${resultado.razon}`);
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
            showTemporaryMessage(`🔧 ${jugadorNombre} usó "${tool.nombre}"`);
        }
    }
    
    renderGameInfo();
    renderBoard();
}

// ============================================================
// EXPORTAR
// ============================================================

window.gameState = gameState;
window.getCurrentCard = getCurrentCard;
window.handleBoxClick = handleBoxClick;
window.calculateScores = calculateScores;
window.calculateTotalScore = calculateTotalScore;
window.iniciarJuego = iniciarJuego;
window.usarHerramientaUI = usarHerramientaUI;
window.selectInitialCard = selectInitialCard;
window.showInitialCardSelector = showInitialCardSelector;
window.repartirCartillasUnicas = repartirCartillasUnicas;
window.ejecutarSeleccionCard = ejecutarSeleccionCard;
window.sincronizarHerramientasDesdeMQTT = sincronizarHerramientasDesdeMQTT;
window.resetFullGame = resetFullGame;
window.receiveFullResetFromMQTT = receiveFullResetFromMQTT;
window.finalizarPartida = finalizarPartida;
window.receiveGameFinishedFromMQTT = receiveGameFinishedFromMQTT;
window.getCardStateForSync = getCardStateForSync;
window.receiveCardStateFromMQTT = receiveCardStateFromMQTT;

console.log('✅ juego.js cargado - Con función finalizar partida');