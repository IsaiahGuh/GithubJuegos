// ===== DESHACER.JS =====
// Sistema de deshacer con LIFO (Last In First Out)

// Estado del sistema de deshacer
let undoState = {
    history: [],           
    lastMarked: null,     
    isProcessing: false   
};

// Guardar el estado de una casilla antes de marcarla
function saveCellState(row, col) {
    const card = getCurrentCard();
    const cell = card.rows[row][col];
    
    // Guardar una copia del estado original de la celda
    // Esto se usa para saber que se debe restaurar al desmarcar
    if (!window._savedCellStates) {
        window._savedCellStates = {};
    }
    
    const key = `${row}-${col}`;
    window._savedCellStates[key] = {
        color: cell.color,
        value: cell.value
    };
}

// Obtener el estado guardado de una casilla
function getSavedCellState(row, col) {
    const key = `${row}-${col}`;
    if (window._savedCellStates && window._savedCellStates[key]) {
        return window._savedCellStates[key];
    }
    return null;
}

// Obtener la ultima casilla marcada
function getLastMarked() {
    if (undoState.history.length === 0) return null;
    const lastId = undoState.history[undoState.history.length - 1];
    const [row, col] = lastId.split('-').map(Number);
    return { row, col, id: lastId };
}

// Verificar si una casilla es la ultima marcada
function isLastMarked(row, col) {
    const moveId = `${row}-${col}`;
    if (undoState.history.length === 0) return false;
    return undoState.history[undoState.history.length - 1] === moveId;
}

// Desmarcar la ultima casilla
function undoLastMark() {
    if (undoState.isProcessing) return false;
    if (undoState.history.length === 0) return false;
    
    undoState.isProcessing = true;
    
    try {
        const lastId = undoState.history.pop();
        const [row, col] = lastId.split('-').map(Number);
        
        // Obtener el estado guardado de la casilla ANTES de marcarla
        const savedState = getSavedCellState(row, col);
        const card = getCurrentCard();
        const cell = card.rows[row][col];
        
        if (savedState) {
            // Restaurar exactamente al estado que tenia antes de marcar
            cell.color = savedState.color;
            cell.value = savedState.value;
            
            // Eliminar el estado guardado
            const key = `${row}-${col}`;
            if (window._savedCellStates) {
                delete window._savedCellStates[key];
            }
        } else {
            // Si no hay estado guardado (por seguridad), restaurar al original de la carta
            const originalCard = getCardById(window.gameState.currentCardId);
            const originalCell = originalCard.rows[row][col];
            cell.color = originalCell.color;
            cell.value = originalCell.value;
        }
        
        // Eliminar del historial de juego
        const posInHistory = window.gameState.moveHistory.indexOf(lastId);
        if (posInHistory !== -1) {
            window.gameState.moveHistory.splice(posInHistory, 1);
        }
        
        // Actualizar ultima marcada
        undoState.lastMarked = undoState.history.length > 0 ? 
            undoState.history[undoState.history.length - 1] : null;
        
        // Re-renderizar
        renderBoard();
        calculateScores();
        
        // Sincronizar en multijugador
        if (window.broadcastScore) {
            window.broadcastScore('sync');
        }
        
        return true;
    } finally {
        undoState.isProcessing = false;
    }
}

// Registrar una nueva marca
function registerMark(row, col) {
    const moveId = `${row}-${col}`;
    
    if (undoState.history.includes(moveId)) {
        return false;
    }
    
    // Guardar el estado actual de la celda ANTES de marcarla
    saveCellState(row, col);
    
    undoState.history.push(moveId);
    undoState.lastMarked = moveId;
    
    return true;
}

// Verificar si una casilla esta marcada y es la ultima
function canUndoBox(row, col) {
    const moveId = `${row}-${col}`;
    return undoState.history.length > 0 && 
           undoState.history[undoState.history.length - 1] === moveId;
}

// Obtener estado completo de deshacer
function getUndoState() {
    return {
        history: [...undoState.history],
        lastMarked: undoState.lastMarked,
        canUndo: undoState.history.length > 0,
        totalMarks: undoState.history.length
    };
}

// Limpiar historial de deshacer
function clearUndoHistory() {
    undoState.history = [];
    undoState.lastMarked = null;
    undoState.isProcessing = false;
    window._savedCellStates = {};
}

// Exportar funciones
window.undoState = undoState;
window.getLastMarked = getLastMarked;
window.isLastMarked = isLastMarked;
window.undoLastMark = undoLastMark;
window.registerMark = registerMark;
window.canUndoBox = canUndoBox;
window.getUndoState = getUndoState;
window.clearUndoHistory = clearUndoHistory;
window.saveCellState = saveCellState;
window.getSavedCellState = getSavedCellState;