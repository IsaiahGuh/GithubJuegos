// ===== MARCADOR.JS =====
// Sistema de marcado con deshacer LIFO

// Estado del marcador
let marcadorState = {
    isOpen: false,
    targetRow: null,
    targetCol: null,
    selectedColor: null,
    selectedNumber: null,
    availableColors: ['red', 'yellow', 'green', 'blue', 'purple'],
    availableNumbers: [1, 2, 3, 4, 5, 6]
};

// Colores para mostrar en el modal (en español)
const COLOR_DISPLAY = {
    'red': 'Rojo',
    'yellow': 'Amarillo',
    'green': 'Verde',
    'blue': 'Celeste',
    'purple': 'Morado'
};

// Colores en formato CSS para los botones
const COLOR_STYLES = {
    'red': '#940219',
    'yellow': '#F1B215',
    'green': '#437F3F',
    'blue': '#057599',
    'purple': '#5D4080'
};

// Inicializar el modal de marcador
function initMarcadorModal() {
    if (!document.getElementById('marcadorModal')) {
        const modal = document.createElement('div');
        modal.id = 'marcadorModal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-box" style="max-width: 350px; padding: 20px; background: var(--bg-panel);">
                <div id="marcadorColors" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 15px;"></div>
                <div id="marcadorNumbers" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeMarcador();
            }
        });
    }
}

// Abrir el marcador para una casilla específica
function openMarcador(row, col) {
    const moveId = `${row}-${col}`;
    const isMarked = window.gameState.moveHistory.includes(moveId);
    
    if (isMarked && canUndoBox(row, col)) {
        undoLastMark();
        return;
    }
    
    if (isMarked && !canUndoBox(row, col)) {
        showTemporaryMessage('Solo puedes desmarcar la ultima casilla');
        return;
    }
    
    const card = getCurrentCard();
    const cell = card.rows[row][col];
    
    marcadorState.targetRow = row;
    marcadorState.targetCol = col;
    marcadorState.isOpen = true;
    marcadorState.selectedColor = null;
    marcadorState.selectedNumber = null;
    
    const hasValue = cell.value !== null && cell.value !== undefined;
    const hasColor = cell.color !== null && cell.color !== undefined;
    
    let availableColors = [...marcadorState.availableColors];
    let availableNumbers = [...marcadorState.availableNumbers];
    
    if (!hasValue && !hasColor) {
        // Mostrar todos los colores y números
    }
    else if (hasValue && !hasColor) {
        availableColors = [...marcadorState.availableColors];
        availableNumbers = [cell.value];
    }
    else if (!hasValue && hasColor) {
        availableColors = [cell.color];
        availableNumbers = [...marcadorState.availableNumbers];
    }
    else if (hasValue && hasColor) {
        availableColors = [...marcadorState.availableColors];
        availableNumbers = [...marcadorState.availableNumbers];
        marcadorState.selectedColor = cell.color;
        marcadorState.selectedNumber = cell.value;
    }
    
    renderMarcadorOptions(availableColors, availableNumbers);
    openModalById('marcadorModal');
}

// Renderizar opciones de color y número
function renderMarcadorOptions(availableColors, availableNumbers) {
    const colorsContainer = document.getElementById('marcadorColors');
    colorsContainer.innerHTML = '';
    
    // ===== COLORES =====
    availableColors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'marcador-option color-option';
        btn.style.cssText = `
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 3px solid ${marcadorState.selectedColor === color ? 'white' : 'transparent'};
            background: ${COLOR_STYLES[color]};
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: ${marcadorState.selectedColor === color ? '0 0 20px rgba(255,255,255,0.3)' : '0 2px 8px rgba(0,0,0,0.3)'};
            transform: ${marcadorState.selectedColor === color ? 'scale(1.1)' : 'scale(1)'};
        `;
        btn.title = COLOR_DISPLAY[color] || color;
        btn.dataset.color = color;
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            marcadorState.selectedColor = color;
            
            const card = getCurrentCard();
            const cell = card.rows[marcadorState.targetRow][marcadorState.targetCol];
            const hasValue = cell.value !== null && cell.value !== undefined;
            
            if (hasValue || marcadorState.selectedNumber !== null) {
                applyMarkAndClose();
            } else {
                renderMarcadorOptions(availableColors, availableNumbers);
            }
        });
        
        colorsContainer.appendChild(btn);
    });
    
    // ===== NÚMEROS CON DADO (SIN FONDO) =====
    const numbersContainer = document.getElementById('marcadorNumbers');
    numbersContainer.innerHTML = '';
    
    availableNumbers.forEach(num => {
        const btn = document.createElement('button');
        btn.className = `dado-option ${marcadorState.selectedNumber === num ? 'selected' : ''}`;
        btn.dataset.valor = num;
        
        // Siempre puntos blancos, sin fondo
        const dotColor = marcadorState.selectedNumber === num ? '#4caf50' : '#ffffff';
        btn.innerHTML = renderizarDado(num, null, dotColor);
        
        // Resaltar el seleccionado con borde
        if (marcadorState.selectedNumber === num) {
            btn.style.borderColor = '#4caf50';
            btn.style.boxShadow = '0 0 20px rgba(76,175,80,0.4)';
        }
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            marcadorState.selectedNumber = num;
            
            const card = getCurrentCard();
            const cell = card.rows[marcadorState.targetRow][marcadorState.targetCol];
            const hasColor = cell.color !== null && cell.color !== undefined;
            
            if (hasColor || marcadorState.selectedColor !== null) {
                applyMarkAndClose();
            } else {
                renderMarcadorOptions(availableColors, availableNumbers);
            }
        });
        
        numbersContainer.appendChild(btn);
    });
}

