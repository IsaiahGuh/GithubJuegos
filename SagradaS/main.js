// ===== MAIN.JS =====
// Punto de entrada del juego - SOLO INICIALIZACION

document.addEventListener('DOMContentLoaded', function() {
    // ============================================================
    // INICIALIZAR ESTADO DEL JUEGO
    // ============================================================
    
    // gameState (en juego.js) ya tiene: moveHistory, gameStarted, publicObjectives, tools, privateObjectiveId, selectedDifficulty, isFinished
    // cartillasState (en cartillas.js) ya tiene: allPlayerCards, allPlayerPrivateObjectives, availableCards, cardsDealt, cardSelectionInProgress, currentCardId, selectedCardId, initialCardSelectionDone
    
    // ============================================================
    // INICIALIZAR MODULOS
    // ============================================================
    
    // Modales (desde modales.js)
    if (typeof initModals === 'function') {
        initModals();
    }
    
    // UI (desde ui.js)
    if (typeof initUI === 'function') {
        initUI();
    }
    
    // Marcador (desde marcador.js)
    if (typeof initMarcadorModal === 'function') {
        initMarcadorModal();
    }
    
    // Colores (desde extra.js)
    if (typeof initColores === 'function') {
        initColores();
    }
    
    // ============================================================
    // OCULTAR GAME INFO INICIAL
    // ============================================================
    
    const gameInfo = document.getElementById('gameInfo');
    if (gameInfo) {
        gameInfo.style.display = 'none';
    }
    
    // ============================================================
    // ATAJOS DE TECLADO
    // ============================================================
    
    document.addEventListener('keydown', function(e) {
        // Ctrl+Z para deshacer
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            if (typeof undoLastMark === 'function') {
                undoLastMark();
            }
        }
        
        // Escape para cerrar modales
        if (e.key === 'Escape') {
            if (typeof closeMarcador === 'function' && window.marcadorState?.isOpen) {
                closeMarcador();
            }
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(modal => {
                if (modal.style.display === 'flex' && !modal.classList.contains('no-close-on-outside')) {
                    if (typeof closeModalById === 'function') {
                        closeModalById(modal.id);
                    }
                }
            });
        }
    });
    
    console.log('SagradaS - Juego cargado correctamente');
});