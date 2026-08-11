// ===== CARTILLAS.JS =====
// Definicion de las 21 cartillas del juego SagradaS + Gestion de cartillas

const CARTILLAS = [
    // Cartilla 1 (dif 3)
    {
        id: 1,
        difficulty: 3,
        rows: [
            [{ value: null, color: null }, { value: null, color: 'blue' }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }],
            [{ value: null, color: null }, { value: 4, color: null }, { value: null, color: null }, { value: null, color: 'red' }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: 5, color: null }, { value: null, color: 'yellow' }, { value: null, color: null }],
            [{ value: null, color: 'green' }, { value: 3, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'purple' }]
        ]
    },
    // Cartilla 2 (dif 3)
    {
        id: 2,
        difficulty: 3,
        rows: [
            [{ value: null, color: null }, { value: null, color: 'red' }, { value: null, color: null }, { value: 5, color: null }, { value: null, color: null }],
            [{ value: null, color: 'purple' }, { value: 4, color: null }, { value: null, color: null }, { value: null, color: 'green' }, { value: 3, color: null }],
            [{ value: 6, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'blue' }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: 'yellow' }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 3 (dif 3)
    {
        id: 3,
        difficulty: 3,
        rows: [
            [{ value: null, color: null }, { value: 4, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: 6, color: null }],
            [{ value: null, color: 'red' }, { value: null, color: null }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: 'red' }, { value: null, color: 'purple' }, { value: 1, color: null }],
            [{ value: null, color: 'blue' }, { value: null, color: 'yellow' }, { value: null, color: null }, { value: null, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 4 (dif 3)
    {
        id: 4,
        difficulty: 3,
        rows: [
            [{ value: null, color: 'blue' }, { value: 6, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }],
            [{ value: null, color: null }, { value: 3, color: null }, { value: null, color: 'blue' }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 5, color: null }, { value: 6, color: null }, { value: 2, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: null }, { value: 1, color: null }, { value: null, color: 'green' }]
        ]
    },
    // Cartilla 5 (dif 4)
    {
        id: 5,
        difficulty: 4,
        rows: [
            [{ value: null, color: 'yellow' }, { value: null, color: null }, { value: 6, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 1, color: null }, { value: 5, color: null }, { value: null, color: null }, { value: 2, color: null }],
            [{ value: 3, color: null }, { value: null, color: 'yellow' }, { value: null, color: 'red' }, { value: null, color: 'purple' }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: 4, color: null }, { value: 3, color: null }, { value: null, color: 'red' }]
        ]
    },
    // Cartilla 6 (dif 5)
    {
        id: 6,
        difficulty: 5,
        rows: [
            [{ value: 3, color: null }, { value: 4, color: null }, { value: 1, color: null }, { value: 5, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 6, color: null }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: null, color: 'red' }],
            [{ value: 5, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: null, color: 'red' }, { value: 6, color: null }]
        ]
    },
    // Cartilla 7 (dif 5)
    {
        id: 7,
        difficulty: 5,
        rows: [
            [{ value: 5, color: null }, { value: null, color: 'green' }, { value: null, color: 'blue' }, { value: null, color: 'purple' }, { value: 2, color: null }],
            [{ value: null, color: 'purple' }, { value: null, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }],
            [{ value: null, color: 'yellow' }, { value: null, color: null }, { value: 6, color: null }, { value: null, color: null }, { value: null, color: 'purple' }],
            [{ value: 1, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'green' }, { value: 4, color: null }]
        ]
    },
    // Cartilla 8 (dif 5)
    {
        id: 8,
        difficulty: 5,
        rows: [
            [{ value: null, color: 'yellow' }, { value: null, color: null }, { value: 2, color: null }, { value: null, color: null }, { value: 6, color: null }],
            [{ value: null, color: null }, { value: 4, color: null }, { value: null, color: null }, { value: 5, color: null }, { value: null, color: 'yellow' }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: 5, color: null }],
            [{ value: 1, color: null }, { value: 2, color: null }, { value: null, color: 'yellow' }, { value: 3, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 9 (dif 5)
    {
        id: 9,
        difficulty: 5,
        rows: [
            [{ value: 4, color: null }, { value: null, color: null }, { value: 2, color: null }, { value: 5, color: null }, { value: null, color: 'green' }],
            [{ value: null, color: null }, { value: null, color: null }, { value: 6, color: null }, { value: null, color: 'green' }, { value: 2, color: null }],
            [{ value: null, color: null }, { value: 3, color: null }, { value: null, color: 'green' }, { value: 4, color: null }, { value: null, color: null }],
            [{ value: 5, color: null }, { value: null, color: 'green' }, { value: 1, color: null }, { value: null, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 10 (dif 5)
    {
        id: 10,
        difficulty: 5,
        rows: [
            [{ value: null, color: 'purple' }, { value: 6, color: null }, { value: null, color: null }, { value: null, color: null }, { value: 3, color: null }],
            [{ value: 5, color: null }, { value: null, color: 'purple' }, { value: 3, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 2, color: null }, { value: null, color: 'purple' }, { value: 1, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 1, color: null }, { value: 5, color: null }, { value: null, color: 'purple' }, { value: 4, color: null }]
        ]
    },
    // Cartilla 11 (dif 6)
    {
        id: 11,
        difficulty: 6,
        rows: [
            [{ value: 6, color: null }, { value: null, color: 'blue' }, { value: null, color: null }, { value: null, color: null }, { value: 1, color: null }],
            [{ value: null, color: null }, { value: 5, color: null }, { value: null, color: 'blue' }, { value: null, color: null }, { value: null, color: null }],
            [{ value: 4, color: null }, { value: null, color: 'red' }, { value: 2, color: null }, { value: null, color: 'blue' }, { value: null, color: null }],
            [{ value: null, color: 'green' }, { value: 6, color: null }, { value: null, color: 'yellow' }, { value: 3, color: null }, { value: null, color: 'purple' }]
        ]
    },
    // Cartilla 12 (dif 6)
    {
        id: 12,
        difficulty: 6,
        rows: [
            [{ value: null, color: null }, { value: null, color: null }, { value: 1, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: 1, color: null }, { value: null, color: 'green' }, { value: 3, color: null }, { value: null, color: 'blue' }, { value: 2, color: null }],
            [{ value: null, color: 'blue' }, { value: 5, color: null }, { value: 4, color: null }, { value: 6, color: null }, { value: null, color: 'green' }],
            [{ value: null, color: null }, { value: null, color: 'blue' }, { value: 5, color: null }, { value: null, color: 'green' }, { value: null, color: null }]
        ]
    },
    // Cartilla 13 (dif 3) - identica a la 3
    {
        id: 13,
        difficulty: 3,
        rows: [
            [{ value: null, color: null }, { value: 4, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: 6, color: null }],
            [{ value: null, color: 'red' }, { value: null, color: null }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: 'red' }, { value: null, color: 'purple' }, { value: 1, color: null }],
            [{ value: null, color: 'blue' }, { value: null, color: 'yellow' }, { value: null, color: null }, { value: null, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 14 (dif 4)
    {
        id: 14,
        difficulty: 4,
        rows: [
            [{ value: 1, color: null }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: 'green' }, { value: null, color: 'blue' }, { value: 4, color: null }, { value: 1, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: 'green' }, { value: null, color: 'blue' }, { value: 6, color: null }, { value: 1, color: null }],
            [{ value: 6, color: null }, { value: 3, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 15 (dif 6)
    {
        id: 15,
        difficulty: 6,
        rows: [
            [{ value: 2, color: null }, { value: null, color: null }, { value: 5, color: null }, { value: null, color: null }, { value: 1, color: null }],
            [{ value: null, color: 'yellow' }, { value: 6, color: null }, { value: null, color: 'purple' }, { value: 2, color: null }, { value: null, color: 'red' }],
            [{ value: null, color: null }, { value: null, color: 'blue' }, { value: 4, color: null }, { value: null, color: 'green' }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 3, color: null }, { value: null, color: null }, { value: 5, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 16 (dif 6)
    {
        id: 16,
        difficulty: 6,
        rows: [
            [{ value: null, color: null }, { value: 5, color: null }, { value: null, color: 'green' }, { value: null, color: null }, { value: null, color: null }],
            [{ value: 5, color: null }, { value: null, color: 'blue' }, { value: 1, color: null }, { value: null, color: null }, { value: 6, color: null }],
            [{ value: 2, color: null }, { value: null, color: null }, { value: null, color: 'blue' }, { value: null, color: 'purple' }, { value: null, color: 'green' }],
            [{ value: null, color: 'purple' }, { value: null, color: null }, { value: 3, color: null }, { value: 6, color: null }, { value: 1, color: null }]
        ]
    },
    // Cartilla 17 (dif 3)
    {
        id: 17,
        difficulty: 3,
        rows: [
            [{ value: 1, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: 5, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: 'yellow' }, { value: null, color: null }, { value: null, color: null }, { value: 6, color: null }],
            [{ value: null, color: 'yellow' }, { value: 3, color: null }, { value: null, color: null }, { value: 2, color: null }, { value: null, color: 'green' }]
        ]
    },
    // Cartilla 18 (dif 6)
    {
        id: 18,
        difficulty: 6,
        rows: [
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: 'red' }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: 'yellow' }, { value: null, color: 'red' }, { value: 5, color: null }, { value: null, color: 'blue' }, { value: null, color: 'purple' }],
            [{ value: 1, color: null }, { value: null, color: null }, { value: null, color: 'purple' }, { value: null, color: null }, { value: 2, color: null }],
            [{ value: 3, color: null }, { value: null, color: 'yellow' }, { value: 6, color: null }, { value: null, color: 'red' }, { value: 5, color: null }]
        ]
    },
    // Cartilla 19 (dif 5)
    {
        id: 19,
        difficulty: 5,
        rows: [
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'red' }, { value: 5, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: 'purple' }, { value: 4, color: null }, { value: null, color: 'blue' }],
            [{ value: null, color: null }, { value: null, color: 'blue' }, { value: 3, color: null }, { value: null, color: 'yellow' }, { value: 6, color: null }],
            [{ value: null, color: 'yellow' }, { value: 2, color: null }, { value: null, color: 'green' }, { value: 1, color: null }, { value: null, color: 'red' }]
        ]
    },
    // Cartilla 20 (dif 5)
    {
        id: 20,
        difficulty: 5,
        rows: [
            [{ value: null, color: null }, { value: null, color: 'blue' }, { value: null, color: 'red' }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 4, color: null }, { value: 5, color: null }, { value: null, color: null }, { value: null, color: 'blue' }],
            [{ value: null, color: 'blue' }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: 'red' }, { value: 5, color: null }],
            [{ value: 6, color: null }, { value: null, color: 'red' }, { value: 3, color: null }, { value: 1, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 21 (dif 4)
    {
        id: 21,
        difficulty: 4,
        rows: [
            [{ value: null, color: 'yellow' }, { value: null, color: null }, { value: 6, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 1, color: null }, { value: 5, color: null }, { value: null, color: null }, { value: 2, color: null }],
            [{ value: 3, color: null }, { value: null, color: 'yellow' }, { value: null, color: 'red' }, { value: null, color: 'purple' }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: 4, color: null }, { value: 3, color: null }, { value: null, color: 'red' }]
        ]
    }
];

// ===== MAPA DE COLORES =====
const COLOR_MAP = {
    'rojo': 'color-red',
    'amarillo': 'color-yellow',
    'verde': 'color-green',
    'celeste': 'color-blue',
    'morado': 'color-purple',
    'amarllo': 'color-yellow',
    'blue': 'color-blue',
    'red': 'color-red',
    'yellow': 'color-yellow',
    'green': 'color-green',
    'purple': 'color-purple'
};

// ============================================================
// FUNCIONES DE ACCESO A CARTILLAS
// ============================================================

function getCardById(id) {
    return CARTILLAS.find(c => c.id === id) || CARTILLAS[0];
}

function getAllCards() {
    return CARTILLAS;
}

function getCardsByDifficulty(difficulty) {
    return CARTILLAS.filter(c => c.difficulty === difficulty);
}

function getCellColorClass(cell) {
    if (cell.color) {
        return COLOR_MAP[cell.color] || null;
    }
    return null;
}

function hasValue(cell) {
    return cell.value !== null && cell.value !== undefined;
}

// ============================================================
// GESTION DE CARTILLAS (logica de reparto y seleccion)
// ============================================================

let cartillasState = {
    allPlayerCards: {},
    allPlayerPrivateObjectives: {},
    availableCards: [],
    cardsDealt: false,
    cardSelectionInProgress: false,
    currentCardId: null,
    selectedCardId: null,
    initialCardSelectionDone: false
};

// ============================================================
// REPARTIR CARTILLAS
// ============================================================

function repartirCartillasUnicas() {
    if (window.gameState.isFinished) {
        showTemporaryMessage('La partida ya finalizo');
        return;
    }
    
    if (cartillasState.cardsDealt) {
        showTemporaryMessage('Las cartillas ya fueron repartidas');
        if (cartillasState.availableCards.length > 0) {
            showInitialCardSelector(cartillasState.availableCards);
        }
        return;
    }
    
    if (window.isRoomCreator) {
        if (typeof asignarColoresAJugadores === 'function') {
            asignarColoresAJugadores();
            if (typeof sincronizarColores === 'function') {
                sincronizarColores();
            }
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
        if (window.gameState.publicObjectives.length === 0) {
            if (typeof generarObjetivosYHerramientas === 'function') {
                generarObjetivosYHerramientas();
            }
        }
        if (window.gameState.tools.length === 0) {
            const tools = seleccionarHerramientasParaRonda();
            window.gameState.tools = tools;
            herramientasState.herramientas_seleccionadas = tools;
            herramientasState.herramientas_disponibles = tools;
        }
    } else {
        if (window.gameState.publicObjectives.length === 0) {
            showTemporaryMessage('Esperando objetivos del creador...');
            
            let attempts = 0;
            const maxAttempts = 30;
            
            function esperarObjetivos() {
                attempts++;
                if (window.gameState.publicObjectives.length > 0) {
                    continuarReparto(isCreator, playerIds, playerCards, playerPrivateObjectives);
                    return;
                }
                if (attempts >= maxAttempts) {
                    console.warn('Timeout esperando objetivos - Generando locales');
                    const allPublics = [...OBJETIVOS_PUBLICOS];
                    const shuffledPublics = allPublics.sort(() => Math.random() - 0.5);
                    window.gameState.publicObjectives = shuffledPublics.slice(0, 3).map(o => o.id);
                    const tools = seleccionarHerramientasParaRonda();
                    window.gameState.tools = tools;
                    herramientasState.herramientas_seleccionadas = tools;
                    herramientasState.herramientas_disponibles = tools;
                    showTemporaryMessage('Usando objetivos locales (fallback)');
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
    cartillasState.allPlayerCards = playerCards;
    cartillasState.allPlayerPrivateObjectives = playerPrivateObjectives;
    cartillasState.cardsDealt = true;
    
    const myCards = playerCards[window.myId] || [];
    cartillasState.availableCards = myCards.map(function(id) {
        return getCardById(id);
    }).filter(function(c) { return c !== null; });
    
    console.log('Cartillas repartidas para ' + window.myName + ':', myCards);
    console.log('Cartillas disponibles:', cartillasState.availableCards);
    
    window.gameState.privateObjectiveId = playerPrivateObjectives[window.myId] || null;
    
    if (cartillasState.availableCards.length > 0 && !cartillasState.initialCardSelectionDone) {
        showTemporaryMessage('Cartillas repartidas, selecciona la tuya');
        if (typeof showInitialCardSelector === 'function') {
            showInitialCardSelector(cartillasState.availableCards);
        }
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
            publicObjectives: window.gameState.publicObjectives,
            tools: window.gameState.tools,
            isCreator: isCreator,
            coloresAsignados: coloresState.coloresAsignados ? coloresState.asignaciones : null,
            coloresUsados: coloresState.coloresAsignados ? coloresState.coloresUsados : null
        };
        window.broadcastScore('cards_dealt', payload);
    }
    
    if (isCreator && cartillasState.initialCardSelectionDone) {
        renderGameInfo();
    }
    
    const msg = isCreator ? 
        'Cartillas repartidas - Eres el creador' :
        'Cartillas repartidas - Selecciona tu cartilla';
    showTemporaryMessage(msg);
}

function iniciarJuego() {
    if (window.gameState.isFinished) {
        showTemporaryMessage('La partida ya finalizo');
        return;
    }
    
    if (window.gameState.gameStarted && cartillasState.initialCardSelectionDone) {
        showTemporaryMessage('La partida ya esta en curso');
        return;
    }
    
    if (cartillasState.cardsDealt && cartillasState.availableCards.length > 0) {
        showInitialCardSelector(cartillasState.availableCards);
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
    if (window.gameState.isFinished) {
        showTemporaryMessage('La partida ya finalizo');
        return false;
    }
    
    const available = cartillasState.availableCards.map(c => c.id);
    if (!available.includes(cardId)) {
        showTemporaryMessage('Esta cartilla no esta disponible para ti');
        return false;
    }
    
    if (cartillasState.cardSelectionInProgress) {
        return false;
    }
    cartillasState.cardSelectionInProgress = true;
    
    const isCreator = window.isRoomCreator || false;
    
    if (!isCreator && window.gameState.publicObjectives.length === 0) {
        showTemporaryMessage('Esperando objetivos del creador...');
        cartillasState.cardSelectionInProgress = false;
        
        let attempts = 0;
        const maxAttempts = 30;
        
        function esperarYSeleccionar() {
            attempts++;
            if (window.gameState.publicObjectives.length > 0) {
                ejecutarSeleccionCard(cardId);
                return;
            }
            if (attempts >= maxAttempts) {
                showTemporaryMessage('No se recibieron objetivos - Usando fallback');
                const allPublics = [...OBJETIVOS_PUBLICOS];
                const shuffledPublics = allPublics.sort(() => Math.random() - 0.5);
                window.gameState.publicObjectives = shuffledPublics.slice(0, 3).map(o => o.id);
                if (window.gameState.tools.length === 0) {
                    const tools = seleccionarHerramientasParaRonda();
                    window.gameState.tools = tools;
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
        cartillasState.cardSelectionInProgress = false;
        return false;
    }
    
    window.gameState.selectedDifficulty = card.difficulty;
    inicializarFavores(card.difficulty);
    
    cartillasState.currentCardId = cardId;
    cartillasState.selectedCardId = cardId;
    cartillasState.initialCardSelectionDone = true;
    window.gameState.currentCardId = cardId;
    window.gameState.moveHistory = [];
    window.gameState.isFinished = false;
    clearUndoHistory();
    window._savedCellStates = {};
    
    if (window.gameState.publicObjectives.length === 0) {
        console.warn('Generando objetivos de emergencia');
        const allPublics = [...OBJETIVOS_PUBLICOS];
        const shuffledPublics = allPublics.sort(() => Math.random() - 0.5);
        window.gameState.publicObjectives = shuffledPublics.slice(0, 3).map(o => o.id);
    }
    if (window.gameState.tools.length === 0) {
        console.warn('Generando herramientas de emergencia');
        const tools = seleccionarHerramientasParaRonda();
        window.gameState.tools = tools;
        herramientasState.herramientas_seleccionadas = tools;
        herramientasState.herramientas_disponibles = tools;
    }
    
    window.gameState.gameStarted = true;
    cartillasState.cardSelectionInProgress = false;
    
    closeModalById('cardSelectorModal');
    
    renderGameInfo();
    renderBoard();
    calculateScores();
    
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
    
    showTemporaryMessage('Partida iniciada! Dificultad ' + card.difficulty + ' - ' + card.difficulty + ' favores');
    return true;
}

// ============================================================
// OBTENER CARTILLA ACTUAL
// ============================================================

function getCurrentCard() {
    const cardId = cartillasState.currentCardId || window.gameState.currentCardId;
    return getCardById(cardId) || getCardById(1);
}

// ============================================================
// EXPORTAR
// ============================================================

window.CARTILLAS = CARTILLAS;
window.COLOR_MAP = COLOR_MAP;
window.getCardById = getCardById;
window.getAllCards = getAllCards;
window.getCardsByDifficulty = getCardsByDifficulty;
window.getCellColorClass = getCellColorClass;
window.hasValue = hasValue;
window.cartillasState = cartillasState;
window.repartirCartillasUnicas = repartirCartillasUnicas;
window.continuarReparto = continuarReparto;
window.showInitialCardSelector = showInitialCardSelector;
window.selectInitialCard = selectInitialCard;
window.ejecutarSeleccionCard = ejecutarSeleccionCard;
window.iniciarJuego = iniciarJuego;
window.getCurrentCard = getCurrentCard;

console.log('cartillas.js cargado - Definiciones y gestion de cartillas');