// Aplicar marcado y cerrar
function applyMarkAndClose() {
    if (marcadorState.selectedColor !== null || marcadorState.selectedNumber !== null) {
        const row = marcadorState.targetRow;
        const col = marcadorState.targetCol;
        const card = getCurrentCard();
        const cell = card.rows[row][col];
        const moveId = `${row}-${col}`;
        
        const isMarked = window.gameState.moveHistory.includes(moveId);
        
        if (!isMarked) {
            saveCellState(row, col);
            window.gameState.moveHistory.push(moveId);
            registerMark(row, col);
        }
        
        if (marcadorState.selectedColor !== null) {
            cell.color = marcadorState.selectedColor;
        }
        if (marcadorState.selectedNumber !== null) {
            cell.value = marcadorState.selectedNumber;
        }
        
        closeMarcador();
        renderBoard();
        
        // ✅ CALCULAR PUNTAJE Y FORZAR BROADCAST
        calculateScores();
        
        // ✅ FORZAR ACTUALIZACIÓN DEL LEADERBOARD LOCAL
        if (window.renderLeaderboard) {
            window.renderLeaderboard();
        }
        
        // ✅ ACTUALIZAR EL CARDSTATE DEL JUGADOR LOCAL PARA EL ZOOM
        actualizarCardStateLocal();
        
        // ✅ FORZAR BROADCAST CON EL PUNTAJE ACTUALIZADO
        if (window.broadcastScore) {
            setTimeout(() => {
                window.broadcastScore('sync');
            }, 100);
        }
        
        // ✅ SI EL ZOOM ESTÁ ABIERTO, ACTUALIZARLO EN TIEMPO REAL
        const zoomModal = document.getElementById('zoomModal');
        if (zoomModal && zoomModal.style.display === 'flex') {
            // Re-renderizar el zoom con los datos actualizados
            const zoomPlayerId = zoomModal.dataset.currentPlayerId;
            if (zoomPlayerId && typeof abrirZoomJugador === 'function') {
                abrirZoomJugador(zoomPlayerId);
            }
        }
    }
}

// ✅ NUEVA FUNCIÓN: Actualizar el cardState del jugador local
function actualizarCardStateLocal() {
    const cardState = typeof window.getCardStateForSync === 'function' 
        ? window.getCardStateForSync() 
        : null;
    
    if (cardState && window.playersData && window.playersData[window.myId]) {
        window.playersData[window.myId].cardState = cardState;
    }
    
    if (cardState) {
        if (!window._playerCardStates) {
            window._playerCardStates = {};
        }
        window._playerCardStates[window.myId] = cardState;
    }
}

// Cerrar el marcador
function closeMarcador() {
    marcadorState.isOpen = false;
    marcadorState.targetRow = null;
    marcadorState.targetCol = null;
    marcadorState.selectedColor = null;
    marcadorState.selectedNumber = null;
    closeModalById('marcadorModal');
}

// Sobrescribir la función handleBoxClick para usar el marcador
window.handleBoxClick = function(row, col) {
    openMarcador(row, col);
};

// Inicializar el modal cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initMarcadorModal();
});

// Exportar funciones
window.openMarcador = openMarcador;
window.closeMarcador = closeMarcador;
window.applyMarkAndClose = applyMarkAndClose;
window.marcadorState = marcadorState;
window.initMarcadorModal = initMarcadorModal;
window.renderMarcadorOptions = renderMarcadorOptions;
window.actualizarCardStateLocal = actualizarCardStateLocal;